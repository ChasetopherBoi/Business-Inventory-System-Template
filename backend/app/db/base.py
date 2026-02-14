# app/db/base.py
from app.db.base_class import Base  # noqa: F401

from app.models.user import User  # noqa: F401
from app.models.item import Item  # noqa: F401
from app.models.order import Order  # noqa: F401
from app.models.order_item import OrderItem  # noqa: F401


from sqlalchemy.orm import DeclarativeBase
from app.models.user import User
from app.models.item import Item
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
