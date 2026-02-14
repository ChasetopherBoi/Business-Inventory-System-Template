from fastapi import FastAPI
from app.api.v1.router import router as api_v1_router
from fastapi.staticfiles import StaticFiles
import os

os.makedirs("app/static/uploads", exist_ok=True)

app = FastAPI(title="Inventory & Scheduling API", version="0.1.0")

app.include_router(api_v1_router, prefix="/api/v1")

app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/health")
def health_check():
    return {"status": "ok"}
