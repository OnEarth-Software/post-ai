from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional

class CampaignImageGenerateRequest(BaseModel):
    campaign_id: uuid.UUID

class CampaignImageGenerateResponse(BaseModel):
    campaign_id: uuid.UUID
    image_url: str
    is_public: bool = False

class CampaignResultSocialToggleRequest(BaseModel):
    is_public: bool

class SocialFeedItemResponse(BaseModel):
    id: uuid.UUID
    image_url: str
    user_name: str
    product_name: str
    created_at: datetime
    campaign_goal: Optional[str] = None
    campaign_type: Optional[str] = None
