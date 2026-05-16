"""
VisionInspect Backend — Application Settings
All config values are loaded from environment variables with sensible defaults.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


    # ── App ────────────────────────────────────────────────────────────────────
    app_name: str = "VisionInspect"
    app_version: str = "1.0.0"
    debug: bool = False
    allowed_origins: list[str] = ["http://localhost:3000", "https://visioninspect.app"]

    # ── Supabase ───────────────────────────────────────────────────────────────
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""


    # ── Stripe ────────────────────────────────────────────────────────────────
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_pro_price_id: str = ""

    # ── Plans ─────────────────────────────────────────────────────────────────
    free_monthly_limit: int = 50
    pro_monthly_limit: int = 999_999  # effectively unlimited

    # ── File Upload ───────────────────────────────────────────────────────────
    max_upload_size_mb: int = 10
    allowed_image_types: list[str] = ["image/jpeg", "image/png", "image/webp"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
