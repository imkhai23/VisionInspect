"""
VisionInspect — Pydantic Schemas (request/response models)
"""

from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth Schemas ───────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = Field(None, max_length=255)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str]
    is_active: bool
    is_verified: bool
    is_admin: bool = False
    created_at: datetime
    plan: str = "free"


    model_config = {"from_attributes": True}


# ── Prediction Schemas ─────────────────────────────────────────────────────────
class PredictionResponse(BaseModel):
    id: UUID
    label: str
    confidence: float
    all_scores: Optional[dict[str, float]]
    image_filename: str
    processing_ms: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class PredictionUpdate(BaseModel):
    image_filename: Optional[str] = Field(None, max_length=500)
    # You could add a 'notes' field here if you add it to the DB table as well



class PredictionListResponse(BaseModel):
    items: list[PredictionResponse]
    total: int
    page: int
    page_size: int


class TrainingClassInfo(BaseModel):
    class_name: str
    train_count: int
    is_trained: bool


class TrainingClassesResponse(BaseModel):
    items: list[TrainingClassInfo]
    total_classes: int
    trained_classes: int


# ── Usage Schemas ──────────────────────────────────────────────────────────────
class UsageResponse(BaseModel):
    plan: str
    predictions_used: int
    predictions_limit: int
    predictions_remaining: int
    reset_date: Optional[datetime]
    percentage_used: float


class DashboardStatsResponse(BaseModel):
    total_predictions: int
    predictions_this_month: int
    most_common_defect: Optional[str]
    average_confidence: Optional[float]
    defect_breakdown: dict[str, int]


# ── Subscription Schemas ───────────────────────────────────────────────────────
class SubscriptionResponse(BaseModel):
    plan: str
    status: str
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool

    model_config = {"from_attributes": True}


class CreateCheckoutRequest(BaseModel):
    success_url: str
    cancel_url: str


class CreateCheckoutResponse(BaseModel):
    checkout_url: str


# ── Error Schema ───────────────────────────────────────────────────────────────
class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
