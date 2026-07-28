# datetime la kieu thoi gian Python cho cot date_time.
from datetime import datetime

# Decimal dung cho tien te de tranh sai so cua float.
from decimal import Decimal

# TYPE_CHECKING tranh circular import runtime khi type hint cac relationship.
from typing import TYPE_CHECKING

# DateTime tao cot timestamp.
# Enum tao cot chi nhan gia tri trong FinanceType.
# ForeignKey tao khoa ngoai.
# Numeric tao cot so chinh xac cho tien.
# String tao cot VARCHAR.
# func cho phep goi ham SQL nhu now().
from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func

# Mapped/mapped_column/relationship la style ORM typed cua SQLAlchemy 2.0.
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import FinanceType

if TYPE_CHECKING:
    # Chi import de type checker hieu string annotations ben duoi.
    from app.models.category import Category


class Transaction(Base):
    # Ten bang giao dich trong database.
    __tablename__ = "transactions"

    # Khoa chinh cua transaction.
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # amount la so tien giao dich.
    # Decimal o Python map voi Numeric(12, 2) o PostgreSQL.
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    # type dung chung FinanceType voi Category.
    # Mapped[FinanceType] giup Python biet field nay nhan enum, khong phai string tuy y.
    type: Mapped[FinanceType] = mapped_column(
        Enum(
            FinanceType,
            name="finance_type",
            # Luu "income"/"expense" xuong DB thay vi "INCOME"/"EXPENSE".
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
    )

    # Mo ta co the null, nen type hint la str | None.
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # DateTime(timezone=True) luu timestamp co timezone.
    # server_default=func.now() de database tu set thoi gian neu app khong truyen.
    date_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Moi transaction bat buoc co category.
    # ondelete="RESTRICT": khong cho xoa category neu dang co transaction dung no.
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT")
    )

    # Many-to-One: nhieu Transaction thuoc mot Category.
    # back_populates="transactions" phai khop voi Category.transactions.
    category: Mapped["Category"] = relationship(back_populates="transactions")
