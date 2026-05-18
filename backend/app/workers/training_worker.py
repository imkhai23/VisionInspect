"""RQ worker for asynchronous YOLO training jobs."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from rq import Connection, Worker

from app.config import get_settings
from app.services.model_runtime import write_active_model_manifest
from app.services.storage_service import STORAGE_ROOT
from app.services.training_queue import get_redis_connection
from app.services.training_registry import (
    add_training_log,
    create_model_version,
    get_dataset_by_id,
    get_training_job,
    list_dataset_assets,
    update_training_job,
)


settings = get_settings()


def _safe_metric(metrics: dict[str, Any], *keys: str) -> float | None:
    for key in keys:
        if key in metrics and metrics.get(key) is not None:
            try:
                return float(metrics.get(key))
            except Exception:
                return None
    return None


def _build_dataset_yaml(dataset: dict[str, Any]) -> Path:
    dataset_root = STORAGE_ROOT / "datasets" / dataset["slug"]
    dataset_root.mkdir(parents=True, exist_ok=True)
    classes = dataset.get("classes") or ["good", "scratch", "dent", "crack", "contamination", "missing_part"]
    names = "\n".join([f"  {index}: {class_name}" for index, class_name in enumerate(classes)])
    yaml_lines = [
        f"path: {dataset_root.as_posix()}",
        "train: images/train",
        "val: images/val",
        "test: images/test",
        "",
        "names:",
        names,
        "",
    ]
    yaml_path = dataset_root / "dataset.yaml"
    yaml_path.write_text("\n".join(yaml_lines), encoding="utf-8")
    return yaml_path


def run_training_job(job_id: str) -> dict[str, Any]:
    from app.supabase_client import get_supabase

    supabase = get_supabase()
    job = get_training_job(supabase, job_id)
    if not job:
        raise RuntimeError(f"Training job {job_id} not found")

    dataset = get_dataset_by_id(supabase, str(job["dataset_id"]))
    if not dataset:
        update_training_job(
            supabase,
            job_id,
            {
                "status": "failed",
                "error_message": "Dataset not found",
                "finished_at": datetime.now(timezone.utc).isoformat(),
            },
        )
        raise RuntimeError("Dataset not found")

    update_training_job(
        supabase,
        job_id,
        {
            "status": "running",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "total_epochs": int(job.get("epochs") or 100),
            "progress": 0.0,
        },
    )
    add_training_log(supabase, job_id, f"Queued training for {dataset['slug']}")

    _ = list_dataset_assets(supabase, str(dataset["id"]))
    yaml_path = _build_dataset_yaml(dataset)
    training_dir = STORAGE_ROOT / "runs" / "training" / job_id
    training_dir.mkdir(parents=True, exist_ok=True)

    try:
        from ultralytics import YOLO

        model = YOLO(f"{job['model_type']}.pt")

        def on_epoch_end(trainer):
            epoch_index = int(getattr(trainer, "epoch", 0)) + 1
            total_epochs = int(job.get("epochs") or 100)
            progress = min(epoch_index / max(total_epochs, 1) * 100.0, 100.0)
            metrics = getattr(trainer, "metrics", {}) or {}
            update_training_job(
                supabase,
                job_id,
                {
                    "current_epoch": epoch_index,
                    "progress": progress,
                    "train_loss": _safe_metric(metrics, "train/box_loss", "train_loss"),
                    "val_loss": _safe_metric(metrics, "val/box_loss", "val_loss"),
                    "map50": _safe_metric(metrics, "metrics/mAP50(B)", "mAP50", "map50"),
                    "precision": _safe_metric(metrics, "metrics/precision(B)", "precision"),
                    "recall": _safe_metric(metrics, "metrics/recall(B)", "recall"),
                },
            )
            add_training_log(
                supabase,
                job_id,
                f"Epoch {epoch_index}/{total_epochs}",
                epoch=epoch_index,
                metadata={"progress": progress, "metrics": metrics},
            )

        try:
            model.add_callback("on_train_epoch_end", on_epoch_end)
        except Exception:
            pass

        results = model.train(
            data=str(yaml_path),
            epochs=int(job["epochs"]),
            batch=int(job["batch_size"]),
            imgsz=int(job["image_size"]),
            lr0=float(job["learning_rate"]),
            optimizer=str(job["optimizer"]),
            project=str(training_dir),
            name="run",
            exist_ok=True,
            verbose=False,
        )

        save_dir = Path(getattr(results, "save_dir", training_dir / "run"))
        weights_path = save_dir / "weights" / "best.pt"
        if not weights_path.exists():
            weights_path = save_dir / "weights" / "last.pt"

        metrics = getattr(results, "results_dict", {}) or {}
        model_version = create_model_version(
            supabase,
            {
                "dataset_id": dataset["id"],
                "training_job_id": job_id,
                "name": f"{job['model_type']} {dataset['slug']}",
                "version": None,
                "model_type": job["model_type"],
                "weights_path": str(weights_path),
                "config": job.get("config") or {},
                "metrics": metrics,
                "is_active": False,
                "deployed_at": None,
            },
        )

        write_active_model_manifest(model_version)
        update_training_job(
            supabase,
            job_id,
            {
                "status": "completed",
                "progress": 100.0,
                "finished_at": datetime.now(timezone.utc).isoformat(),
                "model_version_id": model_version["id"],
                "map50": _safe_metric(metrics, "metrics/mAP50(B)", "mAP50", "map50"),
                "precision": _safe_metric(metrics, "metrics/precision(B)", "precision"),
                "recall": _safe_metric(metrics, "metrics/recall(B)", "recall"),
            },
        )
        add_training_log(supabase, job_id, f"Training completed. Weights: {weights_path}")
        return {"ok": True, "weights_path": str(weights_path), "model_version_id": str(model_version["id"])}

    except Exception as exc:
        update_training_job(
            supabase,
            job_id,
            {
                "status": "failed",
                "error_message": str(exc),
                "finished_at": datetime.now(timezone.utc).isoformat(),
            },
        )
        add_training_log(supabase, job_id, f"Training failed: {exc}", level="error")
        raise


def main() -> None:
    redis_connection = get_redis_connection()
    from rq import Queue

    queue = Queue(settings.training_queue_name, connection=redis_connection)
    with Connection(redis_connection):
        worker = Worker([queue], connection=redis_connection)
        worker.work(with_scheduler=False)


if __name__ == "__main__":
    main()