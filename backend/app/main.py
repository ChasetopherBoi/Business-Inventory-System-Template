from fastapi import FastAPI
from app.api.v1.router import router as api_v1_router
from fastapi.staticfiles import StaticFiles
import os

os.makedirs("app/static/uploads", exist_ok=True)

app = FastAPI(title="Inventory & Scheduling API", version="0.1.0")

app.include_router(api_v1_router, prefix="/api/v1")

from app.db.session import engine
from app.db.base import Base  # triggers model imports

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"

assets_dir = frontend_dist / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/{path:path}")
def spa(path: str):
    index = frontend_dist / "index.html"
    if index.exists():
        return FileResponse(index)
    return {"detail": "Frontend not built"}


@app.on_event("startup")
def _create_tables():
    Base.metadata.create_all(bind=engine)


app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/health")
def health_check():
    return {"status": "ok"}
