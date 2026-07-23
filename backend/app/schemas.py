"""Pydantic schemas used at the HTTP boundary of the application.

SQLAlchemy models describe database tables.  These Pydantic models describe
the JSON data that clients are allowed to send and receive through the API.
Keeping the two concepts separate prevents database details from leaking into
our public API and lets Pydantic validate input before it reaches the CRUD
layer.
"""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import FinanceType


class SignupRequest(BaseModel):
    """JSON body accepted by the signup endpoint."""

    # EmailStr would require the optional email-validator package, so this
    # beginner-friendly validation checks the basic shape without another
    # dependency.  The database unique index remains the final duplicate guard.
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    """JSON body accepted by the login endpoint."""

    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class UserResponse(BaseModel):
    """Safe public user data; password_hash is intentionally excluded."""

    id: int
    email: str
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """JWT returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class WalletBase(BaseModel):
    """Fields shared by Wallet create and update requests."""

    # Field trims the allowed length and prevents an empty wallet name.
    # The client sends this value as JSON, and Pydantic converts it to str.
    name: str = Field(..., min_length=1, max_length=100)


class WalletCreate(WalletBase):
    """Request body used to create a Wallet."""

    # Authentication is not implemented yet, so the user_id is supplied by
    # the client temporarily.  Later this should come from the JWT user.
    user_id: int = Field(..., gt=0)


class WalletUpdate(BaseModel):
    """Request body used to partially update a Wallet."""

    # None means the caller did not send this optional PATCH field.
    name: str | None = Field(default=None, min_length=1, max_length=100)


class WalletResponse(WalletBase):
    """Data returned to the client after reading a Wallet."""

    id: int
    balance: Decimal
    user_id: int

    # SQLAlchemy returns an object with attributes, not a dictionary.
    # from_attributes=True lets Pydantic read wallet.id, wallet.name, etc.
    model_config = ConfigDict(from_attributes=True)


class CategoryBase(BaseModel):
    """Fields shared by Category create and update requests."""

    name: str = Field(..., min_length=1, max_length=100)
    # FinanceType restricts the value to exactly income or expense.
    type: FinanceType


class CategoryCreate(CategoryBase):
    """Request body used to create a Category."""

    user_id: int = Field(..., gt=0)


class CategoryUpdate(BaseModel):
    """Request body used to partially update a Category."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    type: FinanceType | None = None


class CategoryResponse(CategoryBase):
    """Data returned to the client after reading a Category."""

    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)


class TransactionBase(BaseModel):
    """Fields shared by Transaction requests and responses."""

    # Decimal avoids binary floating-point rounding errors for money.
    amount: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    type: FinanceType
    description: str | None = Field(default=None, max_length=255)
    date_time: datetime | None = None
    wallet_id: int = Field(..., gt=0)
    category_id: int = Field(..., gt=0)


class TransactionCreate(TransactionBase):
    """Request body used to create a Transaction."""

    user_id: int = Field(..., gt=0)


class TransactionResponse(TransactionBase):
    """Data returned after a Transaction is committed."""

    id: int
    model_config = ConfigDict(from_attributes=True)


# Aggregate query results are not complete SQLAlchemy Model objects.  These
# schemas describe the smaller JSON rows returned by the statistics endpoints.
class ExpenseByCategoryResponse(BaseModel):
    # category_name comes from Category.name after a JOIN.
    category_name: str
    # total_amount comes from SQL SUM(Transaction.amount).
    total_amount: Decimal


class CashflowByMonthResponse(BaseModel):
    # month is the PostgreSQL EXTRACT(MONTH ...) result, from 1 through 12.
    month: int
    total_income: Decimal
    total_expense: Decimal
