import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"URL: {supabase_url}")
print(f"Key set: {'Yes' if supabase_key else 'No'}")

if not supabase_url or not supabase_key:
    print("Missing environment variables.")
    exit(1)

try:
    supabase = create_client(supabase_url, supabase_key)
    response = supabase.table("users").select("email, is_admin").execute()
    print("Connection successful!")
    for u in response.data:
        print(f"User: {u['email']}, Is Admin: {u['is_admin']}")
except Exception as e:
    print(f"Connection failed: {e}")
