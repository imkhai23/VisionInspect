from typing import Any
from fastapi import HTTPException, status
from app.supabase_client import get_supabase

supabase = get_supabase()

async def signup_user(email: str, password: str, full_name: str | None = None) -> dict[str, Any]:
    """Create a user in Supabase Auth."""
    try:
        options = {}
        if full_name:
            options["data"] = {"full_name": full_name}
        
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": options
        })
        return response.model_dump()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

async def login_password(email: str, password: str) -> dict[str, Any]:
    """Authenticate with Supabase Auth."""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return response.model_dump()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

async def get_user_from_access_token(access_token: str) -> dict[str, Any]:
    """Validate access token with Supabase."""
    try:
        # We use the provided access token to get the user
        response = supabase.auth.get_user(access_token)
        return response.user.model_dump()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Supabase access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

