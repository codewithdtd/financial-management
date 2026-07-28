# TYPE_CHECKING chi True khi type checker chay, False luc runtime.
# Dung de tranh circular import giua cac model co relationship qua lai.
from typing import TYPE_CHECKING

# String la kieu cot VARCHAR trong database.
from sqlalchemy import String

# Mapped: type hint dac biet cua SQLAlchemy 2.0 cho ORM attribute.
# mapped_column: khai bao cot database.
# relationship: khai bao lien ket ORM giua cac bang.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Base la class chung ma moi model SQLAlchemy se ke thua.
from app.db.base import Base

if TYPE_CHECKING:
    # Import chi phuc vu type hint, khong chay luc runtime.
    from app.models.category import Category


# User ke thua Base nen SQLAlchemy se xem class nay la mot ORM model.
class User(Base):
    # Ten bang that trong PostgreSQL.
    __tablename__ = "users"

    # SQLAlchemy 2.0 typed ORM style:
    # - Mapped[int] is the Python type of this ORM attribute.
    # - mapped_column(...) describes the database column details.
    # primary_key=True bien id thanh khoa chinh.
    # index=True tao index de truy van theo id nhanh hon.
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Mapped[str] noi voi Python/type checker rang email la string.
    # String(255) noi voi database rang cot nay la VARCHAR(255).
    # unique=True dam bao khong co 2 user cung email.
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # Chi luu hash cua password, khong bao gio luu plain text password.
    password_hash: Mapped[str] = mapped_column(String(255))

    # One-to-Many: mot User co nhieu Category.
    # Category.user la dau con lai cua quan he nay.
    categories: Mapped[list["Category"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
