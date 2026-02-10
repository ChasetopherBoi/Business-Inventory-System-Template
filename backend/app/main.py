from fastapi import FastAPI
from app.api import users


app = FastAPI(title="Inventory & Scheduling API", version="0.1.0")


app.include_router(users.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
