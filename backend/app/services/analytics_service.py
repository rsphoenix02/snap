from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select, case, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Click


async def get_stats(db: AsyncSession, link_id: int) -> dict:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())

    result = await db.execute(
        select(
            func.count(Click.id).label("total_clicks"),
            func.count(case((Click.clicked_at >= today_start, 1))).label("clicks_today"),
            func.count(case((Click.clicked_at >= week_start, 1))).label("clicks_this_week"),
        ).where(Click.link_id == link_id)
    )
    row = result.one()

    # Top country
    country_result = await db.execute(
        select(Click.country, func.count(Click.id).label("cnt"))
        .where(Click.link_id == link_id, Click.country.is_not(None))
        .group_by(Click.country)
        .order_by(text("cnt DESC"))
        .limit(1)
    )
    top_country_row = country_result.first()

    return {
        "total_clicks": row.total_clicks,
        "top_country": top_country_row.country if top_country_row else None,
        "clicks_today": row.clicks_today,
        "clicks_this_week": row.clicks_this_week,
    }


async def get_clicks_timeseries(db: AsyncSession, link_id: int, range_str: str) -> dict:
    now = datetime.now(timezone.utc)

    range_map = {
        "24h": (now - timedelta(hours=24), "hour"),
        "7d": (now - timedelta(days=7), "day"),
        "30d": (now - timedelta(days=30), "day"),
        "all": (None, "month"),
    }

    start_time, granularity = range_map.get(range_str, range_map["7d"])

    trunc_func = func.date_trunc(granularity, Click.clicked_at)
    query = (
        select(trunc_func.label("ts"), func.count(Click.id).label("cnt"))
        .where(Click.link_id == link_id)
        .group_by(text("ts"))
        .order_by(text("ts"))
    )
    if start_time:
        query = query.where(Click.clicked_at >= start_time)

    result = await db.execute(query)
    points = [
        {"timestamp": row.ts.isoformat() if row.ts else "", "count": row.cnt}
        for row in result.all()
    ]

    return {"range": range_str, "points": points}


async def get_referrers(db: AsyncSession, link_id: int) -> list[dict]:
    domain_expr = func.coalesce(
        func.regexp_replace(
            func.regexp_replace(
                func.nullif(Click.referrer, ""),
                r"^https?://", ""
            ),
            r"/.*$", ""
        ),
        "Direct"
    )
    result = await db.execute(
        select(
            domain_expr.label("source"),
            func.count(Click.id).label("cnt"),
        )
        .where(Click.link_id == link_id)
        .group_by(text("source"))
        .order_by(text("cnt DESC"))
        .limit(10)
    )
    return [{"source": row.source, "count": row.cnt} for row in result.all()]


async def get_geo_breakdown(db: AsyncSession, link_id: int) -> list[dict]:
    result = await db.execute(
        select(
            func.coalesce(Click.country, "Unknown").label("country"),
            func.count(Click.id).label("cnt"),
        )
        .where(Click.link_id == link_id)
        .group_by(text("country"))
        .order_by(text("cnt DESC"))
    )
    return [{"country": row.country, "count": row.cnt} for row in result.all()]


async def get_devices(db: AsyncSession, link_id: int) -> dict:
    devices_result = await db.execute(
        select(Click.device_type, func.count(Click.id).label("cnt"))
        .where(Click.link_id == link_id, Click.device_type.is_not(None))
        .group_by(Click.device_type)
        .order_by(text("cnt DESC"))
    )
    browsers_result = await db.execute(
        select(Click.browser, func.count(Click.id).label("cnt"))
        .where(Click.link_id == link_id, Click.browser.is_not(None))
        .group_by(Click.browser)
        .order_by(text("cnt DESC"))
    )
    return {
        "devices": [{"type": r.device_type, "count": r.cnt} for r in devices_result.all()],
        "browsers": [{"name": r.browser, "count": r.cnt} for r in browsers_result.all()],
    }
