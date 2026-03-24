import json
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from user_agents import parse as parse_ua

from app.cache import redis_client
from app.database import get_db
from app.middleware.rate_limiter import rate_limit_redirect
from app.models import Link
from app.schemas import ApiResponse

router = APIRouter(tags=["redirect"])

RESERVED_CODES = {"api", "health", "docs", "openapi.json"}


async def _log_click(
    request: Request,
    link_id: int,
) -> None:
    """Log click data to Redis buffer (runs as background task)."""
    ua_string = request.headers.get("user-agent", "")
    ua = parse_ua(ua_string)
    device_type = "mobile" if ua.is_mobile else "tablet" if ua.is_tablet else "desktop"
    browser = ua.browser.family

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    if "," in ip:
        ip = ip.split(",")[0].strip()

    referrer = request.headers.get("referer") or None

    # GeoIP lookup (best-effort) — uses shared client from app.state
    country = None
    city = None
    try:
        http_client = request.app.state.http_client
        # ip-api.com free tier requires HTTP; HTTPS needs Pro plan.
        # IP is resolved to country/city here then discarded — never stored.
        geo_resp = await http_client.get(f"http://ip-api.com/json/{ip}?fields=country,city")
        if geo_resp.status_code == 200:
            geo = geo_resp.json()
            country = geo.get("country")
            city = geo.get("city")
    except Exception:
        pass

    click_data = {
        "user_agent": ua_string,
        "referrer": referrer,
        "country": country,
        "city": city,
        "device_type": device_type,
        "browser": browser,
    }

    click_buffer = request.app.state.click_buffer
    await click_buffer.push_click(link_id, click_data)
    await click_buffer.register_link_id(link_id)


@router.get("/{short_code}", dependencies=[Depends(rate_limit_redirect)])
async def redirect_short_url(
    short_code: str,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    # Skip if this looks like an API route
    if short_code in RESERVED_CODES:
        raise HTTPException(status_code=404, detail="Not found")

    # Check Redis cache first
    cached = await redis_client.get(f"url:{short_code}")
    if cached:
        try:
            data = json.loads(cached)
        except (json.JSONDecodeError, TypeError):
            data = None

        if data:
            if not data["active"]:
                await redis_client.delete(f"url:{short_code}")
                raise HTTPException(status_code=410, detail="This link has been deactivated")
            if data["expires"] and datetime.fromisoformat(data["expires"]) < datetime.now(timezone.utc):
                await redis_client.delete(f"url:{short_code}")
                raise HTTPException(status_code=410, detail="This link has expired")
            background_tasks.add_task(_log_click, request, data["id"])
            return RedirectResponse(url=data["url"], status_code=302)

    # Cache miss — lookup in PostgreSQL
    result = await db.execute(
        select(Link).where(Link.short_code == short_code)
    )
    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(status_code=404, detail="Short URL not found")

    if not link.is_active:
        raise HTTPException(status_code=410, detail="This link has been deactivated")

    if link.expires_at and link.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="This link has expired")

    # Cache in Redis (1 hour TTL) — JSON with validation fields
    cache_val = json.dumps({
        "id": link.id,
        "url": link.original_url,
        "active": link.is_active,
        "expires": link.expires_at.isoformat() if link.expires_at else None,
    })
    await redis_client.set(f"url:{short_code}", cache_val, ex=3600)

    # Log click async
    background_tasks.add_task(_log_click, request, link.id)

    return RedirectResponse(url=link.original_url, status_code=302)
