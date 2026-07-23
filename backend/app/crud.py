"""Database operations for the Core API.

CRUD means Create, Read, Update and Delete.  Keeping these functions outside
the router makes the HTTP layer small and makes database behavior reusable in
tests, background jobs or future CLI commands.
"""

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.enums import FinanceType
from app.models.transaction import Transaction
from app.models.wallet import Wallet
from app.schemas import (
    CategoryCreate,
    CategoryUpdate,
    TransactionCreate,
    WalletCreate,
    WalletUpdate,
)


# ------------------------------ Wallet CRUD ------------------------------

async def get_wallets(db: AsyncSession, user_id: int) -> list[Wallet]:
    # select(Wallet) builds a SELECT statement for the wallets table.
    # Filtering by user_id prevents one user from seeing another user's data.
    result = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
    # scalars() unwraps SQLAlchemy Row objects into Wallet objects.
    return list(result.scalars().all())


async def get_wallet(db: AsyncSession, wallet_id: int, user_id: int) -> Wallet | None:
    result = await db.execute(
        select(Wallet).where(Wallet.id == wallet_id, Wallet.user_id == user_id)
    )
    # scalar_one_or_none returns one object or None when no row matches.
    return result.scalar_one_or_none()


async def create_wallet(db: AsyncSession, data: WalletCreate) -> Wallet:
    # The SQLAlchemy Model represents a row in the database.
    wallet = Wallet(name=data.name, user_id=data.user_id)
    db.add(wallet)
    await db.commit()
    await db.refresh(wallet)
    return wallet


async def update_wallet(
    db: AsyncSession, wallet: Wallet, data: WalletUpdate
) -> Wallet:
    # model_dump(exclude_unset=True) keeps only fields sent by the client.
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(wallet, field, value)
    await db.commit()
    await db.refresh(wallet)
    return wallet


async def delete_wallet(db: AsyncSession, wallet: Wallet) -> None:
    await db.delete(wallet)
    await db.commit()


# ----------------------------- Category CRUD -----------------------------

async def get_categories(db: AsyncSession, user_id: int) -> list[Category]:
    result = await db.execute(
        select(Category).where(Category.user_id == user_id)
    )
    return list(result.scalars().all())


async def get_category(
    db: AsyncSession, category_id: int, user_id: int
) -> Category | None:
    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def create_category(db: AsyncSession, data: CategoryCreate) -> Category:
    category = Category(
        name=data.name,
        type=data.type,
        user_id=data.user_id,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def update_category(
    db: AsyncSession, category: Category, data: CategoryUpdate
) -> Category:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category: Category) -> None:
    await db.delete(category)
    await db.commit()


# --------------------------- Transaction creation ------------------------

async def create_transaction(
    db: AsyncSession, data: TransactionCreate
) -> Transaction:
    """Create a transaction and update its Wallet atomically.

    ACID means the two database changes behave as one unit:
    - Atomicity: both changes commit, or neither remains.
    - Consistency: the balance and transaction history stay compatible.
    - Isolation: row locking protects concurrent balance checks.
    - Durability: commit persists successful changes.
    """

    try:
        # FOR UPDATE locks the selected Wallet row until this transaction
        # commits or rolls back.  Without it, two expenses could both read
        # the same old balance and jointly spend more money than available.
        wallet_result = await db.execute(
            select(Wallet)
            .where(Wallet.id == data.wallet_id, Wallet.user_id == data.user_id)
            .with_for_update()
        )
        wallet = wallet_result.scalar_one_or_none()
        if wallet is None:
            raise HTTPException(status_code=404, detail="Wallet not found")

        # A transaction category must belong to the same user as the Wallet.
        category_result = await db.execute(
            select(Category).where(
                Category.id == data.category_id,
                Category.user_id == data.user_id,
            )
        )
        category = category_result.scalar_one_or_none()
        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")

        # Business rule: an expense cannot make the balance negative.
        if data.type == FinanceType.EXPENSE and wallet.balance < data.amount:
            raise HTTPException(
                status_code=400,
                detail="Wallet balance is insufficient",
            )

        # Update the Wallet in memory.  SQLAlchemy will generate UPDATE later.
        if data.type == FinanceType.INCOME:
            wallet.balance += data.amount
        else:
            wallet.balance -= data.amount

        transaction = Transaction(
            amount=data.amount,
            type=data.type,
            description=data.description,
            wallet_id=data.wallet_id,
            category_id=data.category_id,
        )
        if data.date_time is not None:
            transaction.date_time = data.date_time
        db.add(transaction)

        # flush sends INSERT/UPDATE to PostgreSQL but keeps the transaction
        # open.  This lets us detect database errors before the final commit.
        await db.flush()

        # Only here do both the new transaction and new balance become final.
        await db.commit()
        await db.refresh(transaction)
        return transaction

    except HTTPException:
        # Even a deliberate business-rule failure leaves the session in a
        # clean state for future queries, so rollback is still required.
        await db.rollback()
        raise
    except Exception as exc:
        # If INSERT, UPDATE or COMMIT fails, rollback prevents a partial or
        # broken transaction from contaminating this AsyncSession.
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create transaction",
        ) from exc
