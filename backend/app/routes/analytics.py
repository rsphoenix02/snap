from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Link, User
from app.schemas import ApiResponse
from app.services import analytics_service

router = APIRouter(prefix="/api/links", tags=["analytics"])


async def _get_owned_link(code: str, user: User, db: AsyncSession) -> Link:
    result = await db.execute(
        select(Link).where(Link.short_code == code, Link.user_id == user.id)
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    return link


@router.get("/{code}/stats")
async def link_stats(
    code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    link = await _get_owned_link(code, user, db)
    data = await analytics_service.get_stats(db, link.id)
    return ApiResponse(data=data)


@router.get("/{code}/clicks")
async def link_clicks(
    code: str,
    range: str = Query("7d", alias="range"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if range not in ("24h", "7d", "30d", "all"):
        raise HTTPException(status_code=400, detail="Invalid range. Use: 24h, 7d, 30d, all")
    link = await _get_owned_link(code, user, db)
    data = await analytics_service.get_clicks_timeseries(db, link.id, range)
    return ApiResponse(data=data)


@router.get("/{code}/referrers")
async def link_referrers(
    code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    link = await _get_owned_link(code, user, db)
    data = await analytics_service.get_referrers(db, link.id)
    return ApiResponse(data={"referrers": data})


@router.get("/{code}/devices")
async def link_devices(
    code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    link = await _get_owned_link(code, user, db)
    data = await analytics_service.get_devices(db, link.id)
    return ApiResponse(data=data)
