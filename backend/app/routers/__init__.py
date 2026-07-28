"""Core HTTP routes for categories and transactions."""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.db.session import get_async_session
from app.models.enums import FinanceType
from app.schemas import (
    CategoryCreate, CategoryResponse, CategoryUpdate,
    TransactionCreate, TransactionResponse,
)

router = APIRouter()


def require_object(value, detail: str):
    """Convert a missing CRUD result into an HTTP 404 response."""
    if value is None:
        raise HTTPException(status_code=404, detail=detail)
    return value


# FastAPI calls get_async_session, injects the yielded AsyncSession into db,
# and closes the session after the request finishes.
@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(user_id: int = Query(..., gt=0), db: AsyncSession = Depends(get_async_session)):
    return await crud.get_categories(db, user_id)


@router.get("/categories/{category_id}", response_model=CategoryResponse)
async def read_category(category_id: int, user_id: int = Query(..., gt=0), db: AsyncSession = Depends(get_async_session)):
    return require_object(await crud.get_category(db, category_id, user_id), "Category not found")


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_async_session)):
    return await crud.create_category(db, data)


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
async def edit_category(category_id: int, data: CategoryUpdate, user_id: int = Query(..., gt=0), db: AsyncSession = Depends(get_async_session)):
    category = require_object(await crud.get_category(db, category_id, user_id), "Category not found")
    return await crud.update_category(db, category, data)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_category(category_id: int, user_id: int = Query(..., gt=0), db: AsyncSession = Depends(get_async_session)):
    category = require_object(await crud.get_category(db, category_id, user_id), "Category not found")
    await crud.delete_category(db, category)


@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(data: TransactionCreate, db: AsyncSession = Depends(get_async_session)):
    return await crud.create_transaction(db, data)


@router.get("/transactions", response_model=list[TransactionResponse])
async def list_transactions(
    user_id: int = Query(..., gt=0),
    category_id: int | None = Query(None, gt=0),
    type: FinanceType | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_async_session),
):
    return await crud.get_transactions(
        db,
        user_id=user_id,
        category_id=category_id,
        type=type,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )
