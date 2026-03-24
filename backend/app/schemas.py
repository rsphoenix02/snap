import re
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.password_check import is_common_password


# --- Envelope ---

class ApiResponse(BaseModel):
    data: dict | list | None = None
    error: str | None = None


# --- Auth ---

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=12)
    name: str = Field(min_length=1, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_not_common(cls, v: str) -> str:
        if is_common_password(v):
            raise ValueError("This password is too common. Please choose a more unique password.")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower()


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    tier: str
    created_at: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse


# --- Links ---

class CreateLinkRequest(BaseModel):
    url: str
    custom_code: str | None = None
    expires_in: int | None = None  # hours

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v

    @field_validator("custom_code")
    @classmethod
    def validate_custom_code(cls, v: str | None) -> str | None:
        if v is not None:
            if not re.match(r"^[a-zA-Z0-9-]{3,20}$", v):
                raise ValueError("Custom code must be 3-20 chars, alphanumeric + hyphens")
        return v


class LinkResponse(BaseModel):
    id: int
    short_code: str
    original_url: str
    short_url: str | None = None
    title: str | None = None
    created_at: str
    expires_at: str | None = None
    click_count: int | None = None
    is_active: bool | None = None


class PaginatedLinksResponse(BaseModel):
    links: list[LinkResponse]
    total: int
    page: int
    limit: int


class UpdateLinkRequest(BaseModel):
    title: str | None = None
    original_url: str | None = None
    expires_at: datetime | None = None
    is_active: bool | None = None

    @field_validator("original_url")
    @classmethod
    def validate_url(cls, v: str | None) -> str | None:
        if v is not None and not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


# --- Analytics ---

class StatsResponse(BaseModel):
    total_clicks: int
    top_country: str | None
    clicks_today: int
    clicks_this_week: int


class TimePoint(BaseModel):
    timestamp: str
    count: int


class ClicksTimeSeriesResponse(BaseModel):
    range: str
    points: list[TimePoint]


class ReferrerItem(BaseModel):
    source: str
    count: int


class ReferrersResponse(BaseModel):
    referrers: list[ReferrerItem]


class DeviceItem(BaseModel):
    type: str
    count: int


class BrowserItem(BaseModel):
    name: str
    count: int


class DevicesResponse(BaseModel):
    devices: list[DeviceItem]
    browsers: list[BrowserItem]


# --- Dashboard ---

class TopLinkSummary(BaseModel):
    short_code: str
    original_url: str
    click_count: int


class DashboardSummaryResponse(BaseModel):
    total_links: int
    total_clicks: int
    top_link: TopLinkSummary | None


# --- API Keys ---

class ApiKeyResponse(BaseModel):
    id: str
    key: str | None = None  # only on creation
    key_preview: str | None = None  # masked, on list
    created_at: str
    last_used_at: str | None = None
    is_active: bool | None = None
