"""
VisionInspect — FastAPI Application Entry Point
"""

import sys
import os
from contextlib import asynccontextmanager

# Add the project root to Python path so `ai` can be imported as a namespace package.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.routers import (
    auth_router,
    history_router,
    predict_router,
    stripe_router,
    usage_router,
    admin_router,
)


from app.config import get_settings

settings = get_settings()


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup/shutdown tasks."""
    # Table management is now handled via Supabase UI/Migrations
    print(f"[App] {settings.app_name} v{settings.app_version} started")


    # Warm up the AI model
    try:
        from ai.inference import get_classifier
        get_classifier()
        print("[App] AI model warmed up successfully")
    except Exception as e:
        print(f"[App] AI model warmup skipped: {e}")

    yield

    print("[App] Shutting down...")


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered product defect detection SaaS API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(history_router)
app.include_router(usage_router)
app.include_router(stripe_router)
app.include_router(admin_router)



# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
    }


@app.get("/", include_in_schema=False)
async def root():
    return {"message": f"Welcome to {settings.app_name} API. Docs at /docs"}
