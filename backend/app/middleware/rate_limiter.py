import time
import uuid

from fastapi import Depends, HTTPException, Request

from app.cache import redis_client
from app.dependencies import get_optional_user
from app.models import User


RATE_LIMITS = {
    "free": {"write": 10, "read": 100},
    "pro": {"write": 60, "read": 600},
    "redirect": {"limit": 200},
}


async def check_rate_limit(
    key: str,
    limit: int,
    window: int = 60,
) -> None:
    now = time.time()
    window_start = now - window
    member = f"{now}:{uuid.uuid4().hex[:8]}"

    # Use pipeline for atomicity to prevent race conditions
    results = await redis_client._post_command([
        ["ZREMRANGEBYSCORE", key, 0, window_start],
        ["ZADD", key, now, member],
        ["ZCARD", key],
        ["EXPIRE", key, window],
    ])
    count = int(results[2]) if results[2] else 0

    if count > limit:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={"Retry-After": str(window)},
        )


async def rate_limit_redirect(request: Request) -> None:
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    if "," in ip:
        ip = ip.split(",")[0].strip()
    await check_rate_limit(f"rate:{ip}:redirect", RATE_LIMITS["redirect"]["limit"])


async def rate_limit_write(
    request: Request,
    user: User | None = Depends(get_optional_user),
) -> None:
    if user:
        limit = RATE_LIMITS.get(user.tier, RATE_LIMITS["free"])["write"]
        await check_rate_limit(f"rate:{user.id}:write", limit)
    else:
        ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
        if "," in ip:
            ip = ip.split(",")[0].strip()
        await check_rate_limit(f"rate:{ip}:write", RATE_LIMITS["free"]["write"])


async def rate_limit_read(
    request: Request,
    user: User | None = Depends(get_optional_user),
) -> None:
    if user:
        limit = RATE_LIMITS.get(user.tier, RATE_LIMITS["free"])["read"]
        await check_rate_limit(f"rate:{user.id}:read", limit)
    else:
        ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
        if "," in ip:
            ip = ip.split(",")[0].strip()
        await check_rate_limit(f"rate:{ip}:read", RATE_LIMITS["free"]["read"])
