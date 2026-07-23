# Huong Dan Chay Backend Personal Finance Management

Tai lieu nay huong dan chay backend tu dau tren may local.

Sau khi tach project thanh `backend/` va `frontend/`, cac lenh FastAPI, Alembic, Docker Compose va `pip install` nen duoc chay trong thu muc `backend/`.

```powershell
cd E:\study\financial-management\backend
```

## 1. Yeu Cau Cai San

Can cai cac cong cu sau:

- Python 3.11 tro len
- Docker Desktop
- Git Bash, PowerShell, hoac terminal bat ky

Kiem tra nhanh:

```bash
python --version
docker --version
docker compose version
```

## 2. Tao Virtual Environment

Dung virtual environment de tach dependencies cua project nay khoi Python global.

Khuyen nghi tao `.venv` o thu muc goc project:

```bash
cd E:\study\financial-management
python -m venv .venv
```

Kich hoat tren Windows PowerShell:

```bash
.\.venv\Scripts\Activate.ps1
```

Neu dung Git Bash:

```bash
source .venv/Scripts/activate
```

Sau khi kich hoat, terminal thuong se hien prefix `(.venv)`.

Sau do di vao backend:

```powershell
cd .\backend
```

## 3. Cai Dependencies

```bash
pip install -r requirements.txt
```

Dependencies chinh:

- `fastapi`: framework API async
- `uvicorn`: server chay FastAPI
- `sqlalchemy>=2.0`: ORM
- `asyncpg`: PostgreSQL async driver
- `alembic`: database migrations
- `pydantic-settings`: quan ly config

## 4. Chay PostgreSQL Bang Docker

Chay database local:

```bash
docker compose up -d
```

Kiem tra container:

```bash
docker compose ps
```

Thong tin database trong project:

```text
Host: localhost
Port: 5433 tren may host, map vao 5432 trong container
Database: finance_db
User: finance_user
Password: finance_password
```

Database URL:

```text
postgresql+asyncpg://finance_user:finance_password@localhost:5433/finance_db
```

## 5. Tao Migration Dau Tien

Alembic doc models SQLAlchemy tu `Base.metadata`, sau do tao file migration trong `alembic/versions`.

```bash
alembic revision --autogenerate -m "create finance tables"
```

Lenh nay se tao mot file Python migration moi. Hay mo file do de xem Alembic da tao cac bang nao.

## 6. Apply Migration Vao Database

```bash
alembic upgrade head
```

Sau lenh nay, PostgreSQL se co cac bang:

- `users`
- `wallets`
- `categories`
- `transactions`
- bang enum PostgreSQL `finance_type`
- bang quan ly version cua Alembic `alembic_version`

## 7. Chay FastAPI

```bash
uvicorn app.main:app --reload
```

Mo trinh duyet:

```text
http://127.0.0.1:8000/docs
```

Kiem tra health endpoint:

```text
http://127.0.0.1:8000/health
```

Ket qua mong doi:

```json
{
  "status": "ok"
}
```

## 8. Thu Tu Chay Day Du

Neu bat dau lai tu dau, chay theo thu tu nay:

```powershell
cd E:\study\financial-management
python -m venv .venv
.\.venv\Scripts\Activate.ps1
cd .\backend
pip install -r requirements.txt
docker compose up -d
alembic revision --autogenerate -m "create finance tables"
alembic upgrade head
uvicorn app.main:app --reload
```

## 9. Dung Project

Dung FastAPI server bang `Ctrl + C`.

Dung database container:

```bash
docker compose down
```

Dung database va xoa luon data volume:

```bash
docker compose down -v
```

Can than voi `docker compose down -v` vi lenh nay xoa sach du lieu PostgreSQL local.

## 10. Ghi Chu Hoc Tap

Project nay dung stack async:

- FastAPI xu ly request theo async event loop.
- SQLAlchemy tao `AsyncSession` de thao tac database bat dong bo.
- `asyncpg` la PostgreSQL driver async that su.

Neu dung driver dong bo trong endpoint async, moi truy van database co the block event loop. Khi nhieu request vao cung luc, API se cham hon vi worker phai cho database tra ket qua theo cach dong bo. Vi vay voi FastAPI async, cap dung nen la:

```text
FastAPI async endpoint -> AsyncSession -> SQLAlchemy async engine -> asyncpg -> PostgreSQL
```

## 11. Troubleshooting

Neu loi port `5433` da duoc dung:

- Tat PostgreSQL local khac, hoac
- Doi port trong `docker-compose.yml`, vi du `"5434:5432"`, sau do doi `DATABASE_URL` sang port `5434`.

Neu Alembic bao khong connect duoc database:

- Kiem tra Docker Desktop dang chay.
- Kiem tra `docker compose ps`.
- Dam bao da chay `docker compose up -d`.

Neu PowerShell chan activate virtual environment:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Sau do chay lai:

```powershell
.\.venv\Scripts\Activate.ps1
```
