"""Admin training platform endpoints."""

from __future__ import annotations

import asyncio
import io
import json
import math
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, WebSocket, WebSocketDisconnect, status
from supabase import Client

from app.middleware.auth import CurrentAdmin, _sync_local_user
from app.schemas.training_admin import (
    DatasetAssetResponse,
    DatasetCreateRequest,
    DatasetResponse,
    DatasetSplitRequest,
    DatasetUploadResponse,
    DatasetUpdateRequest,
    DeployModelRequest,
    DeployModelResponse,
    ModelVersionResponse,
    TrainingJobCreateRequest,
    TrainingJobResponse,
    TrainingLogResponse,
    TrainingMonitorPayload,
)
from app.services.model_runtime import get_active_weights_path
from app.services.storage_service import STORAGE_ROOT, get_dataset_storage
from app.services.training_queue import get_training_queue
from app.services.training_registry import (
    activate_model_version,
    add_training_log,
    build_dataset_summary,
    create_dataset,
    create_training_job,
    delete_dataset,
    delete_dataset_asset,
    get_dataset_by_id,
    get_model_version,
    get_training_job,
    list_dataset_assets,
    list_datasets,
    list_model_versions,
    list_training_jobs,
    list_training_logs,
    slugify_dataset,
    update_dataset,
    update_model_version,
    update_training_job,
    upsert_dataset_asset,
)
from app.supabase_client import get_supabase_client, get_supabase
from app.services.model_runtime import write_active_model_manifest
from app.workers.training_worker import run_training_job


router = APIRouter(prefix="/admin/training", tags=["Admin Training"])


def _dataset_response(row: dict[str, Any]) -> DatasetResponse:
    return DatasetResponse.model_validate(row)


def _job_response(row: dict[str, Any]) -> TrainingJobResponse:
    return TrainingJobResponse.model_validate(row)


def _model_response(row: dict[str, Any]) -> ModelVersionResponse:
    return ModelVersionResponse.model_validate(row)


def _log_response(row: dict[str, Any]) -> TrainingLogResponse:
    return TrainingLogResponse.model_validate(row)


def _dataset_asset_response(row: dict[str, Any]) -> DatasetAssetResponse:
    return DatasetAssetResponse.model_validate(row)


async def _resolve_admin_websocket(websocket: WebSocket, client: Client) -> dict[str, Any]:
    token = websocket.cookies.get("access_token")
    if token:
        token = token.replace('"', "")
    if not token:
        token = websocket.query_params.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing access token")
    from app.services.supabase_auth import get_user_from_access_token

    supabase_user = await get_user_from_access_token(token)
    current_user = await _sync_local_user(client, supabase_user)
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user


@router.get("/datasets", response_model=list[DatasetResponse])
async def api_list_datasets(
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    return [_dataset_response(item) for item in list_datasets(supabase)]


@router.post("/datasets", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def api_create_dataset(
    payload: DatasetCreateRequest,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    storage = get_dataset_storage()
    slug = payload.slug or slugify_dataset(payload.name)
    if hasattr(storage, "dataset_dir"):
        storage.dataset_dir(slug)
    dataset = create_dataset(supabase, payload.model_dump(), created_by=str(admin["id"]))
    return _dataset_response(dataset)


@router.patch("/datasets/{dataset_id}", response_model=DatasetResponse)
async def api_update_dataset(
    dataset_id: str,
    payload: DatasetUpdateRequest,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    dataset = update_dataset(supabase, dataset_id, payload.model_dump())
    return _dataset_response(dataset)


@router.delete("/datasets/{dataset_id}")
async def api_delete_dataset(
    dataset_id: str,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    delete_dataset(supabase, dataset_id)
    return {"ok": True}


@router.get("/datasets/{dataset_id}/assets", response_model=list[DatasetAssetResponse])
async def api_list_dataset_assets(
    dataset_id: str,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    return [_dataset_asset_response(item) for item in list_dataset_assets(supabase, dataset_id)]


@router.delete("/datasets/{dataset_id}/assets/{asset_id}")
async def api_delete_asset(
    dataset_id: str,
    asset_id: str,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    asset_row = supabase.table("dataset_assets").select("*").eq("id", asset_id).execute().data
    if not asset_row:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset = asset_row[0]
    storage = get_dataset_storage()
    try:
        storage.delete_asset(asset["file_path"])
    except Exception as e:
        print(f"Failed to delete physical asset: {e}")
        
    delete_dataset_asset(supabase, asset_id)
    
    from app.services.training_registry import sync_dataset_stats
    try:
        sync_dataset_stats(supabase, dataset_id)
    except Exception as e:
        print(f"Failed to sync dataset stats after deletion: {e}")
        
    return {"ok": True}


@router.get("/datasets/{dataset_id}/stats")
async def api_dataset_stats(
    dataset_id: str,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    dataset = get_dataset_by_id(supabase, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    assets = list_dataset_assets(supabase, dataset_id)
    return build_dataset_summary(dataset, assets)


@router.post("/datasets/{dataset_id}/upload", response_model=DatasetUploadResponse)
async def api_upload_dataset_assets(
    dataset_id: str,
    split: str = Form("train"),
    asset_type: str = Form("image"),
    files: list[UploadFile] = File(...),
    admin: CurrentAdmin = None,
    supabase: Client = Depends(get_supabase_client),
):
    dataset = get_dataset_by_id(supabase, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    storage = get_dataset_storage()
    uploaded_assets: list[DatasetAssetResponse] = []
    for upload_file in files:
        stored = await storage.save_upload(dataset["slug"], split, upload_file, asset_type=asset_type)
        asset_row = {
            "dataset_id": dataset_id,
            "file_name": stored.file_name,
            "split": split,
            "asset_type": asset_type,
            "file_path": stored.file_path,
            "label_path": stored.label_path,
            "preview_url": stored.preview_url,
            "size_bytes": stored.size_bytes,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        row = upsert_dataset_asset(supabase, asset_row)
        uploaded_assets.append(_dataset_asset_response(row))

    from app.services.training_registry import sync_dataset_stats
    try:
        sync_dataset_stats(supabase, dataset_id)
    except Exception as e:
        print(f"Failed to sync dataset stats: {e}")

    return DatasetUploadResponse(dataset_id=dataset_id, uploaded=len(uploaded_assets), assets=uploaded_assets)


@router.post("/datasets/{dataset_id}/upload-zip", response_model=DatasetUploadResponse)
async def api_upload_zip_dataset(
    dataset_id: str,
    split: str = Form("train"),
    zip_file: UploadFile = File(...),
    admin: CurrentAdmin = None,
    supabase: Client = Depends(get_supabase_client),
):
    dataset = get_dataset_by_id(supabase, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    storage = get_dataset_storage()
    if not hasattr(storage, "dataset_dir"):
        raise HTTPException(status_code=400, detail="ZIP import currently supports local storage only")

    raw_zip = await zip_file.read()
    dataset_dir = storage.dataset_dir(dataset["slug"])
    uploaded_assets: list[DatasetAssetResponse] = []

    with zipfile.ZipFile(io.BytesIO(raw_zip)) as archive:
        for member in archive.infolist():
            if member.is_dir():
                continue
            lower_name = member.filename.lower()
            asset_type = "label" if lower_name.endswith(".txt") else "image"
            if asset_type == "image" and not lower_name.endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff")):
                continue
            target_folder = dataset_dir / ("labels" if asset_type == "label" else "images") / split
            target_folder.mkdir(parents=True, exist_ok=True)
            target_path = target_folder / Path(member.filename).name
            target_path.write_bytes(archive.read(member))
            asset_row = {
                "dataset_id": dataset_id,
                "file_name": Path(member.filename).name,
                "split": split,
                "asset_type": asset_type,
                "file_path": str(target_path.relative_to(STORAGE_ROOT).as_posix()),
                "label_path": None,
                "preview_url": f"/storage/datasets/{dataset['slug']}/{('labels' if asset_type == 'label' else 'images')}/{split}/{Path(member.filename).name}",
                "size_bytes": member.file_size or target_path.stat().st_size,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            row = upsert_dataset_asset(supabase, asset_row)
            uploaded_assets.append(_dataset_asset_response(row))

    from app.services.training_registry import sync_dataset_stats
    try:
        sync_dataset_stats(supabase, dataset_id)
    except Exception as e:
        print(f"Failed to sync dataset stats: {e}")

    return DatasetUploadResponse(dataset_id=dataset_id, uploaded=len(uploaded_assets), assets=uploaded_assets)


@router.post("/datasets/{dataset_id}/split")
async def api_split_dataset(
    dataset_id: str,
    payload: DatasetSplitRequest,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    dataset = get_dataset_by_id(supabase, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    image_count = int(dataset.get("image_count") or 0)
    updated = update_dataset(
        supabase,
        dataset_id,
        {
            "train_count": math.floor(image_count * payload.train_ratio),
            "val_count": math.floor(image_count * payload.val_ratio),
            "test_count": math.floor(image_count * payload.test_ratio),
        },
    )
    return _dataset_response(updated)


@router.get("/training-jobs", response_model=list[TrainingJobResponse])
async def api_list_training_jobs(
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    return [_job_response(item) for item in list_training_jobs(supabase)]


@router.post("/training-jobs", response_model=TrainingJobResponse, status_code=status.HTTP_201_CREATED)
async def api_create_training_job(
    payload: TrainingJobCreateRequest,
    background_tasks: BackgroundTasks,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    dataset = get_dataset_by_id(supabase, str(payload.dataset_id))
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    job = create_training_job(supabase, payload.model_dump(mode="json"), created_by=str(admin["id"]))
    
    try:
        queue = get_training_queue()
        queue.connection.ping()
        queue.enqueue(run_training_job, str(job["id"]), job_timeout=60 * 60 * 24)
        add_training_log(supabase, str(job["id"]), "Training job queued in Redis Queue", metadata={"dataset": dataset["slug"]})
    except Exception as e:
        print(f"Redis queue connection failed. Running locally using FastAPI BackgroundTasks. Error: {e}")
        background_tasks.add_task(run_training_job, str(job["id"]))
        add_training_log(supabase, str(job["id"]), "Training job initialized locally in FastAPI background thread", metadata={"dataset": dataset["slug"]})
        
    return _job_response(job)


@router.get("/training-jobs/{job_id}", response_model=TrainingJobResponse)
async def api_get_training_job(
    job_id: str,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    job = get_training_job(supabase, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Training job not found")
    return _job_response(job)


@router.get("/training-jobs/{job_id}/logs", response_model=list[TrainingLogResponse])
async def api_get_training_logs(
    job_id: str,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    return [_log_response(item) for item in list_training_logs(supabase, job_id)]


@router.websocket("/training-jobs/{job_id}/ws")
async def api_training_job_ws(websocket: WebSocket, job_id: str):
    await websocket.accept()
    client = get_supabase()
    current_user = await _resolve_admin_websocket(websocket, client)
    try:
        while True:
            job = get_training_job(client, job_id)
            if job:
                logs = list_training_logs(client, job_id, limit=25)
                payload = TrainingMonitorPayload(
                    training_job=_job_response(job),
                    recent_logs=[_log_response(item) for item in logs],
                )
                await websocket.send_json(payload.model_dump(mode="json"))
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        return


@router.get("/models", response_model=list[ModelVersionResponse])
async def api_list_models(
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    return [_model_response(item) for item in list_model_versions(supabase)]


@router.post("/models/{model_version_id}/activate", response_model=ModelVersionResponse)
async def api_activate_model(
    model_version_id: str,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    activated = activate_model_version(supabase, model_version_id, deployed_by=str(admin["id"]))
    model = _model_response(activated)
    from app.services.video_service import get_video_processor

    processor = get_video_processor()
    if processor and hasattr(processor, "engine"):
        try:
            processor.engine.reload_model(model.weights_path)
        except Exception:
            pass
    return model


@router.post("/models/{model_version_id}/deploy", response_model=DeployModelResponse)
async def api_deploy_model(
    model_version_id: str,
    payload: DeployModelRequest,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    activated = activate_model_version(supabase, model_version_id, deployed_by=str(admin["id"]))
    model = _model_response(activated)
    if payload.restart_inference:
        from app.services.video_service import get_video_processor

        processor = get_video_processor()
        if processor and hasattr(processor, "engine"):
            try:
                processor.engine.reload_model(model.weights_path)
            except Exception:
                pass
    return DeployModelResponse(model_version=model, active_model_path=get_active_weights_path(model.weights_path), message="Model deployed and activated")


@router.post("/models/{model_version_id}/rollback", response_model=ModelVersionResponse)
async def api_rollback_model(
    model_version_id: str,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    activated = activate_model_version(supabase, model_version_id, deployed_by=str(admin["id"]))
    return _model_response(activated)


@router.delete("/models/{model_version_id}")
async def api_delete_model(
    model_version_id: str,
    admin: CurrentAdmin,
    supabase: Client = Depends(get_supabase_client),
):
    supabase.table("model_versions").delete().eq("id", model_version_id).execute()
    return {"ok": True}