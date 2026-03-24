import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.cache import redis_client
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Link, User
from app.schemas import ApiResponse
from app.services import analytics_service

router = APIRouter(prefix="/api/links", tags=["analytics"])

ANALYTICS_TTL = 60  # seconds


async def _cached_or_fetch(cache_key: str, fetch_fn, ttl: int = ANALYTICS_TTL):
    """Return cached JSON if available, otherwise call fetch_fn and cache the result."""
    try:
        cached = await redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass

    data = await fetch_fn()

    try:
        await redis_client.set(cache_key, json.dumps(data, default=str), ex=ttl)
    except Exception:
        pass

    return data


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
    data = await _cached_or_fetch(
        f"analytics:{link.id}:stats",
        lambda: analytics_service.get_stats(db, link.id),
    )
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
    data = await _cached_or_fetch(
        f"analytics:{link.id}:clicks:{range}",
        lambda: analytics_service.get_clicks_timeseries(db, link.id, range),
    )
    return ApiResponse(data=data)


@router.get("/{code}/referrers")
async def link_referrers(
    code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    link = await _get_owned_link(code, user, db)
    data = await _cached_or_fetch(
        f"analytics:{link.id}:referrers",
        lambda: analytics_service.get_referrers(db, link.id),
    )
    return ApiResponse(data={"referrers": data})


@router.get("/{code}/geo")
async def link_geo(
    code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    link = await _get_owned_link(code, user, db)
    data = await _cached_or_fetch(
        f"analytics:{link.id}:geo",
        lambda: analytics_service.get_geo_breakdown(db, link.id),
    )
    return ApiResponse(data={"geo": data})


@router.get("/{code}/devices")
async def link_devices(
    code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    link = await _get_owned_link(code, user, db)
    data = await _cached_or_fetch(
        f"analytics:{link.id}:devices",
        lambda: analytics_service.get_devices(db, link.id),
    )
    return ApiResponse(data=data)
