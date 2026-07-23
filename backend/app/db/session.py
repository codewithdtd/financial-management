# AsyncGenerator dung de type hint cho dependency co yield.
from collections.abc import AsyncGenerator

# AsyncSession: phien lam viec voi database theo kieu async.
# async_sessionmaker: factory tao AsyncSession.
# create_async_engine: tao engine bat dong bo cho SQLAlchemy.
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Lay cau hinh database_url tu app/core/config.py.
from app.core.config import get_settings


# Nap settings 1 lan nhờ get_settings da co lru_cache.
settings = get_settings()

# Async engine uses asyncpg under the hood because the URL starts with
# postgresql+asyncpg://. This keeps database I/O non-blocking in FastAPI.
# Neu dung driver dong bo, database query co the block event loop cua FastAPI.
engine = create_async_engine(settings.database_url, echo=False)

# async_sessionmaker creates AsyncSession objects.
# expire_on_commit=False keeps model attributes available after commit.
# bind=engine noi session factory voi database engine.
# class_=AsyncSession bat buoc factory tao session async, khong phai Session dong bo.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# Kieu tra ve la AsyncGenerator[AsyncSession, None]:
# - yield ra 1 AsyncSession cho endpoint dung.
# - None nghia la generator khong nhan gia tri gui nguoc vao.
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that gives each request its own AsyncSession."""

    # async with dam bao session duoc dong dung cach sau khi request ket thuc.
    async with AsyncSessionLocal() as session:
        # FastAPI se inject session nay vao endpoint dependency.
        yield session
