from fastapi import FastAPI

from app.routers import router
from app.routers.auth import auth_router
from app.routers.stats import stats_router


app = FastAPI(title="Personal Finance Management API")

# Register all Core API endpoints defined in routers.py.
# This keeps the application entrypoint small while FastAPI still exposes
# every route in the generated OpenAPI/Swagger documentation.
app.include_router(router)
app.include_router(auth_router)
app.include_router(stats_router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    # A small endpoint used to verify that the API process is alive.
    return {"status": "ok"}
