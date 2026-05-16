import stripe
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from supabase import Client

from app.config import get_settings
from app.supabase_client import get_supabase_client
from app.middleware.auth import CurrentUser
from app.schemas.schemas import (
    CreateCheckoutRequest,
    CreateCheckoutResponse,
    SubscriptionResponse,
)

settings = get_settings()
router = APIRouter(prefix="/stripe", tags=["Stripe"])

# ── Create Checkout Session ────────────────────────────────────────────────────
@router.post("/subscribe", response_model=CreateCheckoutResponse)
async def create_checkout_session(
    payload: CreateCheckoutRequest,
    current_user: CurrentUser,
    supabase: Client = Depends(get_supabase_client),
):
    """Create a Stripe Checkout session for Pro subscription."""
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured")

    stripe.api_key = settings.stripe_secret_key

    # Ensure Stripe customer exists
    customer_id = current_user.get("stripe_customer_id")
    if not customer_id:
        customer = stripe.Customer.create(
            email=current_user["email"],
            name=current_user.get("full_name") or "",
            metadata={"user_id": str(current_user["id"])},
        )
        customer_id = customer.id
        supabase.table("users").update({"stripe_customer_id": customer_id}).eq("id", current_user["id"]).execute()

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": settings.stripe_pro_price_id, "quantity": 1}],
        mode="subscription",
        success_url=payload.success_url,
        cancel_url=payload.cancel_url,
        metadata={"user_id": str(current_user["id"])},
    )

    return CreateCheckoutResponse(checkout_url=session.url)

# ── Get Subscription Status ────────────────────────────────────────────────────
@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(current_user: CurrentUser, supabase: Client = Depends(get_supabase_client)):
    """Return the current user's subscription details."""
    response = supabase.table("subscriptions").select("*").eq("user_id", current_user["id"]).execute()
    sub = response.data[0] if response.data else None
    
    if not sub:
        return SubscriptionResponse(plan="free", status="active",
                                    current_period_end=None, cancel_at_period_end=False)
    return SubscriptionResponse.model_validate(sub)

# ── Cancel Subscription ────────────────────────────────────────────────────────
@router.post("/cancel")
async def cancel_subscription(current_user: CurrentUser, supabase: Client = Depends(get_supabase_client)):
    """Cancel the Pro subscription at period end."""
    stripe.api_key = settings.stripe_secret_key
    response = supabase.table("subscriptions").select("*").eq("user_id", current_user["id"]).execute()
    sub = response.data[0] if response.data else None

    if not sub or not sub.get("stripe_subscription_id"):
        raise HTTPException(status_code=404, detail="No active subscription found")

    stripe.Subscription.modify(sub["stripe_subscription_id"], cancel_at_period_end=True)
    supabase.table("subscriptions").update({"cancel_at_period_end": True}).eq("id", sub["id"]).execute()
    
    return {"message": "Subscription will be canceled at the end of the billing period"}

# ── Webhook ────────────────────────────────────────────────────────────────────
@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    supabase: Client = Depends(get_supabase_client),
):
    """Handle Stripe webhook events for subscription lifecycle."""
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=503, detail="Webhook not configured")

    body = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload=body,
            sig_header=stripe_signature,
            secret=settings.stripe_webhook_secret,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type in ("customer.subscription.created", "customer.subscription.updated"):
        customer_id = data["customer"]
        stripe_sub_id = data["id"]
        price_id = data["items"]["data"][0]["price"]["id"]
        status_str = data["status"]
        period_end = datetime.fromtimestamp(data["current_period_end"], tz=timezone.utc).isoformat()
        cancel_at = data.get("cancel_at_period_end", False)

        # Find user by Stripe customer ID
        user_response = supabase.table("users").select("id").eq("stripe_customer_id", customer_id).execute()
        user = user_response.data[0] if user_response.data else None
        if not user:
            return {"status": "user_not_found"}

        plan = "pro" if price_id == settings.stripe_pro_price_id else "free"
        
        sub_data = {
            "user_id": user["id"],
            "plan": plan,
            "status": status_str,
            "stripe_subscription_id": stripe_sub_id,
            "stripe_price_id": price_id,
            "current_period_end": period_end,
            "cancel_at_period_end": cancel_at
        }
        
        # Upsert subscription
        supabase.table("subscriptions").upsert(sub_data, on_conflict="user_id").execute()

    elif event_type == "customer.subscription.deleted":
        stripe_sub_id = data["id"]
        supabase.table("subscriptions").update({
            "plan": "free",
            "status": "canceled",
            "stripe_subscription_id": None
        }).eq("stripe_subscription_id", stripe_sub_id).execute()

    return {"status": "ok"}

