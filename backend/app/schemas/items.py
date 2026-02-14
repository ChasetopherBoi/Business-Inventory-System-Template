from pydantic import BaseModel, Field
from typing import Optional


class ItemBase(BaseModel):
    item_number: str
    name: str
    description: str
    qty_per_purchase: int = Field(ge=1)
    qty_in_stock: int = Field(ge=0)
    price: float = Field(ge=0)
    image_url: Optional[str] = None

    # NEW
    category: str
    subcategory: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    qty_per_purchase: Optional[int] = Field(default=None, ge=1)
    qty_in_stock: Optional[int] = Field(default=None, ge=0)
    price: Optional[float] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None


class ItemRead(ItemBase):
    id: int

    class Config:
        from_attributes = True
