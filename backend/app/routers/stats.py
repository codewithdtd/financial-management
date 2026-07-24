"""Statistics endpoints and their HTTP-level validation."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud_stats import get_cashflow_by_month, get_expense_by_category
from app.db.session import get_async_session
from app.schemas import CashflowByMonthResponse, ExpenseByCategoryResponse


stats_router = APIRouter(prefix="/stats", tags=["Thống kê (Statistics)"])


@stats_router.get("/expenses-by-category", response_model=list[ExpenseByCategoryResponse])
async def expense_by_category(
    user_id: int = Query(..., gt=0),
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: AsyncSession = Depends(get_async_session),
):
    """Return expenses grouped by category for an inclusive date range."""
    if from_date > to_date:
        raise HTTPException(status_code=400, detail="from_date must be before to_date")
    return await get_expense_by_category(db, user_id, from_date, to_date)


@stats_router.get("/cashflow-by-month", response_model=list[CashflowByMonthResponse])
async def cashflow_by_month(
    user_id: int = Query(..., gt=0),
    db: AsyncSession = Depends(get_async_session),
):
    """Return all twelve months of the current year, including empty months."""
    return await get_cashflow_by_month(db, user_id, date.today().year)
