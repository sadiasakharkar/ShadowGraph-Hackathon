import os
import time
from collections import deque
from typing import Callable

from fastapi.responses import JSONResponse

from app.services import db

_local_hits: dict[str, deque[float]] = {}


async def _redis_count(key: str, window_seconds: int) -> int:
    if not db.redis_client:
        return -1
    now = time.time()
    member = str(time.time_ns())
    pipe = db.redis_client.pipeline()
    await pipe.zremrangebyscore(key, 0, now - window_seconds)
    await pipe.zadd(key, {member: now})
    await pipe.zcard(key)
    await pipe.expire(key, window_seconds + 5)
    _, _, count, _ = await pipe.execute()
    return int(count)


def _local_count(key: str, window_seconds: int) -> int:
    q = _local_hits.setdefault(key, deque())
    now = time.time()
    while q and (now - q[0]) > window_seconds:
        q.popleft()
    q.append(now)
    return len(q)


async def rate_limit_middleware(request, call_next: Callable):
    max_requests = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", "120"))
    window_seconds = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
    client = request.client.host if request.client else "unknown"
    path = request.url.path
    key = f"ratelimit:{client}:{path}"

    count = await _redis_count(key, window_seconds)
    if count < 0:
        count = _local_count(key, window_seconds)

    if count > max_requests:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded", "path": path, "window_seconds": window_seconds, "max_requests": max_requests},
        )
    return await call_next(request)
