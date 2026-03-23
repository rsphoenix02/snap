import secrets
import string

CHARSET = string.ascii_letters + string.digits  # base62


def generate_short_code(length: int = 6) -> str:
    return "".join(secrets.choice(CHARSET) for _ in range(length))
