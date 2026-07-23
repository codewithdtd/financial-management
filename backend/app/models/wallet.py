# Decimal phu hop cho tien te hon float vi tranh loi lam tron nhi phan.
from decimal import Decimal

# TYPE_CHECKING giup import model chi de type hint, tranh circular import runtime.
from typing import TYPE_CHECKING

# ForeignKey khai bao khoa ngoai.
# Numeric tao cot so chinh xac, vi du NUMERIC(12, 2).
# String tao cot VARCHAR.
from sqlalchemy import ForeignKey, Numeric, String

# Mapped/mapped_column la typed ORM style cua SQLAlchemy 2.0.
# relationship khai bao lien ket object giua cac model.
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    # Chi import luc static type checking.
    from app.models.transaction import Transaction
    from app.models.user import User


class Wallet(Base):
    # Ten bang vi trong database.
    __tablename__ = "wallets"

    # id la khoa chinh cua bang wallets.
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Ten vi, vi du: "Cash", "Bank Account", "Momo".
    name: Mapped[str] = mapped_column(String(100))

    # balance dung Decimal o Python va Numeric(12, 2) o PostgreSQL.
    # default=Decimal("0.00") dat so du mac dinh la 0.
    balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))

    # user_id la khoa ngoai tro ve users.id.
    # ondelete="CASCADE" noi database xoa wallet khi user cha bi xoa.
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    # Many-to-One: nhieu Wallet thuoc ve mot User.
    # back_populates="wallets" phai khop voi User.wallets.
    user: Mapped["User"] = relationship(back_populates="wallets")

    # One-to-Many relationship:
    # One Wallet can have many Transactions.
    # back_populates must match the attribute name on Transaction.wallet.
    # list["Transaction"] nghia la khi load wallet.transactions, ta nhan ve list giao dich.
    # delete-orphan nghia la transaction bi tach khoi wallet cha se duoc xoa.
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="wallet",
        cascade="all, delete-orphan",
    )
