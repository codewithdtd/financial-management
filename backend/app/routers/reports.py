"""Router for reports export utilizing BackgroundTasks."""

import csv
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, Query, status

reports_router = APIRouter(prefix="/api/reports", tags=["Báo cáo (Reports)"])


def write_csv_sync(transactions_data: list[dict], filename: str):
    """Synchronous function to write data to CSV file.
    
    This handles blocking file I/O operations.
    """
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Amount", "Type", "Description", "Date Time", "Wallet ID", "Category ID"])
        for tx in transactions_data:
            writer.writerow([
                tx["id"],
                tx["amount"],
                tx["type"],
                tx["description"],
                tx["date_time"],
                tx["wallet_id"],
                tx["category_id"]
            ])


async def generate_report_background(user_id: int, month: int, year: int):
    """Background task to fetch transactions and export to CSV."""
    from sqlalchemy import select, extract
    import anyio
    from app.db.session import AsyncSessionLocal
    from app.models.transaction import Transaction
    from app.models.wallet import Wallet

    async with AsyncSessionLocal() as db:
        # Query transactions belonging to user's wallets in the given month and year
        query = select(Transaction).join(Wallet).where(
            Wallet.user_id == user_id,
            extract("month", Transaction.date_time) == month,
            extract("year", Transaction.date_time) == year
        )
        result = await db.execute(query)
        transactions = result.scalars().all()

        # Serialize ORM data to plain dicts to avoid passing session-attached models to other threads
        transactions_data = [
            {
                "id": tx.id,
                "amount": float(tx.amount),
                "type": tx.type.value,
                "description": tx.description or "",
                "date_time": tx.date_time.isoformat() if tx.date_time else "",
                "wallet_id": tx.wallet_id,
                "category_id": tx.category_id
            }
            for tx in transactions
        ]

    # Save to project root or CWD (where backend is running)
    filename = f"report_T{month}.csv"
    
    # Run blocking I/O on anyio thread pool to avoid blocking the event loop
    await anyio.to_thread.run_sync(write_csv_sync, transactions_data, filename)


@reports_router.post("/export", status_code=status.HTTP_202_ACCEPTED)
async def export_report(
    background_tasks: BackgroundTasks,
    user_id: int = Query(..., gt=0),
    month: int = Query(..., ge=1, le=12),
    year: int | None = Query(None),
):
    """Export transactions of a specific month to CSV in the background."""
    export_year = year if year is not None else datetime.now().year
    
    # Add task to background executor
    background_tasks.add_task(generate_report_background, user_id, month, export_year)
    
    return {"message": "Báo cáo đang được tạo trong nền"}
