from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    surname: str

class UserCreate(UserBase):
    password: str 
    plan_id: Optional[UUID] = None


class UserResponse(UserBase):
    id: UUID
    plan_id: Optional[UUID]
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}
