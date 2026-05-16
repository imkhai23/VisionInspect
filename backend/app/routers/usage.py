from datetime import datetime, timezone
from collections import Counter

from fastapi import APIRouter, Depends
from supabase import Client

from app.config import get_settings
from app.supabase_client import get_supabase_client
from app.middleware.auth import CurrentUser
from app.schemas.schemas import DashboardStatsResponse, UsageResponse

settings = get_settings()
router = APIRouter(prefix="/usage", tags=["Usage"])

@router.get("", response_model=UsageResponse)
async def get_usage(current_user: CurrentUser, supabase: Client = Depends(get_supabase_client)):
    """Return current month's usage against plan limits."""
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    # Get subscription
    sub_response = supabase.table("subscriptions").select("*").eq("user_id", current_user["id"]).execute()
    sub = sub_response.data[0] if sub_response.data else None
    plan = sub["plan"] if sub else "free"
    limit = settings.pro_monthly_limit if plan == "pro" else settings.free_monthly_limit

    # Count usage this month
    count_response = supabase.table("predictions") \
        .select("id", count="exact") \
        .eq("user_id", current_user["id"]) \
        .gte("created_at", start_of_month) \
        .execute()
    
    used = count_response.count or 0
    remaining = max(0, limit - used)
    percentage = round((used / limit) * 100, 1) if limit > 0 else 0

    # Next reset date (first of next month)
    if now.month == 12:
        reset_date = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0)
    else:
        reset_date = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0)

    return UsageResponse(
        plan=plan,
        predictions_used=used,
        predictions_limit=limit if plan != "pro" else -1,
        predictions_remaining=remaining if plan != "pro" else -1,
        reset_date=reset_date,
        percentage_used=percentage if plan != "pro" else 0.0,
    )

@router.get("/dashboard", response_model=DashboardStatsResponse)
async def get_dashboard(current_user: CurrentUser, supabase: Client = Depends(get_supabase_client)):
    """Return aggregate dashboard analytics."""
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    # Total predictions
    total_response = supabase.table("predictions") \
        .select("id", count="exact") \
        .eq("user_id", current_user["id"]) \
        .execute()
    total = total_response.count or 0

    # This month
    month_response = supabase.table("predictions") \
        .select("id", count="exact") \
        .eq("user_id", current_user["id"]) \
        .gte("created_at", start_of_month) \
        .execute()
    this_month = month_response.count or 0

    # For average confidence and breakdown, we fetch the data
    # In production, use RPC or Views for performance
    data_response = supabase.table("predictions") \
        .select("label, confidence") \
        .eq("user_id", current_user["id"]) \
        .execute()
    
    rows = data_response.data
    
    if not rows:
        return DashboardStatsResponse(
            total_predictions=total,
            predictions_this_month=this_month,
            most_common_defect=None,
            average_confidence=None,
            defect_breakdown={},
        )

    # Compute stats in Python
    confidences = [r["confidence"] for r in rows if r.get("confidence") is not None]
    avg_confidence = sum(confidences) / len(confidences) if confidences else None
    
    labels = [r["label"] for r in rows if r.get("label")]
    breakdown = dict(Counter(labels))
    most_common = max(breakdown, key=breakdown.get) if breakdown else None

    return DashboardStatsResponse(
        total_predictions=total,
        predictions_this_month=this_month,
        most_common_defect=most_common,
        average_confidence=round(avg_confidence, 2) if avg_confidence else None,
        defect_breakdown=breakdown,
    )

