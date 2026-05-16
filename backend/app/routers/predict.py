import time
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from supabase import Client

from app.config import get_settings
from app.supabase_client import get_supabase_client
from app.middleware.auth import CurrentUser
from app.schemas.schemas import PredictionResponse, TrainingClassInfo, TrainingClassesResponse
from ai.model import CLASSES

settings = get_settings()
router = APIRouter(prefix="/predict", tags=["Predictions"])
TRAIN_DATA_DIR = Path(__file__).resolve().parents[3] / "ai" / "data" / "train"

def _count_images(class_name: str) -> int:
    class_dir = TRAIN_DATA_DIR / class_name
    if not class_dir.exists():
        return 0
    return sum(
        1
        for path in class_dir.rglob("*")
        if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}
    )

async def _get_monthly_usage(user_id, supabase: Client) -> int:
    """Count predictions made this calendar month using Supabase."""
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    response = supabase.table("predictions") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .gte("created_at", start_of_month) \
        .execute()
    
    return response.count or 0

@router.get("/classes", response_model=TrainingClassesResponse)
async def get_training_classes():
    """Return the known defect classes and how many local train images each has."""
    items = [
        TrainingClassInfo(
            class_name=class_name,
            train_count=train_count,
            is_trained=train_count > 0,
        )
        for class_name in CLASSES
        for train_count in [_count_images(class_name)]
    ]
    trained_classes = sum(1 for item in items if item.is_trained)
    return TrainingClassesResponse(
        items=items,
        total_classes=len(items),
        trained_classes=trained_classes,
    )

@router.post("", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def predict(
    current_user: CurrentUser,
    file: UploadFile = File(..., description="Product image (JPEG/PNG/WEBP, max 10MB)"),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Upload an image and get a defect classification result.
    Enforces monthly usage limits based on subscription plan.
    """
    # ── Validate file type ───────────────────────────────────────────────────
    if file.content_type not in settings.allowed_image_types:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type: {file.content_type}. Use JPEG, PNG, or WEBP.",
        )

    # ── Read file ────────────────────────────────────────────────────────────
    image_bytes = await file.read()
    if len(image_bytes) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {settings.max_upload_size_mb}MB.",
        )

    # ── Check usage limits ───────────────────────────────────────────────────
    sub_response = supabase.table("subscriptions").select("*").eq("user_id", current_user["id"]).execute()
    sub = sub_response.data[0] if sub_response.data else None
    
    plan = sub["plan"] if sub else "free"
    limit = settings.pro_monthly_limit if plan == "pro" else settings.free_monthly_limit
    used = await _get_monthly_usage(current_user["id"], supabase)

    if used >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Monthly limit of {limit} predictions reached. Upgrade to Pro for unlimited access.",
        )

    # ── Run AI inference ─────────────────────────────────────────────────────
    try:
        from ai.inference import get_classifier
        classifier = get_classifier()

        t0 = time.perf_counter()
        result = classifier.predict(image_bytes)
        processing_ms = int((time.perf_counter() - t0) * 1000)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {str(e)}",
        )

    # ── Persist prediction ───────────────────────────────────────────────────
    prediction_data = {
        "user_id": current_user["id"],
        "image_filename": file.filename or "unknown",
        "image_size_bytes": len(image_bytes),
        "label": result.label,
        "confidence": result.confidence,
        "all_scores": result.all_scores,
        "processing_ms": processing_ms,
    }
    pred_response = supabase.table("predictions").insert(prediction_data).execute()
    prediction = pred_response.data[0]

    # Log usage
    supabase.table("usage_logs").insert({
        "user_id": current_user["id"],
        "action": "predict",
        "extra_metadata": {"label": result.label, "confidence": result.confidence},
    }).execute()

    return PredictionResponse.model_validate(prediction)

