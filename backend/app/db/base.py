# app/db/base.py
from app.db.base_class import Base  # noqa: F401

# Import models so they register with Base.metadata
from app.models.user import User  # noqa: F401
from app.models.item import Item  # noqa: F401
from app.models.order import Order  # noqa: F401
from app.models.order_item import OrderItem  # noqa: F401
