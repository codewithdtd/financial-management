"""Async aggregate queries used by the statistics API."""

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import Integer, case, cast, extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.enums import FinanceType
from app.models.transaction import Transaction
from app.schemas import CashflowByMonthResponse, ExpenseByCategoryResponse


async def get_expense_by_category(
    db: AsyncSession, user_id: int, from_date: date, to_date: date
) -> list[ExpenseByCategoryResponse]:
    """Return expense totals grouped by category for an inclusive date range."""
    statement = (
        select(
            Category.name.label("category_name"),
            func.sum(Transaction.amount).label("total_amount"),
        )
        .select_from(Transaction)
        .join(Category, Transaction.category_id == Category.id)
        .where(
            Transaction.type == FinanceType.EXPENSE,
            Category.user_id == user_id,
            Transaction.date_time >= datetime.combine(from_date, datetime.min.time(), tzinfo=timezone.utc),
            Transaction.date_time < datetime.combine(to_date + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc),
        )
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
    )
    result = await db.execute(statement)
    return [
        ExpenseByCategoryResponse(
            category_name=row.category_name,
            total_amount=row.total_amount or Decimal("0.00"),
        )
        for row in result.all()
    ]


async def get_cashflow_by_month(
    db: AsyncSession, user_id: int, year: int
) -> list[CashflowByMonthResponse]:
    """Return income and expense totals for all twelve months in ``year``."""
    month_number = cast(extract("month", Transaction.date_time), Integer).label("month")
    income_total = func.coalesce(
        func.sum(case((Transaction.type == FinanceType.INCOME, Transaction.amount), else_=0)), 0
    ).label("total_income")
    expense_total = func.coalesce(
        func.sum(case((Transaction.type == FinanceType.EXPENSE, Transaction.amount), else_=0)), 0
    ).label("total_expense")

    start = datetime(year, 1, 1, tzinfo=timezone.utc)
    end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    statement = (
        select(month_number, income_total, expense_total)
        .select_from(Transaction)
        .join(Category, Transaction.category_id == Category.id)
        .where(Category.user_id == user_id, Transaction.date_time >= start, Transaction.date_time < end)
        .group_by(month_number)
    )

    result = await db.execute(statement)
    totals_by_month = {
        int(row.month): (
            row.total_income or Decimal("0.00"),
            row.total_expense or Decimal("0.00"),
        )
        for row in result.all()
    }

    # Empty months are returned explicitly so the chart always has 12 points.
    return [
        CashflowByMonthResponse(
            month=month,
            total_income=totals_by_month.get(month, (Decimal("0.00"), Decimal("0.00")))[0],
            total_expense=totals_by_month.get(month, (Decimal("0.00"), Decimal("0.00")))[1],
        )
        for month in range(1, 13)
    ]
