from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=1)
def _load_blocklist() -> frozenset[str]:
    path = Path(__file__).parent / "common_passwords.txt"
    return frozenset(
        line.strip().lower()
        for line in path.read_text().splitlines()
        if line.strip()
    )


def is_common_password(password: str) -> bool:
    return password.strip().lower() in _load_blocklist()
