import time
import uuid

from fastapi import Depends, HTTPException, Request
from starlette.responses import JSONResponse

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

    await redis_client.zremrangebyscore(key, 0, window_start)
    await redis_client.zadd(key, now, f"{now}:{uuid.uuid4().hex[:8]}")
    count = await redis_client.zcard(key)
    await redis_client.expire(key, window)

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


def rate_limit_write(user: User = Depends(get_optional_user)):
    async def _check(request: Request):
        if user:
            limit = RATE_LIMITS.get(user.tier, RATE_LIMITS["free"])["write"]
            await check_rate_limit(f"rate:{user.id}:write", limit)
        else:
            ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
            await check_rate_limit(f"rate:{ip}:write", RATE_LIMITS["free"]["write"])
    return _check


def rate_limit_read(user: User = Depends(get_optional_user)):
    async def _check(request: Request):
        if user:
            limit = RATE_LIMITS.get(user.tier, RATE_LIMITS["free"])["read"]
            await check_rate_limit(f"rate:{user.id}:read", limit)
        else:
            ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
            await check_rate_limit(f"rate:{ip}:read", RATE_LIMITS["free"]["read"])
    return _check
