from fastapi import APIRouter, Depends
from supabase import Client
from typing import List

from app.supabase_client import get_supabase_client
from app.middleware.auth import CurrentAdmin
from app.schemas.schemas import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client)
):
    """Admin only: List all registered users in the system."""
    response = supabase.table("users").select("*").execute()
    users = response.data
    
    # Enrich with subscription data if needed, but for now just returning users
    return [UserResponse.model_validate(u) for u in users]

@router.get("/stats")
async def get_system_stats(
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client)
):
    """Admin only: Get high-level system statistics."""
    users_count = supabase.table("users").select("id", count="exact").execute().count
    preds_count = supabase.table("predictions").select("id", count="exact").execute().count
    
    return {
        "total_users": users_count,
        "total_predictions": preds_count
    }

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    data: dict,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client)
):
    """Admin only: Update a user's is_admin or is_active status."""
    response = supabase.table("users").update(data).eq("id", user_id).execute()
    if len(response.data) == 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse.model_validate(response.data[0])
