"""
Dataset storage adapters for local disk, Supabase Storage, and S3-compatible backends.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import boto3
from botocore.client import Config as BotoConfig
from fastapi import UploadFile

from app.config import get_settings
from app.supabase_client import get_supabase


settings = get_settings()
PROJECT_ROOT = Path(__file__).resolve().parents[3]
STORAGE_ROOT = PROJECT_ROOT / "storage"
DATASET_ROOT = STORAGE_ROOT / "datasets"
MODEL_ROOT = STORAGE_ROOT / "models"


@dataclass
class StoredAsset:
    file_name: str
    file_path: str
    preview_url: Optional[str]
    size_bytes: int
    asset_type: str
    split: str
    label_path: Optional[str] = None


class LocalDatasetStorage:
    def __init__(self, base_path: Path | str = DATASET_ROOT) -> None:
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def dataset_dir(self, slug: str) -> Path:
        dataset_dir = self.base_path / slug
        (dataset_dir / "images").mkdir(parents=True, exist_ok=True)
        (dataset_dir / "labels").mkdir(parents=True, exist_ok=True)
        for split in ("train", "val", "test"):
            (dataset_dir / "images" / split).mkdir(parents=True, exist_ok=True)
            (dataset_dir / "labels" / split).mkdir(parents=True, exist_ok=True)
        return dataset_dir

    async def save_upload(
        self,
        dataset_slug: str,
        split: str,
        upload_file: UploadFile,
        asset_type: str = "image",
    ) -> StoredAsset:
        dataset_dir = self.dataset_dir(dataset_slug)
        prefix = "labels" if asset_type == "label" else "images"
        target_dir = dataset_dir / prefix / split
        target_dir.mkdir(parents=True, exist_ok=True)

        file_name = upload_file.filename or f"asset_{uuid.uuid4().hex}"
        target_path = target_dir / file_name
        content = await upload_file.read()
        target_path.write_bytes(content)

        preview_url = f"/storage/datasets/{dataset_slug}/{prefix}/{split}/{file_name}"
        label_path = None
        if asset_type == "image":
            candidate = dataset_dir / "labels" / split / f"{Path(file_name).stem}.txt"
            if candidate.exists():
                label_path = str(candidate.relative_to(STORAGE_ROOT).as_posix())

        return StoredAsset(
            file_name=file_name,
            file_path=str(target_path.relative_to(STORAGE_ROOT).as_posix()),
            preview_url=preview_url,
            size_bytes=len(content),
            asset_type=asset_type,
            split=split,
            label_path=label_path,
        )

    def delete_asset(self, relative_path: str) -> None:
        target = STORAGE_ROOT / relative_path
        if target.exists():
            target.unlink()

    def write_text(self, relative_path: str, content: str) -> str:
        target = STORAGE_ROOT / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        return str(target.relative_to(STORAGE_ROOT).as_posix())

    def read_text(self, relative_path: str) -> str:
        return (STORAGE_ROOT / relative_path).read_text(encoding="utf-8")


class SupabaseDatasetStorage:
    def __init__(self, bucket: Optional[str] = None) -> None:
        self.bucket = bucket or settings.dataset_storage_bucket
        self.client = get_supabase()

    async def save_upload(self, dataset_slug: str, split: str, upload_file: UploadFile, asset_type: str = "image") -> StoredAsset:
        file_name = upload_file.filename or f"asset_{uuid.uuid4().hex}"
        content = await upload_file.read()
        prefix = "labels" if asset_type == "label" else "images"
        file_path = f"{dataset_slug}/{prefix}/{split}/{file_name}"
        self.client.storage.from_(self.bucket).upload(
            file_path,
            content,
            file_options={"content-type": upload_file.content_type or "application/octet-stream"},
        )
        preview_url = self.client.storage.from_(self.bucket).get_public_url(file_path)
        return StoredAsset(
            file_name=file_name,
            file_path=file_path,
            preview_url=preview_url if isinstance(preview_url, str) else None,
            size_bytes=len(content),
            asset_type=asset_type,
            split=split,
        )

    def delete_asset(self, relative_path: str) -> None:
        self.client.storage.from_(self.bucket).remove([relative_path])

    def write_text(self, relative_path: str, content: str) -> str:
        self.client.storage.from_(self.bucket).upload(
            relative_path,
            content.encode("utf-8"),
            file_options={"content-type": "text/plain; charset=utf-8"},
        )
        return relative_path

    def read_text(self, relative_path: str) -> str:
        raise NotImplementedError("Reading remote text files is not implemented for Supabase storage")


class S3DatasetStorage:
    def __init__(self) -> None:
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url or None,
            aws_access_key_id=settings.s3_access_key_id or None,
            aws_secret_access_key=settings.s3_secret_access_key or None,
            config=BotoConfig(signature_version="s3v4"),
        )
        self.bucket = settings.s3_bucket_name

    async def save_upload(self, dataset_slug: str, split: str, upload_file: UploadFile, asset_type: str = "image") -> StoredAsset:
        file_name = upload_file.filename or f"asset_{uuid.uuid4().hex}"
        content = await upload_file.read()
        prefix = "labels" if asset_type == "label" else "images"
        file_path = f"{dataset_slug}/{prefix}/{split}/{file_name}"
        self.client.put_object(Bucket=self.bucket, Key=file_path, Body=content, ContentType=upload_file.content_type or "application/octet-stream")
        return StoredAsset(
            file_name=file_name,
            file_path=file_path,
            preview_url=f"{settings.s3_endpoint_url}/{self.bucket}/{file_path}" if settings.s3_endpoint_url else None,
            size_bytes=len(content),
            asset_type=asset_type,
            split=split,
        )

    def delete_asset(self, relative_path: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=relative_path)

    def write_text(self, relative_path: str, content: str) -> str:
        self.client.put_object(Bucket=self.bucket, Key=relative_path, Body=content.encode("utf-8"), ContentType="text/plain; charset=utf-8")
        return relative_path

    def read_text(self, relative_path: str) -> str:
        response = self.client.get_object(Bucket=self.bucket, Key=relative_path)
        return response["Body"].read().decode("utf-8")


def get_dataset_storage() -> LocalDatasetStorage | SupabaseDatasetStorage | S3DatasetStorage:
    backend = settings.dataset_storage_backend.lower().strip()
    if backend == "supabase":
        return SupabaseDatasetStorage()
    if backend in {"s3", "minio"}:
        return S3DatasetStorage()
    return LocalDatasetStorage()