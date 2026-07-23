"""HTTP endpoints for Wallets, Categories and Transactions."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.db.session import get_async_session
from app.schemas import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    TransactionCreate,
    TransactionResponse,
    WalletCreate,
    WalletResponse,
    WalletUpdate,
)


# APIRouter groups related endpoints.  main.py registers this group once.
router = APIRouter()


def require_object(value, detail: str):
    # CRUD returns None when a row is missing.  HTTPException belongs here,
    # because this layer knows how missing data should appear over HTTP.
    if value is None:
        raise HTTPException(status_code=404, detail=detail)
    return value


# `Depends(get_async_session)` is FastAPI Dependency Injection:
# FastAPI calls get_async_session before the endpoint, receives the yielded
# AsyncSession, and passes it into the `db` parameter automatically.
@router.get("/wallets", response_model=list[WalletResponse])
async def list_wallets(
    user_id: int = Query(..., gt=0),
    db: AsyncSession = Depends(get_async_session),
):
    return await crud.get_wallets(db, user_id)


@router.get("/wallets/{wallet_id}", response_model=WalletResponse)
async def read_wallet(
    wallet_id: int,
    user_id: int = Query(..., gt=0),
    db: AsyncSession = Depends(get_async_session),
):
    return require_object(
        await crud.get_wallet(db, wallet_id, user_id), "Wallet not found"
    )


@router.post("/wallets", response_model=WalletResponse, status_code=status.HTTP_201_CREATED)
async def create_wallet(
    data: WalletCreate,
    db: AsyncSession = Depends(get_async_session),
):
    return await crud.create_wallet(db, data)


@router.patch("/wallets/{wallet_id}", response_model=WalletResponse)
async def edit_wallet(
    wallet_id: int,
    data: WalletUpdate,
    user_id: int = Query(..., gt=0),
    db: AsyncSession = Depends(get_async_session),
):
    wallet = require_object(
        await crud.get_wallet(db, wallet_id, user_id), "Wallet not found"
    )
    return await crud.update_wallet(db, wallet, data)


@router.delete("/wallets/{wallet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_wallet(
    wallet_id: int,
    user_id: int = Query(..., gt=0),
    db: AsyncSession = Depends(get_async_session),
):
    wallet = require_object(
        await crud.get_wallet(db, wallet_id, user_id), "Wallet not found"
    )
    await crud.delete_wallet(db, wallet)


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    user_id: int = Query(..., gt=0),
    db: AsyncSession = Depends(get_async_session),
):
    return await crud.get_categories(db, user_id)


@router.get("/categories/{category_id}", response_model=CategoryResponse)
async def read_category(
    category_id: int,
    user_id: int = Query(..., gt=0),
    db: AsyncSession = Depends(get_async_session),
):
    return require_object(
        await crud.get_category(db, category_id, user_id), "Category not found"
    )


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_async_session),
):
    return await crud.create_category(db, data)


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
async def edit_category(
    category_id: int,
    data: CategoryUpdate,
    user_id: int = Query(..., gt=0),
    db: AsyncSession = Depends(get_async_session),
):
    category = require_object(
        await crud.get_category(db, category_id, user_id), "Category not found"
    )
    return await crud.update_category(db, category, data)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_category(
    category_id: int,
    user_id: int = Query(..., gt=0),
    db: AsyncSession = Depends(get_async_session),
):
    category = require_object(
        await crud.get_category(db, category_id, user_id), "Category not found"
    )
    await crud.delete_category(db, category)


@router.post(
    "/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_transaction(
    data: TransactionCreate,
    db: AsyncSession = Depends(get_async_session),
):
    return await crud.create_transaction(db, data)
