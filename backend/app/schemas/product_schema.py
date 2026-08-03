from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class ProductBase(BaseModel):
    name: str
    image_url: str


class ProductCreate(BaseModel):
    name: str


class ProductResponse(ProductBase):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
