from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class AssetBase(BaseModel):
    image_url: str

class AssetResponse(AssetBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class AssetListResponse(BaseModel):
    assets: List[AssetResponse]
