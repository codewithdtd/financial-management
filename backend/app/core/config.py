# lru_cache giup cache ket qua cua ham get_settings().
# Nghia la Settings chi duoc tao 1 lan, cac lan sau tai su dung object cu.
from functools import lru_cache

# BaseSettings doc bien moi truong va file .env de nap cau hinh ung dung.
from pydantic_settings import BaseSettings, SettingsConfigDict


# Settings la noi gom cac bien cau hinh cua app.
# Cach nay giup code khong bi rai rac hard-code config o nhieu file.
class Settings(BaseSettings):
    # SQLAlchemy async URL format:
    # postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DB_NAME
    #
    # "postgresql" tells SQLAlchemy the database dialect.
    # "asyncpg" tells SQLAlchemy which async PostgreSQL driver to use.
    database_url: str = (
        "postgresql+asyncpg://finance_user:finance_password@localhost:5433/finance_db"
    )

    # Secret used to sign JWT access tokens.  In a real deployment this must
    # be replaced through the JWT_SECRET_KEY environment variable and never
    # committed to source control.
    jwt_secret_key: str = "development-only-change-this-secret"

    # HS256 is a symmetric algorithm: the same secret signs and verifies JWTs.
    jwt_algorithm: str = "HS256"

    # Token lifetime in minutes.  A short lifetime limits damage if a token
    # is accidentally exposed.
    access_token_expire_minutes: int = 30

    # Cho phep override database_url bang file .env neu can.
    # Vi du trong .env co DATABASE_URL=...
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# @lru_cache bien get_settings thanh singleton nhe.
# Trong FastAPI, pattern nay hay dung de khong doc .env lap lai moi request.
@lru_cache
def get_settings() -> Settings:
    # Tao object Settings; Pydantic se tu nap env var / .env vao cac field.
    return Settings()
