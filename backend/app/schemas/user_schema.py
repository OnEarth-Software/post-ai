from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    surname: str
    role: str = "user"

class UserCreate(UserBase):
    password: str 
    plan_id: Optional[UUID] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    plan_id: Optional[UUID]
    created_at: datetime
    is_2fa_enabled: bool = False
    design_limit: Optional[int] = 5
    product_limit: Optional[int] = 5
    
    model_config = {"from_attributes": True}

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class TwoFactorVerify(BaseModel):
    code: str

class Login2FA(BaseModel):
    temp_token: str
    code: str
