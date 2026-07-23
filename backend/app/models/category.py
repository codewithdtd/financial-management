# TYPE_CHECKING giup import type hint ma khong gay circular import runtime.
from typing import TYPE_CHECKING

# Enum tao cot co tap gia tri hop le co dinh.
# ForeignKey khai bao khoa ngoai.
# String tao cot VARCHAR.
from sqlalchemy import Enum, ForeignKey, String

# Mapped/mapped_column/relationship la API ORM typed style cua SQLAlchemy 2.0.
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import FinanceType

if TYPE_CHECKING:
    # Chi import khi type checker can biet Transaction/User la gi.
    from app.models.transaction import Transaction
    from app.models.user import User


class Category(Base):
    # Ten bang danh muc trong database.
    __tablename__ = "categories"

    # Khoa chinh cua category.
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Ten danh muc, vi du: "Salary", "Food", "Rent".
    name: Mapped[str] = mapped_column(String(100))

    # SQLAlchemy Enum stores a constrained value in the database.
    # FinanceType only allows "income" or "expense", so invalid values are rejected.
    # values_callable makes PostgreSQL store enum values: "income", "expense"
    # instead of Python enum names: "INCOME", "EXPENSE".
    # name="finance_type" dat ten enum type ben PostgreSQL.
    type: Mapped[FinanceType] = mapped_column(
        Enum(
            FinanceType,
            name="finance_type",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
    )

    # Category thuoc ve mot user cu the.
    # Moi user co the tu tao bo danh muc rieng.
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    # Many-to-One: nhieu Category thuoc mot User.
    user: Mapped["User"] = relationship(back_populates="categories")

    # One-to-Many: mot Category co the duoc dung trong nhieu Transaction.
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="category")
