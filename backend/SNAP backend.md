# SNAP Backend

FastAPI + PostgreSQL + Redis. Async throughout (asyncpg). Auth via JWT. Deploy on GCP Cloud Run.

## Database (4 tables)

**users:** id (UUID PK), email (unique, indexed), password_hash (bcrypt), name, created_at, tier (enum: free/pro)

**links:** id (serial PK), user_id (FK→users, indexed), short_code (unique, indexed), original_url (text), title (nullable), created_at, expires_at (nullable), click_count (int, default 0), is_active (bool, default true)

**clicks:** id (serial PK), link_id (FK→links, indexed), clicked_at (indexed), ip_address, user_agent, referrer (nullable), country (nullable), city (nullable), device_type (enum: desktop/mobile/tablet), browser

**api_keys:** id (UUID PK), user_id (FK→users), key_hash (unique), created_at, last_used_at (nullable), is_active (bool)

## Routes

```
POST   /api/auth/register
POST   /api/auth/login          → access token (15min) + refresh (httpOnly cookie, 7d)
POST   /api/auth/refresh
GET    /api/auth/me

POST   /api/links               → body: url, custom_code?, expires_in?
GET    /api/links               → paginated: ?page=1&limit=20
GET    /api/links/{code}
PATCH  /api/links/{code}        → title, expiry, is_active
DELETE /api/links/{code}

GET    /api/links/{code}/stats
GET    /api/links/{code}/clicks  → ?range=24h|7d|30d|all
GET    /api/links/{code}/referrers
GET    /api/links/{code}/devices

GET    /api/dashboard/summary    → total_links, total_clicks, top_link

POST   /api/keys
GET    /api/keys
DELETE /api/keys/{id}

GET    /{short_code}             → 302 redirect
```

## Redis (3 roles)
1. **URL cache** — `url:{code}` → original_url, TTL 1hr
2. **Rate limiter** — sliding window, `rate:{user_id}:{endpoint}`, 60s TTL. Free: 10 writes/100 reads per min. Pro: 60/600. Unauthed redirects: 200/min per IP. Return 429 + Retry-After.
3. **Click buffer** — buffer clicks in Redis list, flush to PostgreSQL every 30s

## Redirect Flow
```
GET /{short_code} → rate limit (IP) → Redis cache check
  HIT  → 302, log click async
  MISS → PostgreSQL lookup
    active + not expired → cache, 302, log click async
    inactive/expired     → 410
    not found            → 404
```

## Rules
- Async SQLAlchemy + asyncpg
- Consistent responses: `{ "data": ..., "error": null }`
- 302 never 301 (301 kills analytics via browser cache)
- Click logging always async via BackgroundTasks
- Short codes: random 6-char base62, retry 3x on collision
- GeoIP: ip-api.com free tier or geoip2-lite
- UA parsing: user-agents lib for device_type + browser
- API key auth: `Authorization: Bearer sk_...`, hash and compare
- Never expose password hashes or internal IDs in responses

## File Structure
```
backend/app/
├── main.py            # App, CORS, lifespan
├── config.py          # pydantic-settings
├── database.py        # Async engine + session
├── cache.py           # Redis helpers
├── models.py          # SQLAlchemy models
├── schemas.py         # Pydantic schemas
├── dependencies.py    # get_current_user, get_db
├── routes/            # auth, links, analytics, keys, dashboard, redirect
├── middleware/         # rate_limiter
└── services/          # url_service, auth_service, analytics_service, click_buffer
```
