from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import router
from app.routers.auth import auth_router
from app.routers.stats import stats_router
from app.routers.reports import reports_router


app = FastAPI(title="Personal Finance Management API")

# React Vite runs on port 5173 while FastAPI runs on port 8000.  Because the
# browser sees these as different origins, it needs explicit CORS permission.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all Core API endpoints defined in routers.py.
# This keeps the application entrypoint small while FastAPI still exposes
# every route in the generated OpenAPI/Swagger documentation.
app.include_router(router)
app.include_router(auth_router)
app.include_router(stats_router)
app.include_router(reports_router)



@app.get("/health")
async def health_check() -> dict[str, str]:
    # A small endpoint used to verify that the API process is alive.
    return {"status": "ok"}
