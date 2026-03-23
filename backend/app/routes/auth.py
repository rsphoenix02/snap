from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, Request, Cookie
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import (
    ApiResponse,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/api/auth",
        max_age=7 * 24 * 3600,
    )


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        tier=user.tier,
    )


@router.post("/register", status_code=201)
async def register(
    body: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    _set_refresh_cookie(response, refresh_token)

    return ApiResponse(
        data=AuthResponse(
            access_token=access_token,
            user=_user_to_response(user),
        ).model_dump()
    )


@router.post("/login")
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    _set_refresh_cookie(response, refresh_token)

    return ApiResponse(
        data=AuthResponse(
            access_token=access_token,
            user=_user_to_response(user),
        ).model_dump()
    )


@router.post("/refresh")
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")

    user_id = verify_token(token, expected_type="refresh")
    if not user_id:
        response.delete_cookie("refresh_token", path="/api/auth")
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        response.delete_cookie("refresh_token", path="/api/auth")
        raise HTTPException(status_code=401, detail="User not found")

    new_access = create_access_token(user.id)
    return ApiResponse(data={"access_token": new_access})


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return ApiResponse(
        data=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            tier=user.tier,
            created_at=user.created_at.isoformat() if user.created_at else None,
        ).model_dump()
    )
