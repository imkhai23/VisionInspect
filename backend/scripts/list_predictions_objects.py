"""List objects in the 'predictions' Supabase storage bucket for debugging."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT / "backend"))

from dotenv import load_dotenv
load_dotenv(ROOT / "backend" / ".env")

from app.supabase_client import get_supabase


def main():
    client = get_supabase()
    print("Listing objects in bucket 'predictions' (root)...")
    try:
        res = client.storage.from_("predictions").list("")
        if isinstance(res, dict) and "data" in res:
            items = res["data"]
        else:
            items = res
        print(f"Total objects returned: {len(items) if items else 0}")
        for i, it in enumerate(items or []):
            name = it.get("name") if isinstance(it, dict) else (getattr(it, "name", None))
            print(i, name)
            if i >= 50:
                break
    except Exception as e:
        print("Error listing objects:", e)


if __name__ == "__main__":
    main()
