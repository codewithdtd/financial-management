# DeclarativeBase la base class moi cua SQLAlchemy 2.0.
# Tat ca ORM model se ke thua Base de duoc SQLAlchemy quan ly.
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models.

    SQLAlchemy reads metadata from this class to know which tables exist.
    Alembic also uses Base.metadata when autogenerating migrations.
    """

    # Khong can them logic o day luc nay.
    # Chi can class Base ton tai de gom metadata cua tat ca model.
    pass
