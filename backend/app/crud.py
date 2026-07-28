"""Async database operations for categories and transactions."""

from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.enums import FinanceType
from app.models.transaction import Transaction
from app.schemas import CategoryCreate, CategoryUpdate, TransactionCreate


# ----------------------------- Category CRUD -----------------------------

async def get_categories(db: AsyncSession, user_id: int) -> list[Category]:
    result = await db.execute(select(Category).where(Category.user_id == user_id))
    return list(result.scalars().all())


async def get_category(db: AsyncSession, category_id: int, user_id: int) -> Category | None:
    result = await db.execute(select(Category).where(Category.id == category_id, Category.user_id == user_id))
    return result.scalar_one_or_none()


async def create_category(db: AsyncSession, data: CategoryCreate) -> Category:
    category = Category(name=data.name, type=data.type, user_id=data.user_id)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def update_category(db: AsyncSession, category: Category, data: CategoryUpdate) -> Category:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category: Category) -> None:
    await db.delete(category)
    await db.commit()


# --------------------------- Transaction creation ------------------------

async def create_transaction(db: AsyncSession, data: TransactionCreate) -> Transaction:
    """Create one transaction atomically.

    Wallet balance updates no longer exist.  Atomicity still matters: the
    transaction row is either committed completely or rolled back completely.
    The category ownership check preserves data consistency between users.
    """
    try:
        category_result = await db.execute(
            select(Category).where(Category.id == data.category_id, Category.user_id == data.user_id)
        )
        if category_result.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail="Category not found")

        transaction = Transaction(
            amount=data.amount,
            type=data.type,
            description=data.description,
            category_id=data.category_id,
        )
        if data.date_time is not None:
            transaction.date_time = data.date_time
        db.add(transaction)

        # flush checks the INSERT while the transaction is still open.
        await db.flush()
        await db.commit()
        await db.refresh(transaction)
        return transaction
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create transaction") from exc


# --------------------------- Transaction retrieval ------------------------

async def get_transactions(
    db: AsyncSession,
    user_id: int,
    category_id: int | None = None,
    type: FinanceType | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[Transaction]:
    """Return transactions whose categories belong to the requested user."""
    query = select(Transaction).join(Category).where(Category.user_id == user_id)
    if category_id is not None:
        query = query.where(Transaction.category_id == category_id)
    if type is not None:
        query = query.where(Transaction.type == type)
    if start_date is not None:
        query = query.where(Transaction.date_time >= start_date)
    if end_date is not None:
        query = query.where(Transaction.date_time <= end_date)
    query = query.order_by(Transaction.date_time.desc(), Transaction.id.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())
