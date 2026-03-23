import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException

logger = logging.getLogger(__name__)

from app.cache import redis_client
from app.config import settings
from app.database import async_session
from app.services.click_buffer import ClickBuffer


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    click_buffer = ClickBuffer(redis=redis_client, db_session_factory=async_session)
    app.state.click_buffer = click_buffer
    flush_task = asyncio.create_task(click_buffer.start_flush_loop(interval=30))
    yield
    # Shutdown
    await click_buffer.shutdown_flush()
    flush_task.cancel()
    await redis_client.close()


app = FastAPI(title="SNAP API", version="1.0.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global error handlers for consistent envelope
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"data": None, "error": exc.detail},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    errors = exc.errors()
    msg = "; ".join(f"{e['loc'][-1]}: {e['msg']}" for e in errors) if errors else "Validation error"
    return JSONResponse(
        status_code=422,
        content={"data": None, "error": msg},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"data": None, "error": "Internal server error"},
    )


# Register routers
from app.routes import auth, links, analytics, keys, dashboard, redirect  # noqa: E402

app.include_router(auth.router)
app.include_router(links.router)
app.include_router(analytics.router)
app.include_router(keys.router)
app.include_router(dashboard.router)
app.include_router(redirect.router)  # Must be LAST (catch-all /{short_code})


@app.get("/health")
async def health():
    return {"status": "ok"}
