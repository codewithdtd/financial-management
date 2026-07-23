"""Signup and login endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.crud_auth import create_user, get_user_by_email
from app.db.session import get_async_session
from app.schemas import LoginRequest, SignupRequest, TokenResponse, UserResponse


auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def signup(
    data: SignupRequest,
    db: AsyncSession = Depends(get_async_session),
):
    """Create a user without ever storing the plain password."""
    email = data.email.strip().lower()

    if await get_user_by_email(db, email) is not None:
        raise HTTPException(status_code=409, detail="Email is already registered")

    try:
        # Hashing is intentionally done before persistence.  The database only
        # receives a one-way Argon2 value, never data that can log in directly.
        return await create_user(db, email, hash_password(data.password))
    except IntegrityError:
        # The unique database constraint is still necessary for two signup
        # requests arriving at exactly the same time.
        await db.rollback()
        raise HTTPException(status_code=409, detail="Email is already registered")


@auth_router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_async_session),
):
    """Verify credentials and return a short-lived bearer token."""
    user = await get_user_by_email(db, data.email.strip().lower())

    # Use one generic error for unknown email and wrong password.  Revealing
    # which one failed would help attackers discover registered accounts.
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return TokenResponse(
        access_token=create_access_token(user.id),
        user=user,
    )
