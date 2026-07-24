"""Async aggregate queries used by the statistics API."""

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import Integer, case, cast, extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.enums import FinanceType
from app.models.transaction import Transaction
from app.models.wallet import Wallet
from app.schemas import CashflowByMonthResponse, ExpenseByCategoryResponse


async def get_expense_by_category(
    db: AsyncSession, user_id: int, from_date: date, to_date: date
) -> list[ExpenseByCategoryResponse]:
    """SUM expenses and GROUP BY Category.name inside an inclusive range."""
    # func is SQLAlchemy's namespace for database functions.  For example,
    # func.sum(amount) becomes SQL SUM(transactions.amount).
    statement = (
        select(
            Category.name.label("category_name"),
            func.sum(Transaction.amount).label("total_amount"),
        )
        # join combines rows from Transaction and Category through category_id.
        .join(Category, Transaction.category_id == Category.id)
        .where(
            Transaction.type == FinanceType.EXPENSE,
            Category.user_id == user_id,
            # Use a half-open interval so the entire to_date is included.
            Transaction.date_time >= datetime.combine(from_date, datetime.min.time(), tzinfo=timezone.utc),
            Transaction.date_time < datetime.combine(to_date + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc),
        )
        # group_by makes one aggregate result for each category name.
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
    )

    # execute is awaited because the database network operation is async.
    result = await db.execute(statement)
    rows = result.all()

    # Aggregate rows are not ORM objects, so scalars() is not appropriate.
    # Map every Row into a Pydantic object; FastAPI then serializes the list
    # into JSON dictionaries such as {"category_name": "Food", ...}.
    return [
        ExpenseByCategoryResponse(
            category_name=row.category_name,
            total_amount=row.total_amount or Decimal("0.00"),
        )
        for row in rows
    ]


async def get_cashflow_by_month(
    db: AsyncSession, user_id: int, year: int
) -> list[CashflowByMonthResponse]:
    """Return income and expense totals for every month in ``year``."""
    # extract("month", ...) becomes PostgreSQL EXTRACT(MONTH FROM ...).
    month_number = cast(extract("month", Transaction.date_time), Integer).label("month")

    # CASE lets SQL sum income and expense into separate columns.
    income_total = func.coalesce(
        func.sum(case((Transaction.type == FinanceType.INCOME, Transaction.amount), else_=0)),
        0,
    ).label("total_income")
    expense_total = func.coalesce(
        func.sum(case((Transaction.type == FinanceType.EXPENSE, Transaction.amount), else_=0)),
        0,
    ).label("total_expense")

    start = datetime(year, 1, 1, tzinfo=timezone.utc)
    end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)

    # First aggregate existing transactions by month and user.
    monthly = (
        select(month_number, income_total, expense_total)
        .join(Wallet, Transaction.wallet_id == Wallet.id)
        .where(Wallet.user_id == user_id, Transaction.date_time >= start, Transaction.date_time < end)
        .group_by(month_number)
        .subquery()
    )

    # PostgreSQL generate_series creates rows 1..12, so empty months also
    # appear after the LEFT OUTER JOIN with zero totals.
    months = func.generate_series(1, 12).table_valued("month").alias("months")
    statement = (
        select(
            months.c.month,
            func.coalesce(monthly.c.total_income, 0).label("total_income"),
            func.coalesce(monthly.c.total_expense, 0).label("total_expense"),
        )
        .outerjoin(monthly, months.c.month == monthly.c.month)
        .order_by(months.c.month)
    )

    result = await db.execute(statement)
    rows = result.all()
    return [
        CashflowByMonthResponse(
            month=int(row.month),
            total_income=row.total_income or Decimal("0.00"),
            total_expense=row.total_expense or Decimal("0.00"),
        )
        for row in rows
    ]
