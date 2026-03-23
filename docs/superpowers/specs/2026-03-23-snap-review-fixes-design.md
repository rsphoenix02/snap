# SNAP — Code Review Fixes Design Spec

**Date:** 2026-03-23
**Scope:** 9 review items (3 High, 4 Medium, 2 Low) from the initial backend code review

---

## H2/H3: IP Privacy + GeoIP Cleanup

**Problem:** Raw IP addresses stored in `clicks` table as PII with no retention policy. GeoIP lookup uses unencrypted HTTP to ip-api.com, leaking IPs over the wire.

**Solution:** Resolve geo data before buffering, then discard the IP entirely.

### Changes

1. **`backend/app/routes/redirect.py` — `_log_click`**
   - Switch GeoIP URL to `https://ip-api.com/json/{ip}?fields=country,city`
   - Use shared `httpx.AsyncClient` from `request.app.state.http_client` (see M4) — accessed via `request.app.state`, no signature change needed
   - Remove `ip_address` from `click_data` dict — only store `country`, `city`, `device_type`, `browser`, `referrer`
   - Normalize empty referrer to `None` at write time: `referrer = request.headers.get("referer") or None`

2. **`backend/app/models.py` — `Click` model**
   - Remove `ip_address` column

3. **`backend/app/services/click_buffer.py`**
   - Remove `ip_address` from the click record built during `flush_to_db`

4. **`backend/app/services/analytics_service.py` — `get_stats`**
   - `unique_visitors` currently uses `COUNT(DISTINCT ip_address)` — this breaks when `ip_address` is removed
   - Replace with `COUNT(DISTINCT Click.id)` renamed to `total_clicks`, or remove the `unique_visitors` metric entirely
   - **Decision:** Remove `unique_visitors` from `get_stats` and `StatsResponse`. True unique visitor tracking requires a session/fingerprint mechanism that is out of scope. The dashboard summary card already shows `total_clicks` which is sufficient.

5. **`backend/schema.sql`**
   - Remove `ip_address` column from `clicks` table DDL

6. **Migration note:** Run `ALTER TABLE clicks DROP COLUMN ip_address;` on existing Neon DB

---

## H4: Cache Bypass for Deactivated/Expired Links

**Problem:** Redis cache stores `link_id|original_url`. On cache hit, `is_active` and `expires_at` are not checked. Deactivated/expired links remain accessible for up to 1 hour (cache TTL).

**Solution:** Extend cached value to include validation fields; check on every cache hit.

### Changes

1. **`backend/app/routes/redirect.py`**

   **Cache write (line ~98):** Change format to JSON:
   ```python
   import json
   cache_val = json.dumps({
       "id": link.id,
       "url": link.original_url,
       "active": link.is_active,
       "expires": link.expires_at.isoformat() if link.expires_at else None,
   })
   await redis_client.set(f"url:{short_code}", cache_val, ex=3600)
   ```

   **Cache read (line ~76-80):** Parse JSON, validate before redirecting:
   ```python
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
   ```

2. **`backend/app/routes/links.py`** — On PATCH (deactivate/update expiry), delete the cache key (DELETE already does this):
   ```python
   await redis_client.delete(f"url:{link.short_code}")
   ```

---

## H5: Password Strength (NIST 800-63B Aligned)

**Problem:** Password validation only checks `min_length=8`. No complexity or common-password checks.

**Solution:** Bump minimum to 12 chars. Add a blocklist of the top 1000 common passwords.

### Changes

1. **`backend/app/common_passwords.txt`** — New file, top 1000 common passwords (one per line)

2. **`backend/app/schemas.py` — `RegisterRequest`**
   ```python
   from app.password_check import is_common_password  # top-level import

   password: str = Field(min_length=12)

   @field_validator("password")
   @classmethod
   def password_not_common(cls, v: str) -> str:
       if is_common_password(v):
           raise ValueError("This password is too common. Please choose a more unique password.")
       return v
   ```

   **Note:** `LoginRequest` intentionally keeps no `min_length` constraint so existing users with 8-11 char passwords can still log in.

3. **`backend/app/password_check.py`** — New module:
   ```python
   from functools import lru_cache
   from pathlib import Path

   @lru_cache(maxsize=1)
   def _load_blocklist() -> frozenset[str]:
       path = Path(__file__).parent / "common_passwords.txt"
       return frozenset(line.strip().lower() for line in path.read_text().splitlines() if line.strip())

   def is_common_password(password: str) -> bool:
       return password.strip().lower() in _load_blocklist()
   ```

---

## M3: Separate JWT Secrets

**Problem:** Access and refresh tokens share `JWT_SECRET`. Compromising one compromises both.

**Solution:** Add a dedicated `JWT_REFRESH_SECRET` setting.

### Changes

1. **`backend/app/config.py`**
   ```python
   JWT_REFRESH_SECRET: str
   ```

2. **`backend/app/services/auth_service.py`**
   - `create_access_token` — uses `settings.JWT_SECRET` (unchanged)
   - `create_refresh_token` — uses `settings.JWT_REFRESH_SECRET`
   - `verify_token` — add `secret` parameter; callers pass the appropriate secret
   - Update `type` claim check alongside secret selection

3. **`backend/app/dependencies.py`** — All three functions that call `verify_token` must pass the correct secret:
   - `get_current_user` → `settings.JWT_SECRET`
   - `get_optional_user` → `settings.JWT_SECRET`
   - `get_current_user_or_api_key` → `settings.JWT_SECRET`

4. **`backend/app/routes/auth.py`**
   - `/refresh` endpoint passes `settings.JWT_REFRESH_SECRET` to `verify_token`
   - `/logout` endpoint passes `settings.JWT_REFRESH_SECRET`

5. **`.env`** — Add `JWT_REFRESH_SECRET=<new-secret>`

---

## M4: Shared httpx Client for GeoIP

**Problem:** `_log_click` creates and destroys `httpx.AsyncClient` per call. No connection reuse.

**Solution:** Create once on app startup, share via `app.state`.

### Changes

1. **`backend/app/main.py` — lifespan**
   ```python
   import httpx

   app.state.http_client = httpx.AsyncClient(timeout=3.0)
   # on shutdown:
   await app.state.http_client.aclose()
   ```

2. **`backend/app/routes/redirect.py` — `_log_click`**
   - Access shared client via `request.app.state.http_client` (no signature change needed — `request` is already a parameter)
   - Replace `async with httpx.AsyncClient(...) as client:` with direct use of `request.app.state.http_client`

---

## M6: Typed `expires_at` on UpdateLinkRequest

**Problem:** `expires_at` is `str | None` — no validation, consumers must parse manually.

**Solution:** Change to `datetime | None`. Pydantic v2 auto-parses ISO strings.

### Changes

1. **`backend/app/schemas.py`**
   ```python
   from datetime import datetime

   class UpdateLinkRequest(BaseModel):
       title: str | None = None
       expires_at: datetime | None = None
       is_active: bool | None = None
   ```

2. **`backend/app/routes/links.py` — PATCH endpoint**
   - Remove any manual string-to-datetime parsing if present
   - `body.expires_at` is already a `datetime` object; assign directly to model

---

## M8: Empty Referrer → "Direct"

**Problem:** `COALESCE` only catches NULL referrers. Empty string `""` passes through as empty.

**Solution:** Wrap with `NULLIF` so empty strings become NULL before COALESCE.

### Changes

1. **`backend/app/services/analytics_service.py` — `get_referrers`**
   ```python
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
   ```

---

## L1: Replace Fragile `startswith("api")` Check

**Problem:** `short_code.startswith("api")` blocks valid codes like `api-docs` and misses other reserved paths.

**Solution:** Check against an explicit set of reserved prefixes.

### Changes

1. **`backend/app/routes/redirect.py`**
   ```python
   RESERVED_CODES = {"api", "health", "docs", "openapi.json"}

   # In redirect_short_url:
   if short_code in RESERVED_CODES:
       raise HTTPException(status_code=404, detail="Not found")
   ```
   Note: FastAPI path params don't contain `/`, so set membership is sufficient. No `split("/")` needed.

2. **`backend/app/services/url_service.py`** — Also check during short code generation to never produce a reserved code.

---

## L3: Consistent User Serialization

**Problem:** Register/login omit `created_at`, but `/me` includes it. Frontend sees different shapes.

**Solution:** Update the existing `_user_to_response` helper (already used by register/login) to include `created_at`, then reuse it in `/me`.

### Changes

1. **`backend/app/routes/auth.py` — Update existing `_user_to_response` (line ~40)** to add `created_at`:
   ```python
   def _user_to_response(user: User) -> UserResponse:
       return UserResponse(
           id=str(user.id),
           email=user.email,
           name=user.name,
           tier=user.tier,
           created_at=user.created_at.isoformat() if user.created_at else None,
       )
   ```

2. **`/me` endpoint** — Replace inline `UserResponse(...)` construction with `_user_to_response(user)`

3. **`backend/app/schemas.py` — `UserResponse`** — Ensure `created_at: str | None` field exists

---

## Implementation Order

1. M4 (shared httpx client) — needed before H2/H3
2. H2/H3 (IP privacy + GeoIP)
3. H4 (cache validation)
4. H5 (password strength)
5. M3 (separate JWT secrets)
6. M6 (typed expires_at)
7. M8 (empty referrer)
8. L1 (reserved prefixes)
9. L3 (user serialization)
