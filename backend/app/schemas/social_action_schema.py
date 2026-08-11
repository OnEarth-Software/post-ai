import uuid
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LikeToggleResponse(BaseModel):
    is_liked: bool
    likes_count: int

class NotificationUserBase(BaseModel):
    id: uuid.UUID
    name: str
    surname: str
    
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: uuid.UUID
    actor: Optional[NotificationUserBase]
    campaign_result_id: Optional[uuid.UUID]
    type: str
    message: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
