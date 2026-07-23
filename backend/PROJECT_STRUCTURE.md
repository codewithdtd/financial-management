# Cau Truc Thu Muc Va Chuc Nang Tung File

Tai lieu nay giai thich project Personal Finance Management theo goc nhin cua nguoi moi hoc Python va FastAPI.

## Tong Quan

Project hien tai la backend API toi thieu dung:

- FastAPI de tao HTTP API.
- PostgreSQL lam database.
- SQLAlchemy 2.0 lam ORM de map Python class voi database table.
- asyncpg lam PostgreSQL async driver.
- Alembic de quan ly database migration.
- Docker Compose de chay PostgreSQL local.

## Cay Thu Muc

```text
financial-management/
  .gitignore
  AGENTS.md
  plan/
    .gitkeep
  backend/
    PROJECT_STRUCTURE.md
    RUN_PROJECT.md
    alembic.ini
    docker-compose.yml
    requirements.txt
    alembic/
      env.py
      versions/
    app/
      __init__.py
      main.py
      core/
        __init__.py
        config.py
      db/
        __init__.py
        base.py
        session.py
      models/
        __init__.py
        category.py
        enums.py
        transaction.py
        user.py
        wallet.py
  frontend/
    # se tao sau
```

## File O Thu Muc Goc

Thu muc goc `financial-management/` la noi gom nhieu phan cua project.

- `backend/`: source FastAPI, database config, migrations, Docker Compose cho PostgreSQL.
- `frontend/`: se tao sau khi hoc den phan giao dien.
- `plan/`: noi luu cac implementation plan dang Markdown.
- `.venv/`: virtual environment local, nen giu o root de backend va frontend tooling sau nay de quan ly.

### `.gitignore`

Khai bao nhung file/folder khong nen dua vao Git.

Vi du:

- `.venv/`: virtual environment local.
- `__pycache__/`: cache Python tu tao.
- `.env`: bien moi truong va secret local.
- `.pytest_cache/`, `.mypy_cache/`, `.ruff_cache/`: cache cua tool.

Muc tieu la giu Git repository sach, chi commit source code va tai lieu can thiet.

### `AGENTS.md`

File ghi chu rieng cho Codex khi lam viec trong repo nay.

Hien tai file nay quy uoc:

- Khi tao implementation plan, luu them mot file Markdown trong thu muc `plan/`.
- Ten file plan theo format `YYYY-MM-DD-short-topic.md`.

### `backend/PROJECT_STRUCTURE.md`

Chinh la file ban dang doc.

Muc dich:

- Giai thich cau truc project.
- Giai thich chuc nang tung file.
- Giup nguoi moi Python/FastAPI hieu nen bat dau doc code tu dau.

### `backend/RUN_PROJECT.md`

Huong dan chay project tu dau.

File nay gom:

- Tao virtual environment.
- Cai dependencies.
- Chay PostgreSQL bang Docker.
- Tao Alembic migration.
- Apply migration.
- Chay FastAPI.
- Troubleshooting loi thuong gap.

### `backend/requirements.txt`

Danh sach thu vien Python can cai cho project.

Khi chay:

```bash
pip install -r requirements.txt
```

Python se cai cac package trong file nay.

Nhung package quan trong:

- `fastapi`: framework tao API.
- `uvicorn`: server chay FastAPI.
- `sqlalchemy>=2.0`: ORM.
- `asyncpg`: driver async ket noi PostgreSQL.
- `alembic`: migration database.
- `pydantic-settings`: doc config tu environment variables.
- `python-dotenv`: ho tro doc file `.env`.

### `backend/docker-compose.yml`

Dung de chay PostgreSQL local bang Docker.

Service hien tai:

```text
postgres
```

Thong tin database:

```text
Database: finance_db
User: finance_user
Password: finance_password
Port: 5433 tren may host, map vao 5432 trong container
```

Chay database:

```bash
docker compose up -d
```

Tat database:

```bash
docker compose down
```

### `backend/alembic.ini`

File cau hinh chinh cua Alembic.

Alembic dung file nay de biet:

- Thu muc migration nam o dau.
- Database URL mac dinh la gi.
- Cau hinh logging khi chay migration.

Trong project nay, database URL se duoc override trong `alembic/env.py` bang config tu app.

## Thu Muc `backend/app/`

Day la source code chinh cua FastAPI application.

### `backend/app/__init__.py`

Danh dau `app/` la mot Python package.

Python package la thu muc co the duoc import bang cu phap:

```python
import app
```

File nay co the de trong o giai doan dau.

### `backend/app/main.py`

Entry point cua FastAPI app.

No tao object:

```python
app = FastAPI(...)
```

Va dinh nghia endpoint:

```python
@app.get("/health")
async def health_check():
    ...
```

Khi chay:

```bash
uvicorn app.main:app --reload
```

Nghia la:

- `app.main`: import file `app/main.py`.
- `app`: lay bien `app` trong file do.
- `--reload`: tu dong restart server khi code thay doi.

## Thu Muc `backend/app/core/`

Chua cau hinh cot loi cua ung dung.

### `backend/app/core/__init__.py`

Danh dau `core/` la Python package.

### `backend/app/core/config.py`

Chua class `Settings`.

File nay quan ly config nhu:

```python
database_url
```

Ly do nen gom config vao mot noi:

- De doi cau hinh de hon.
- De khong hard-code lung tung trong nhieu file.
- De co the override bang `.env` khi can.

Vi du database URL hien tai:

```text
postgresql+asyncpg://finance_user:finance_password@localhost:5433/finance_db
```

Y nghia:

- `postgresql`: dialect database.
- `asyncpg`: driver async.
- `finance_user`: username.
- `finance_password`: password.
- `localhost`: host.
- `5432`: port.
- `finance_db`: database name.

## Thu Muc `backend/app/db/`

Chua code lien quan den database infrastructure.

### `backend/app/db/__init__.py`

Danh dau `db/` la Python package.

### `backend/app/db/base.py`

Chua class:

```python
class Base(DeclarativeBase):
    pass
```

Moi SQLAlchemy model se ke thua `Base`.

Vai tro cua `Base`:

- Gom metadata cua tat ca models.
- Cho SQLAlchemy biet co nhung bang nao.
- Cho Alembic doc `Base.metadata` de autogenerate migration.

### `backend/app/db/session.py`

Chua setup ket noi database async.

Nhung thanh phan quan trong:

- `create_async_engine(...)`: tao database engine async.
- `async_sessionmaker(...)`: tao factory de sinh `AsyncSession`.
- `get_async_session()`: dependency cho FastAPI endpoint sau nay.

Vi sao dung async?

FastAPI hoat dong tot voi async I/O. Database query la I/O operation. Neu dung driver dong bo, request co the bi block trong luc cho database tra ket qua. Dung:

```text
FastAPI async endpoint -> AsyncSession -> asyncpg -> PostgreSQL
```

giup server xu ly nhieu request cung luc hieu qua hon.

## Thu Muc `backend/app/models/`

Chua cac SQLAlchemy ORM models.

Moi model la mot Python class dai dien cho mot database table.

### `backend/app/models/__init__.py`

Import cac model vao mot noi.

Alembic can import models de SQLAlchemy dang ky chung vao `Base.metadata`.

Neu khong import model, Alembic co the khong thay bang khi chay:

```bash
alembic revision --autogenerate
```

### `backend/app/models/enums.py`

Chua enum:

```python
class FinanceType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
```

Enum dung de gioi han gia tri hop le.

Trong project nay, `type` cua `Category` va `Transaction` chi duoc la:

- `income`
- `expense`

### `backend/app/models/user.py`

Dai dien bang `users`.

Fields:

- `id`: khoa chinh.
- `email`: email user, unique.
- `password_hash`: mat khau da hash.

Relationships:

- Mot user co nhieu wallets.
- Mot user co nhieu categories.

### `backend/app/models/wallet.py`

Dai dien bang `wallets`.

Fields:

- `id`: khoa chinh.
- `name`: ten vi.
- `balance`: so du, mac dinh `0.00`.
- `user_id`: khoa ngoai tro ve `users.id`.

Relationships:

- Nhieu wallet thuoc ve mot user.
- Mot wallet co nhieu transactions.

### `backend/app/models/category.py`

Dai dien bang `categories`.

Fields:

- `id`: khoa chinh.
- `name`: ten danh muc.
- `type`: enum `income` hoac `expense`.
- `user_id`: khoa ngoai tro ve `users.id`.

Relationships:

- Nhieu category thuoc ve mot user.
- Mot category co the duoc dung trong nhieu transactions.

### `backend/app/models/transaction.py`

Dai dien bang `transactions`.

Fields:

- `id`: khoa chinh.
- `amount`: so tien.
- `type`: enum `income` hoac `expense`.
- `description`: mo ta, co the null.
- `date_time`: thoi gian giao dich.
- `wallet_id`: khoa ngoai tro ve `wallets.id`.
- `category_id`: khoa ngoai tro ve `categories.id`.

Relationships:

- Nhieu transaction thuoc ve mot wallet.
- Nhieu transaction thuoc ve mot category.

## Thu Muc `backend/alembic/`

Chua code migration database.

### `backend/alembic/env.py`

File runtime cua Alembic.

Khi ban chay:

```bash
alembic revision --autogenerate -m "create finance tables"
```

hoac:

```bash
alembic upgrade head
```

Alembic se chay file `env.py`.

File nay lam cac viec:

- Load `DATABASE_URL`.
- Import models.
- Lay `Base.metadata`.
- Tao async engine.
- Chay migration voi PostgreSQL.

### `backend/alembic/versions/`

Thu muc chua cac file migration duoc Alembic tao ra.

Ban dau thu muc nay trong.

Sau khi chay:

```bash
alembic revision --autogenerate -m "create finance tables"
```

Alembic se tao file moi trong day.

## Thu Muc `plan/`

Chua cac implementation plan dang Markdown.

Theo quy uoc trong `AGENTS.md`, moi khi tao plan cho project nay, Codex se luu them file vao thu muc nay.

### `plan/.gitkeep`

Git khong track thu muc rong.

File `.gitkeep` la file rong dung de giu thu muc `plan/` ton tai trong Git.

## Nen Doc Code Theo Thu Tu Nao?

Neu ban moi hoc Python/FastAPI, nen doc theo thu tu:

1. `backend/RUN_PROJECT.md`
2. `backend/PROJECT_STRUCTURE.md`
3. `backend/app/main.py`
4. `backend/app/core/config.py`
5. `backend/app/db/base.py`
6. `backend/app/db/session.py`
7. `backend/app/models/enums.py`
8. `backend/app/models/user.py`
9. `backend/app/models/wallet.py`
10. `backend/app/models/category.py`
11. `backend/app/models/transaction.py`
12. `backend/alembic/env.py`

Thu tu nay di tu de den kho:

- Chay app truoc.
- Hieu entry point.
- Hieu config.
- Hieu database setup.
- Hieu models.
- Cuoi cung moi hieu migration.
