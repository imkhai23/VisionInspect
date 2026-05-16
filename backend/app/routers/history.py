from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException, status
from supabase import Client

from app.supabase_client import get_supabase_client
from app.middleware.auth import CurrentUser
from app.schemas.schemas import PredictionListResponse, PredictionResponse, PredictionUpdate


router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=PredictionListResponse)
async def get_history(
    current_user: CurrentUser,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    supabase: Client = Depends(get_supabase_client),
):
    """Return paginated prediction history for the authenticated user."""
    start = (page - 1) * page_size
    end = start + page_size - 1

    user_id = current_user["id"]  # Keep original type from Supabase

    response = supabase.table("predictions") \
        .select("*", count="exact") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .range(start, end) \
        .execute()
    
    items = response.data or []
    total = response.count or 0

    valid_items = []
    for p in items:
        try:
            valid_items.append(PredictionResponse(**p))
        except Exception as e:
            print(f"[History] Skipping malformed record {p.get('id')}: {e}")
            continue

    return PredictionListResponse(
        items=valid_items,
        total=total,
        page=page,
        page_size=page_size,
    )

@router.patch("/{prediction_id}", response_model=PredictionResponse)
async def update_prediction(
    prediction_id: UUID,
    payload: PredictionUpdate,
    current_user: CurrentUser,
    supabase: Client = Depends(get_supabase_client),
):
    check = supabase.table("predictions").select("user_id").eq("id", str(prediction_id)).execute()
    if not check.data:
        raise HTTPException(status_code=404, detail="Prediction not found")
    if check.data[0]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = payload.model_dump(exclude_unset=True)
    response = supabase.table("predictions").update(update_data).eq("id", str(prediction_id)).execute()
    return PredictionResponse(**response.data[0])

@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prediction(
    prediction_id: UUID,
    current_user: CurrentUser,
    supabase: Client = Depends(get_supabase_client),
):
    check = supabase.table("predictions").select("user_id").eq("id", str(prediction_id)).execute()
    if not check.data:
        raise HTTPException(status_code=404, detail="Prediction not found")
    if check.data[0]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    supabase.table("predictions").delete().eq("id", str(prediction_id)).execute()
    return None
