"""
VisionInspect — Training platform schemas.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


StorageBackend = Literal["local", "supabase", "s3"]
TrainingStatus = Literal["queued", "running", "completed", "failed", "canceled"]
TrainingModelType = Literal["yolov8n", "yolov8s", "yolov8m"]
DatasetSplit = Literal["train", "val", "test"]


class DatasetCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    slug: Optional[str] = Field(None, min_length=2, max_length=120)
    description: Optional[str] = Field(None, max_length=2000)
    classes: list[str] = Field(default_factory=list)
    storage_backend: StorageBackend = "local"


class DatasetUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    slug: Optional[str] = Field(None, min_length=2, max_length=120)
    description: Optional[str] = Field(None, max_length=2000)
    classes: Optional[list[str]] = None


class DatasetSplitRequest(BaseModel):
    strategy: Literal["ratio", "folder"] = "ratio"
    train_ratio: float = Field(0.8, ge=0.1, le=0.95)
    val_ratio: float = Field(0.1, ge=0.0, le=0.8)
    test_ratio: float = Field(0.1, ge=0.0, le=0.8)


class DatasetResponse(BaseModel):
    id: UUID
    slug: str
    name: str
    description: Optional[str] = None
    storage_backend: StorageBackend
    storage_path: str
    classes: list[str] = Field(default_factory=list)
    image_count: int = 0
    label_count: int = 0
    train_count: int = 0
    val_count: int = 0
    test_count: int = 0
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class DatasetAssetResponse(BaseModel):
    id: UUID
    dataset_id: UUID
    file_name: str
    split: DatasetSplit
    asset_type: Literal["image", "label", "zip", "other"]
    file_path: str
    label_path: Optional[str] = None
    preview_url: Optional[str] = None
    size_bytes: Optional[int] = None
    created_at: datetime


class DatasetUploadResponse(BaseModel):
    dataset_id: UUID
    uploaded: int = 0
    assets: list[DatasetAssetResponse] = Field(default_factory=list)


class TrainingJobCreateRequest(BaseModel):
    dataset_id: UUID
    model_type: TrainingModelType = "yolov8n"
    epochs: int = Field(100, ge=1, le=1000)
    batch_size: int = Field(16, ge=1, le=256)
    image_size: int = Field(640, ge=160, le=2048)
    learning_rate: float = Field(0.001, gt=0.0, le=1.0)
    optimizer: str = Field("AdamW", max_length=40)
    project_name: Optional[str] = Field(None, max_length=120)
    notes: Optional[str] = Field(None, max_length=2000)
    auto_deploy: bool = False


class TrainingJobResponse(BaseModel):
    id: UUID
    dataset_id: UUID
    model_type: TrainingModelType
    epochs: int
    batch_size: int
    image_size: int
    learning_rate: float
    optimizer: str
    status: TrainingStatus
    progress: float = 0.0
    current_epoch: int = 0
    total_epochs: int = 0
    train_loss: Optional[float] = None
    val_loss: Optional[float] = None
    map50: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    eta_seconds: Optional[int] = None
    gpu_usage: Optional[float] = None
    ram_usage: Optional[float] = None
    config: dict[str, Any] = Field(default_factory=dict)
    logs_path: Optional[str] = None
    error_message: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    model_version_id: Optional[UUID] = None


class TrainingLogResponse(BaseModel):
    id: UUID
    training_job_id: UUID
    level: Literal["debug", "info", "warning", "error"] = "info"
    message: str
    epoch: Optional[int] = None
    step: Optional[int] = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class ModelVersionCreateRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=120)
    version: Optional[str] = Field(None, max_length=40)


class ModelVersionResponse(BaseModel):
    id: UUID
    dataset_id: UUID
    training_job_id: UUID
    name: str
    version: str
    model_type: TrainingModelType
    weights_path: str
    config: dict[str, Any] = Field(default_factory=dict)
    metrics: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    deployed_at: Optional[datetime] = None


class DeployModelRequest(BaseModel):
    restart_inference: bool = True
    activate_only: bool = False


class DeployModelResponse(BaseModel):
    model_version: ModelVersionResponse
    active_model_path: Optional[str] = None
    message: str = "Model deployed"


class TrainingMonitorPayload(BaseModel):
    training_job: TrainingJobResponse
    recent_logs: list[TrainingLogResponse] = Field(default_factory=list)