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
    stream_router,
)


from app.config import get_settings

settings = get_settings()


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup/shutdown tasks."""
    print(f"[App] {settings.app_name} v{settings.app_version} started")

    # Start Video Processor for real-time AI
    try:
        from app.services.video_service import get_video_processor
        processor = get_video_processor()
        processor.start()
        print("[App] Video Processor started")
    except Exception as e:
        print(f"[App] Failed to start Video Processor: {e}")

    # Warm up the AI model
    try:
        from ai.inference import get_classifier
        get_classifier()
        print("[App] AI model warmed up successfully")
    except Exception as e:
        print(f"[App] AI model warmup skipped: {e}")

    yield

    # Shutdown
    try:
        from app.services.video_service import get_video_processor
        get_video_processor().stop()
        print("[App] Video Processor stopped")
    except:
        pass

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

from fastapi.staticfiles import StaticFiles

...

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files ──────────────────────────────────────────────────────────────
os.makedirs("storage/defects", exist_ok=True)
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(history_router)
app.include_router(usage_router)
app.include_router(stripe_router)
app.include_router(admin_router)
app.include_router(stream_router)



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
