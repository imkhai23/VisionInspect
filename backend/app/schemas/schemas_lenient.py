from datetime import datetime
from uuid import UUID
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field

# ... (Auth schemas remain same) ...

class PredictionResponse(BaseModel):
    id: Any
    label: Optional[str] = "N/A"
    confidence: Optional[float] = 0.0
    all_scores: Optional[dict[str, Any]] = None
    image_filename: Optional[str] = "unknown"
    image_url: Optional[str] = None
    processing_ms: Optional[int] = 0
    created_at: Any

    model_config = {"from_attributes": True}

class PredictionListResponse(BaseModel):
    items: list[PredictionResponse]
    total: int
    page: int
    page_size: int

# ... (Rest of schemas) ...
