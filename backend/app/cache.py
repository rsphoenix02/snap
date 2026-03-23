from __future__ import annotations

import json
from typing import Any

import httpx

from app.config import settings


class RedisClient:
    def __init__(self, url: str, token: str) -> None:
        self._url = url
        self._token = token
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self._url,
                headers={"Authorization": f"Bearer {self._token}"},
                timeout=10.0,
            )
        return self._client

    async def _command(self, *args: str | int | float) -> Any:
        client = await self._get_client()
        path = "/" + "/".join(str(a) for a in args)
        resp = await client.get(path)
        resp.raise_for_status()
        data = resp.json()
        return data.get("result")

    async def _post_command(self, commands: list[list[str | int | float]]) -> list[Any]:
        client = await self._get_client()
        resp = await client.post("/pipeline", json=commands)
        resp.raise_for_status()
        results = resp.json()
        return [r.get("result") for r in results]

    # --- Basic ops ---

    async def get(self, key: str) -> str | None:
        return await self._command("GET", key)

    async def set(self, key: str, value: str, ex: int | None = None) -> None:
        if ex is not None:
            await self._command("SET", key, value, "EX", ex)
        else:
            await self._command("SET", key, value)

    async def delete(self, key: str) -> None:
        await self._command("DEL", key)

    # --- Sorted set (rate limiter) ---

    async def zadd(self, key: str, score: float, member: str) -> None:
        await self._command("ZADD", key, score, member)

    async def zremrangebyscore(self, key: str, min_score: float, max_score: float) -> None:
        await self._command("ZREMRANGEBYSCORE", key, min_score, max_score)

    async def zcard(self, key: str) -> int:
        result = await self._command("ZCARD", key)
        return int(result) if result else 0

    async def expire(self, key: str, seconds: int) -> None:
        await self._command("EXPIRE", key, seconds)

    # --- List (click buffer) ---

    async def lpush(self, key: str, value: str) -> None:
        await self._command("LPUSH", key, value)

    async def lrange(self, key: str, start: int, stop: int) -> list[str]:
        result = await self._command("LRANGE", key, start, stop)
        return result if result else []

    async def llen(self, key: str) -> int:
        result = await self._command("LLEN", key)
        return int(result) if result else 0

    async def ltrim(self, key: str, start: int, stop: int) -> None:
        await self._command("LTRIM", key, start, stop)

    # --- Set (active link tracking) ---

    async def sadd(self, key: str, *members: str) -> None:
        await self._command("SADD", key, *members)

    async def smembers(self, key: str) -> list[str]:
        result = await self._command("SMEMBERS", key)
        return result if result else []

    async def srem(self, key: str, *members: str) -> None:
        await self._command("SREM", key, *members)

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()


redis_client = RedisClient(
    url=settings.UPSTASH_REDIS_REST_URL,
    token=settings.UPSTASH_REDIS_REST_TOKEN,
)
