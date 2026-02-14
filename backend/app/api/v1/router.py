from fastapi import APIRouter
from app.api.v1 import users, auth
from app.api.v1 import items
from app.api.v1 import orders


router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(items.router, prefix="/items", tags=["items"])
router.include_router(orders.router, prefix="/orders", tags=["orders"])
