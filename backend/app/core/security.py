"""Password hashing and JWT helpers.

These helpers keep security details out of routers and CRUD functions.  A
password is never stored directly; only an Argon2 hash is saved in users.
"""

from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import get_settings


# PasswordHash.recommended selects a modern password hashing configuration.
# The resulting hash contains its own salt and parameters, so verification can
# reproduce the same calculation without storing the original password.
password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Turn a plain password into a one-way Argon2 hash."""
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Check a plain password against the stored hash."""
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: int) -> str:
    """Create a signed JWT containing the user id and expiration time."""
    settings = get_settings()
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    # sub (subject) identifies the authenticated user.  exp lets JWT reject
    # the token automatically after its lifetime has elapsed.
    payload = {"sub": str(user_id), "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int:
    """Verify a JWT and return its user id, or raise a JWT error."""
    settings = get_settings()
    payload = jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )
    return int(payload["sub"])
