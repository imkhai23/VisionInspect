"""
VisionInspect Backend — Supabase Client Setup
"""

from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

def get_supabase() -> Client:
    """
    Returns a Supabase client.
    Note: For service-role operations (like bypassing RLS), use this client.
    """
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

async def get_supabase_client():
    """
    FastAPI dependency that yields a Supabase client.
    """
    client = get_supabase()
    try:
        yield client
    finally:
        # supabase-py doesn't require explicit close for basic operations
        pass
