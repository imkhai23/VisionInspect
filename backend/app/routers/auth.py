from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.supabase_client import get_supabase_client
from app.middleware.auth import (
    CurrentUser,
)
from app.schemas.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.supabase_auth import login_password, signup_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

async def _sync_local_user(
    supabase: Client,
    supabase_user: dict,
    fallback_full_name: str | None = None,
) -> dict:
    user_id = supabase_user.get("id")
    email = supabase_user.get("email")
    metadata = supabase_user.get("user_metadata") or {}
    full_name = metadata.get("full_name") or fallback_full_name

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supabase user payload missing id/email",
        )

    # Check if user exists
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    user = response.data[0] if response.data else None

    if not user:
        response = supabase.table("users").select("*").eq("email", email).execute()
        user = response.data[0] if response.data else None

    if not user:
        user_data = {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "is_active": True,
            "is_verified": True
        }
        response = supabase.table("users").insert(user_data).execute()
        user = response.data[0]
    else:
        update_data = {"email": email}
        if full_name:
            update_data["full_name"] = full_name
        response = supabase.table("users").update(update_data).eq("id", user_id).execute()
        user = response.data[0]

    # Ensure subscription exists
    sub_response = supabase.table("subscriptions").select("*").eq("user_id", user["id"]).execute()
    if not sub_response.data:
        supabase.table("subscriptions").insert({"user_id": user["id"], "plan": "free"}).execute()

    return user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, supabase: Client = Depends(get_supabase_client)):
    """Register a new account in Supabase Auth and sync local profile/subscription."""
    supabase_response = await signup_user(
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
    )
    supabase_user = supabase_response.get("user")
    if not supabase_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supabase signup did not return a user object",
        )

    user = await _sync_local_user(supabase, supabase_user, payload.full_name)
    response = UserResponse.model_validate(user)
    response.plan = "free"
    return response

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, supabase: Client = Depends(get_supabase_client)):
    """Authenticate via Supabase password grant and return Supabase access token."""
    token_payload = await login_password(payload.email, payload.password)
    supabase_user = token_payload.get("user")
    session = token_payload.get("session")

    if supabase_user:
        await _sync_local_user(supabase, supabase_user)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase login response is missing session data",
        )

    access_token = session.get("access_token")
    expires_in = session.get("expires_in")

    if not access_token or expires_in is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase login response is missing access token",
        )

    return TokenResponse(access_token=access_token, expires_in=int(expires_in))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser, supabase: Client = Depends(get_supabase_client)):
    """Return the authenticated user's profile."""
    # Load subscription
    sub_response = supabase.table("subscriptions").select("*").eq("user_id", current_user["id"]).execute()
    sub = sub_response.data[0] if sub_response.data else None

    response = UserResponse.model_validate(current_user)
    response.plan = sub["plan"] if sub else "free"
    return response

