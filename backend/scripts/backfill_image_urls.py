"""Backfill script: populate `image_url` for existing predictions with NULL.

Run from repository root (we'll run it via the venv python):
  python backend/scripts/backfill_image_urls.py

It uses the Supabase service-role key from `backend/.env` via the existing
`app.supabase_client.get_supabase()` helper.
"""
from __future__ import annotations

import sys
from pathlib import Path
import logging
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT / "backend"))

from dotenv import load_dotenv

# Ensure backend/.env is loaded (script may run from repo root)
load_dotenv(ROOT / "backend" / ".env")

from app.supabase_client import get_supabase


logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger("backfill")


def normalize_public_url(resp: Any) -> str | None:
    try:
        if isinstance(resp, str):
            return resp
        if isinstance(resp, dict):
            # try common keys
            for k in ("public_url", "publicUrl", "publicURL", "url", "data"):
                if k in resp and resp[k]:
                    if isinstance(resp[k], str):
                        return resp[k]
                    if isinstance(resp[k], dict):
                        for nk in ("public_url", "publicUrl", "publicURL", "url"):
                            if nk in resp[k] and isinstance(resp[k][nk], str):
                                return resp[k][nk]
        return str(resp)
    except Exception:
        return None


def main() -> None:
    client = get_supabase()

    logger.info("Querying predictions with NULL image_url...")
    resp = client.table("predictions").select("id,user_id,image_filename").is_("image_url", None).execute()
    rows = resp.data or []
    logger.info(f"Found {len(rows)} predictions with NULL image_url")

    updated = 0
    for r in rows:
        pid = r.get("id")
        user_id = r.get("user_id")
        filename = r.get("image_filename") or ""

        candidates = []
        # First try listing objects under user folder
        try:
            lst = client.storage.from_("predictions").list(str(user_id))
            if isinstance(lst, dict) and "data" in lst:
                items = lst["data"]
            else:
                items = lst
            for it in items or []:
                # item may be dict with 'name' or 'id' depending on client
                name = it.get("name") if isinstance(it, dict) else (it.name if hasattr(it, "name") else None)
                if not name:
                    # try keys
                    if isinstance(it, dict):
                        name = it.get("id") or it.get("path")
                if not name:
                    continue
                candidates.append(name)
        except Exception:
            # fallback to listing root (may be large)
            try:
                lst = client.storage.from_("predictions").list("")
                items = lst.get("data") if isinstance(lst, dict) else lst
                for it in items or []:
                    name = it.get("name") if isinstance(it, dict) else (it.name if hasattr(it, "name") else None)
                    if name:
                        candidates.append(name)
            except Exception as e:
                logger.warning(f"Failed to list storage objects: {e}")

        match = None
        for c in candidates:
            # match by filename suffix
            if filename and c.endswith(filename):
                match = c
                break
            # or contains filename
            if filename and filename in c:
                match = c
                break

        if not match:
            logger.info(f"No storage object found for prediction {pid} (filename='{filename}')")
            continue

        try:
            resp_url = client.storage.from_("predictions").get_public_url(match)
            image_url = normalize_public_url(resp_url)
            if not image_url:
                logger.warning(f"Could not normalize public url for object {match}")
                continue

            upd = client.table("predictions").update({"image_url": image_url}).eq("id", pid).execute()
            if upd.error:
                logger.warning(f"Failed to update prediction {pid}: {upd.error}")
            else:
                updated += 1
                logger.info(f"Updated prediction {pid} -> {image_url}")
        except Exception as e:
            logger.warning(f"Error processing prediction {pid}: {e}")

    logger.info(f"Backfill complete. Updated {updated} rows.")


if __name__ == "__main__":
    main()
