import secrets
import string

CHARSET = string.ascii_letters + string.digits  # base62
RESERVED_CODES = {"api", "health", "docs", "openapi.json"}


def generate_short_code(length: int = 6) -> str:
    code = "".join(secrets.choice(CHARSET) for _ in range(length))
    # Extremely unlikely with base62^6, but guard against it
    while code in RESERVED_CODES:
        code = "".join(secrets.choice(CHARSET) for _ in range(length))
    return code
