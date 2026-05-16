import uuid
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client

from app.supabase_client import get_supabase_client
from app.services.supabase_auth import get_user_from_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=True)

async def _sync_local_user(supabase: Client, supabase_user: dict) -> dict:
    supabase_id = supabase_user.get("id")
    email = supabase_user.get("email")
    full_name = (supabase_user.get("user_metadata") or {}).get("full_name")

    if not supabase_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase token payload missing user id/email",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user exists in 'users' table
    response = supabase.table("users").select("*").eq("id", supabase_id).execute()
    user = response.data[0] if response.data else None

    if not user:
        # Check by email if ID not found (for legacy sync)
        response = supabase.table("users").select("*").eq("email", email).execute()
        user = response.data[0] if response.data else None

    if not user:
        # Create user record
        user_data = {
            "id": supabase_id,
            "email": email,
            "full_name": full_name,
            "is_active": True,
            "is_verified": True
        }
        response = supabase.table("users").insert(user_data).execute()
        user = response.data[0]
    else:
        # Update user record if needed
        update_data = {"email": email}
        if full_name:
            update_data["full_name"] = full_name
        
        response = supabase.table("users").update(update_data).eq("id", supabase_id).execute()
        user = response.data[0]

    # Ensure subscription exists
    sub_response = supabase.table("subscriptions").select("*").eq("user_id", user["id"]).execute()
    if not sub_response.data:
        supabase.table("subscriptions").insert({"user_id": user["id"], "plan": "free"}).execute()

    return user

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)] = "",
    supabase: Client = Depends(get_supabase_client),
) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    supabase_user = await get_user_from_access_token(token)
    return await _sync_local_user(supabase, supabase_user)

async def get_current_admin(
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user

CurrentUser = Annotated[dict, Depends(get_current_user)]
CurrentAdmin = Annotated[dict, Depends(get_current_admin)]



