"""
RQ queue helpers for background training jobs.
"""

from __future__ import annotations

from redis import Redis
from rq import Queue

from app.config import get_settings


settings = get_settings()


def get_redis_connection() -> Redis:
    return Redis.from_url(settings.redis_url)


def get_training_queue() -> Queue:
    return Queue(settings.training_queue_name, connection=get_redis_connection())