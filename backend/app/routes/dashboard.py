from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Link, User
from app.schemas import ApiResponse

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
async def dashboard_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Total links
    total_links_result = await db.execute(
        select(func.count()).select_from(Link).where(Link.user_id == user.id)
    )
    total_links = total_links_result.scalar() or 0

    # Total clicks
    total_clicks_result = await db.execute(
        select(func.coalesce(func.sum(Link.click_count), 0)).where(Link.user_id == user.id)
    )
    total_clicks = total_clicks_result.scalar() or 0

    # Top link
    top_link_result = await db.execute(
        select(Link)
        .where(Link.user_id == user.id)
        .order_by(Link.click_count.desc())
        .limit(1)
    )
    top_link = top_link_result.scalar_one_or_none()

    top_link_data = None
    if top_link:
        top_link_data = {
            "short_code": top_link.short_code,
            "original_url": top_link.original_url,
            "click_count": top_link.click_count,
        }

    return ApiResponse(
        data={
            "total_links": total_links,
            "total_clicks": total_clicks,
            "top_link": top_link_data,
        }
    )
