from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.cache import redis_client
from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user_or_api_key
from app.models import Link, User
from app.schemas import (
    ApiResponse,
    CreateLinkRequest,
    LinkResponse,
    PaginatedLinksResponse,
    UpdateLinkRequest,
)
from app.services.url_service import generate_short_code

router = APIRouter(prefix="/api/links", tags=["links"])


def _link_to_response(link: Link, include_url: bool = True) -> dict:
    resp = LinkResponse(
        id=link.id,
        short_code=link.short_code,
        original_url=link.original_url,
        short_url=f"{settings.BACKEND_BASE_URL}/{link.short_code}" if include_url else None,
        title=link.title,
        created_at=link.created_at.isoformat() if link.created_at else "",
        expires_at=link.expires_at.isoformat() if link.expires_at else None,
        click_count=link.click_count,
        is_active=link.is_active,
    )
    return resp.model_dump()


@router.post("", status_code=201)
async def create_link(
    body: CreateLinkRequest,
    user: User = Depends(get_current_user_or_api_key),
    db: AsyncSession = Depends(get_db),
):
    if body.custom_code:
        existing = await db.execute(
            select(Link).where(Link.short_code == body.custom_code)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Short code already taken")
        code = body.custom_code
    else:
        code = None
        for _ in range(3):
            candidate = generate_short_code()
            existing = await db.execute(
                select(Link).where(Link.short_code == candidate)
            )
            if not existing.scalar_one_or_none():
                code = candidate
                break
        if code is None:
            raise HTTPException(status_code=500, detail="Failed to generate unique short code")

    expires_at = None
    if body.expires_in:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=body.expires_in)

    link = Link(
        user_id=user.id,
        short_code=code,
        original_url=body.url,
        expires_at=expires_at,
    )
    db.add(link)
    await db.commit()
    await db.refresh(link)

    return ApiResponse(data=_link_to_response(link))


@router.get("")
async def list_links(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user_or_api_key),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit

    total_result = await db.execute(
        select(func.count()).select_from(Link).where(Link.user_id == user.id)
    )
    total = total_result.scalar() or 0

    result = await db.execute(
        select(Link)
        .where(Link.user_id == user.id)
        .order_by(Link.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    links = result.scalars().all()

    return ApiResponse(
        data=PaginatedLinksResponse(
            links=[LinkResponse(**_link_to_response(l)) for l in links],
            total=total,
            page=page,
            limit=limit,
        ).model_dump()
    )


@router.get("/{code}")
async def get_link(
    code: str,
    user: User = Depends(get_current_user_or_api_key),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Link).where(Link.short_code == code, Link.user_id == user.id)
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    return ApiResponse(data=_link_to_response(link))


@router.patch("/{code}")
async def update_link(
    code: str,
    body: UpdateLinkRequest,
    user: User = Depends(get_current_user_or_api_key),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Link).where(Link.short_code == code, Link.user_id == user.id)
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    update_data = body.model_dump(exclude_unset=True)
    if update_data:
        await db.execute(
            update(Link).where(Link.id == link.id).values(**update_data)
        )
        await db.commit()
        await db.refresh(link)
        # Invalidate cached redirect so new values take effect immediately
        await redis_client.delete(f"url:{link.short_code}")

    return ApiResponse(data=_link_to_response(link))


@router.delete("/{code}")
async def delete_link(
    code: str,
    user: User = Depends(get_current_user_or_api_key),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Link).where(Link.short_code == code, Link.user_id == user.id)
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    await db.execute(
        update(Link).where(Link.id == link.id).values(is_active=False)
    )
    await db.commit()

    # Invalidate Redis cache
    await redis_client.delete(f"url:{code}")

    return ApiResponse(data={"message": "Link deactivated"})
