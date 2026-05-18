import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("Missing environment variables.")
    exit(1)

try:
    supabase = create_client(supabase_url, supabase_key)
    # Use admin API to list users
    response = supabase.auth.admin.list_users()
    print("Users in auth.users:")
    for user in response:
        print(f"Email: {user.email}, Confirmed: {user.email_confirmed_at is not None}, ID: {user.id}")
except Exception as e:
    print(f"Failed to list users: {e}")
