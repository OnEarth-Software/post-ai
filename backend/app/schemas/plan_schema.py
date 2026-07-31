from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class PlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = 0.0

class PlanResponse(PlanBase):
    id: UUID
    created_at: datetime
    class Config:
        from_attributes = True