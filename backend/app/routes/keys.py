import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import ApiKey, User
from app.schemas import ApiResponse

router = APIRouter(prefix="/api/keys", tags=["api-keys"])


@router.post("", status_code=201)
async def create_api_key(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raw_key = f"sk_live_{secrets.token_hex(16)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

    api_key = ApiKey(user_id=user.id, key_hash=key_hash, key_suffix=raw_key[-4:])
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)

    return ApiResponse(
        data={
            "id": str(api_key.id),
            "key": raw_key,
            "created_at": api_key.created_at.isoformat() if api_key.created_at else "",
        }
    )


@router.get("")
async def list_api_keys(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.user_id == user.id).order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()

    return ApiResponse(
        data={
            "keys": [
                {
                    "id": str(k.id),
                    "key_preview": f"sk_live_...{k.key_suffix}",
                    "created_at": k.created_at.isoformat() if k.created_at else "",
                    "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None,
                    "is_active": k.is_active,
                }
                for k in keys
            ]
        }
    )


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user.id)
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    await db.execute(
        update(ApiKey).where(ApiKey.id == api_key.id).values(is_active=False)
    )
    await db.commit()

    return ApiResponse(data={"message": "API key revoked"})
