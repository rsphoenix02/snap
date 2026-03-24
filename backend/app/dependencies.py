import hashlib
from datetime import datetime, timezone
from uuid import UUID

from fastapi import Cookie, Depends, HTTPException, Request
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import ApiKey, User
from app.services.auth_service import verify_token


def _extract_bearer_token(request: Request) -> str | None:
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        return auth[7:]
    return None


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    token = _extract_bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = verify_token(token, expected_type="access", secret=settings.JWT_SECRET)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_optional_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User | None:
    token = _extract_bearer_token(request)
    if not token:
        return None
    user_id = verify_token(token, expected_type="access", secret=settings.JWT_SECRET)
    if not user_id:
        return None
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    return result.scalar_one_or_none()


async def get_current_user_or_api_key(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    token = _extract_bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Try JWT first
    user_id = verify_token(token, expected_type="access", secret=settings.JWT_SECRET)
    if user_id:
        result = await db.execute(select(User).where(User.id == UUID(user_id)))
        user = result.scalar_one_or_none()
        if user:
            return user

    # Try API key (sk_live_...)
    if token.startswith("sk_live_"):
        key_hash = hashlib.sha256(token.encode()).hexdigest()
        result = await db.execute(
            select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.is_active.is_(True))
        )
        api_key = result.scalar_one_or_none()
        if api_key:
            await db.execute(
                update(ApiKey)
                .where(ApiKey.id == api_key.id)
                .values(last_used_at=datetime.now(timezone.utc))
            )
            await db.commit()
            user_result = await db.execute(select(User).where(User.id == api_key.user_id))
            user = user_result.scalar_one_or_none()
            if user:
                return user

    raise HTTPException(status_code=401, detail="Invalid credentials")
