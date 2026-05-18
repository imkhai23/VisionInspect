"""
Model runtime helpers for hot switching the active inference model.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from app.config import get_settings


settings = get_settings()
PROJECT_ROOT = Path(__file__).resolve().parents[3]
MANIFEST_PATH = PROJECT_ROOT / settings.active_model_manifest_path


def ensure_model_root() -> Path:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    return MANIFEST_PATH.parent


def read_active_model_manifest() -> dict[str, Any]:
    if not MANIFEST_PATH.exists():
        return {
            "model_version_id": None,
            "weights_path": str((PROJECT_ROOT / "ai" / "weights" / "defect_classifier.pth").as_posix()),
            "updated_at": None,
        }
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def write_active_model_manifest(model_version: dict[str, Any]) -> dict[str, Any]:
    ensure_model_root()
    manifest = {
        "model_version_id": str(model_version.get("id")),
        "weights_path": model_version.get("weights_path"),
        "model_type": model_version.get("model_type"),
        "dataset_id": str(model_version.get("dataset_id")) if model_version.get("dataset_id") else None,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def get_active_weights_path(default_path: Optional[str] = None) -> str:
    manifest = read_active_model_manifest()
    weights_path = manifest.get("weights_path") or default_path
    if weights_path:
        return str(weights_path)
    return str((PROJECT_ROOT / "ai" / "weights" / "defect_classifier.pth").as_posix())