from __future__ import annotations

import asyncio
import json
import logging
from typing import TYPE_CHECKING

from sqlalchemy import update

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker

    from app.cache import RedisClient

from app.models import Click, Link

logger = logging.getLogger(__name__)


class ClickBuffer:
    def __init__(self, redis: "RedisClient", db_session_factory: "async_sessionmaker") -> None:
        self._redis = redis
        self._db_session_factory = db_session_factory
        self._running = False
        self._task: asyncio.Task | None = None

    async def push_click(self, link_id: int, click_data: dict) -> None:
        payload = json.dumps({"link_id": link_id, **click_data})
        await self._redis.lpush(f"clicks:{link_id}", payload)

    async def flush_to_db(self) -> None:
        """Flush all click buffers to PostgreSQL."""
        master_key = "clicks:active_links"
        active_ids_raw = await self._redis.smembers(master_key)

        if not active_ids_raw:
            return

        active_ids = list(set(int(x) for x in active_ids_raw))

        async with self._db_session_factory() as session:
            for link_id in active_ids:
                key = f"clicks:{link_id}"

                # Atomically read all and trim to prevent data loss
                # Use pipeline: LRANGE(0, -1) then LTRIM to clear
                results = await self._redis._post_command([
                    ["LRANGE", key, 0, -1],
                    ["DEL", key],
                ])
                raw_items = results[0] if results[0] else []

                if not raw_items:
                    # No clicks for this link, remove from active set
                    await self._redis.srem(master_key, str(link_id))
                    continue

                clicks_to_insert = []
                for raw in raw_items:
                    try:
                        data = json.loads(raw) if isinstance(raw, str) else raw
                        clicks_to_insert.append(
                            Click(
                                link_id=data["link_id"],
                                user_agent=data.get("user_agent"),
                                referrer=data.get("referrer"),
                                country=data.get("country"),
                                city=data.get("city"),
                                device_type=data.get("device_type"),
                                browser=data.get("browser"),
                            )
                        )
                    except (json.JSONDecodeError, KeyError) as e:
                        logger.warning("Skipping malformed click data: %s", e)

                if clicks_to_insert:
                    session.add_all(clicks_to_insert)
                    await session.execute(
                        update(Link)
                        .where(Link.id == link_id)
                        .values(click_count=Link.click_count + len(clicks_to_insert))
                    )

            await session.commit()

    async def start_flush_loop(self, interval: int = 30) -> None:
        self._running = True
        while self._running:
            try:
                await self.flush_to_db()
            except Exception as e:
                logger.error("Click buffer flush failed: %s", e)
            await asyncio.sleep(interval)

    async def shutdown_flush(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
        try:
            await self.flush_to_db()
        except Exception as e:
            logger.error("Final flush failed: %s", e)

    async def register_link_id(self, link_id: int) -> None:
        """Register a link_id in the active set (auto-deduplicates)."""
        await self._redis.sadd("clicks:active_links", str(link_id))
