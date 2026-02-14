from sqlalchemy import Column, Integer, String, Text, Numeric
from app.db.base_class import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)

    item_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    qty_per_purchase = Column(Integer, nullable=False, default=1)
    qty_in_stock = Column(Integer, nullable=False, default=0)

    price = Column(Numeric(10, 2), nullable=False, default=0)

    image_url = Column(String(1024), nullable=True)

    # NEW
    category = Column(String(100), nullable=False, default="Office Supplies")
    subcategory = Column(String(100), nullable=True)
