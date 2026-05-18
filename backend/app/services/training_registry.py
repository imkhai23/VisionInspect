"""Supabase-backed registry helpers for datasets, training jobs, logs, and models."""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from supabase import Client

from app.config import get_settings
from app.services.model_runtime import write_active_model_manifest


settings = get_settings()


def slugify_dataset(name: str, fallback: Optional[str] = None) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", name.strip().lower()).strip("-")
    slug = re.sub(r"-+", "-", slug)
    return slug or fallback or f"dataset-{uuid.uuid4().hex[:8]}"


def _table(client: Client, name: str):
    return client.table(name)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_dataset_by_id(client: Client, dataset_id: str) -> dict[str, Any] | None:
    response = _table(client, "datasets").select("*").eq("id", dataset_id).limit(1).execute()
    return response.data[0] if response.data else None


def list_datasets(client: Client) -> list[dict[str, Any]]:
    response = _table(client, "datasets").select("*").order("created_at", desc=True).execute()
    return response.data or []


def create_dataset(client: Client, payload: dict[str, Any], created_by: Optional[str] = None) -> dict[str, Any]:
    storage_backend = payload.get("storage_backend") or settings.dataset_storage_backend
    slug = payload.get("slug") or slugify_dataset(payload["name"])
    storage_path = payload.get("storage_path") or f"datasets/{slug}"
    record = {
        "slug": slug,
        "name": payload["name"],
        "description": payload.get("description"),
        "classes": payload.get("classes") or [],
        "storage_backend": storage_backend,
        "storage_path": storage_path,
        "image_count": 0,
        "label_count": 0,
        "train_count": 0,
        "val_count": 0,
        "test_count": 0,
        "created_by": created_by,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    response = _table(client, "datasets").insert(record).execute()
    return response.data[0]


def update_dataset(client: Client, dataset_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    payload = {k: v for k, v in payload.items() if v is not None}
    if "name" in payload and "slug" not in payload:
        payload["slug"] = slugify_dataset(payload["name"])
    payload["updated_at"] = _now_iso()
    response = _table(client, "datasets").update(payload).eq("id", dataset_id).execute()
    if not response.data:
        raise ValueError("Dataset not found")
    return response.data[0]


def delete_dataset(client: Client, dataset_id: str) -> None:
    _table(client, "dataset_assets").delete().eq("dataset_id", dataset_id).execute()
    _table(client, "training_jobs").delete().eq("dataset_id", dataset_id).execute()
    _table(client, "model_versions").delete().eq("dataset_id", dataset_id).execute()
    _table(client, "datasets").delete().eq("id", dataset_id).execute()


def list_dataset_assets(client: Client, dataset_id: str) -> list[dict[str, Any]]:
    response = _table(client, "dataset_assets").select("*").eq("dataset_id", dataset_id).order("created_at", desc=True).execute()
    return response.data or []


def upsert_dataset_asset(client: Client, asset: dict[str, Any]) -> dict[str, Any]:
    response = _table(client, "dataset_assets").insert(asset).execute()
    return response.data[0]


def delete_dataset_asset(client: Client, asset_id: str) -> None:
    _table(client, "dataset_assets").delete().eq("id", asset_id).execute()


def compute_dataset_stats(dataset: dict[str, Any], assets: list[dict[str, Any]]) -> dict[str, Any]:
    image_count = sum(1 for asset in assets if asset.get("asset_type") == "image")
    label_count = sum(1 for asset in assets if asset.get("asset_type") == "label")
    split_counts = {"train": 0, "val": 0, "test": 0}
    for asset in assets:
        split = asset.get("split") or "train"
        if split in split_counts:
            split_counts[split] += 1
    distribution = {class_name: 0 for class_name in (dataset.get("classes") or [])}
    if not distribution:
        distribution = {"unlabeled": image_count}
    return {
        "dataset_id": dataset["id"],
        "slug": dataset["slug"],
        "classes": dataset.get("classes") or [],
        "image_count": image_count,
        "label_count": label_count,
        "train_count": split_counts["train"],
        "val_count": split_counts["val"],
        "test_count": split_counts["test"],
        "defect_distribution": distribution,
    }


def build_dataset_summary(dataset: dict[str, Any], assets: list[dict[str, Any]]) -> dict[str, Any]:
    summary = compute_dataset_stats(dataset, assets)
    summary["asset_count"] = len(assets)
    return summary


def create_training_job(client: Client, payload: dict[str, Any], created_by: Optional[str] = None) -> dict[str, Any]:
    job = {
        "dataset_id": str(payload["dataset_id"]),
        "model_type": payload.get("model_type", "yolov8n"),
        "epochs": payload.get("epochs", 100),
        "batch_size": payload.get("batch_size", 16),
        "image_size": payload.get("image_size", 640),
        "learning_rate": payload.get("learning_rate", 0.001),
        "optimizer": payload.get("optimizer", "AdamW"),
        "status": "queued",
        "progress": 0.0,
        "current_epoch": 0,
        "total_epochs": payload.get("epochs", 100),
        "train_loss": None,
        "val_loss": None,
        "map50": None,
        "precision": None,
        "recall": None,
        "eta_seconds": None,
        "gpu_usage": None,
        "ram_usage": None,
        "config": payload,
        "created_by": created_by,
        "created_at": _now_iso(),
        "started_at": None,
        "finished_at": None,
        "model_version_id": None,
        "logs_path": None,
        "error_message": None,
    }
    response = _table(client, "training_jobs").insert(job).execute()
    return response.data[0]


def update_training_job(client: Client, job_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    payload = {k: v for k, v in payload.items() if v is not None}
    payload["updated_at"] = _now_iso()
    response = _table(client, "training_jobs").update(payload).eq("id", job_id).execute()
    if not response.data:
        raise ValueError("Training job not found")
    return response.data[0]


def get_training_job(client: Client, job_id: str) -> dict[str, Any] | None:
    response = _table(client, "training_jobs").select("*").eq("id", job_id).limit(1).execute()
    return response.data[0] if response.data else None


def list_training_jobs(client: Client) -> list[dict[str, Any]]:
    response = _table(client, "training_jobs").select("*").order("created_at", desc=True).execute()
    return response.data or []


def add_training_log(
    client: Client,
    job_id: str,
    message: str,
    level: str = "info",
    epoch: int | None = None,
    step: int | None = None,
    metadata: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    record = {
        "training_job_id": job_id,
        "level": level,
        "message": message,
        "epoch": epoch,
        "step": step,
        "metadata": metadata or {},
        "created_at": _now_iso(),
    }
    response = _table(client, "training_logs").insert(record).execute()
    return response.data[0]


def list_training_logs(client: Client, job_id: str, limit: int = 200) -> list[dict[str, Any]]:
    response = _table(client, "training_logs").select("*").eq("training_job_id", job_id).order("created_at", desc=False).limit(limit).execute()
    return response.data or []


def list_model_versions(client: Client) -> list[dict[str, Any]]:
    response = _table(client, "model_versions").select("*").order("created_at", desc=True).execute()
    return response.data or []


def get_model_version(client: Client, version_id: str) -> dict[str, Any] | None:
    response = _table(client, "model_versions").select("*").eq("id", version_id).limit(1).execute()
    return response.data[0] if response.data else None


def create_model_version(client: Client, payload: dict[str, Any]) -> dict[str, Any]:
    existing = _table(client, "model_versions").select("id", count="exact").eq("dataset_id", payload["dataset_id"]).execute()
    version_number = (existing.count or 0) + 1
    record = {
        "dataset_id": str(payload["dataset_id"]),
        "training_job_id": str(payload["training_job_id"]),
        "name": payload.get("name") or f"{payload.get('model_type', 'model')} v{version_number}",
        "version": payload.get("version") or f"v{version_number}",
        "model_type": payload.get("model_type", "yolov8n"),
        "weights_path": payload["weights_path"],
        "config": payload.get("config") or {},
        "metrics": payload.get("metrics") or {},
        "is_active": payload.get("is_active", False),
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
        "deployed_at": payload.get("deployed_at"),
    }
    response = _table(client, "model_versions").insert(record).execute()
    return response.data[0]


def update_model_version(client: Client, version_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    payload = {k: v for k, v in payload.items() if v is not None}
    payload["updated_at"] = _now_iso()
    response = _table(client, "model_versions").update(payload).eq("id", version_id).execute()
    if not response.data:
        raise ValueError("Model version not found")
    return response.data[0]


def activate_model_version(client: Client, version_id: str, deployed_by: Optional[str] = None) -> dict[str, Any]:
    version = get_model_version(client, version_id)
    if not version:
        raise ValueError("Model version not found")

    _table(client, "model_versions").update({"is_active": False, "updated_at": _now_iso()}).eq("is_active", True).execute()
    activated = _table(client, "model_versions").update({"is_active": True, "deployed_at": _now_iso(), "updated_at": _now_iso()}).eq("id", version_id).execute()
    if not activated.data:
        raise ValueError("Unable to activate model version")

    _table(client, "deployed_models").insert({
        "model_version_id": version_id,
        "status": "active",
        "deployed_by": deployed_by,
        "deployed_at": _now_iso(),
        "previous_model_version_id": None,
        "metadata": {"source": "admin-panel"},
    }).execute()

    write_active_model_manifest(version)
    return activated.data[0]


def sync_dataset_stats(client: Client, dataset_id: str) -> dict[str, Any]:
    dataset = get_dataset_by_id(client, dataset_id)
    if not dataset:
        raise ValueError("Dataset not found")
    assets = list_dataset_assets(client, dataset_id)
    stats = compute_dataset_stats(dataset, assets)
    updated = update_dataset(client, dataset_id, {
        "image_count": stats["image_count"],
        "label_count": stats["label_count"],
        "train_count": stats["train_count"],
        "val_count": stats["val_count"],
        "test_count": stats["test_count"],
    })
    return updated