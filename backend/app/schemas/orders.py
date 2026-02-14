from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


class CartLine(BaseModel):
    item_number: str
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    lines: List[CartLine]


class OrderItemRead(BaseModel):
    item_number: str
    name: str
    unit_price: float
    quantity: int
    line_total: float

    class Config:
        from_attributes = True


class OrderRead(BaseModel):
    id: int
    status: str
    subtotal: float
    tax: float
    total: float
    created_at: datetime
    items: List[OrderItemRead]

    class Config:
        from_attributes = True
