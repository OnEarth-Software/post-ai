import uuid
from typing import Optional, List
from pydantic import BaseModel

class CampaignInfo(BaseModel):
    goal: str
    platform: str
    type: str
    user_prompt: str

class CampaignTextGenerateRequest(BaseModel):
    product_id: uuid.UUID
    analysis_result: dict
    campaign_info: CampaignInfo
    image_url: str

class CampaignTextGenerateResponse(BaseModel):
    slogan: str
    subtext: str

class CampaignCreateRequest(BaseModel):
    product_id: uuid.UUID
    goal: str
    platform: str
    type: str
    user_prompt: str
    slogan: str
    subtext: str
    image_model: str = "gpt-image-2"
    

class CampaignResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_analyze_id: uuid.UUID
    goal: str
    platform: str
    type: str
    user_prompt: Optional[str] = None
    system_prompt: str
    market_report: str
    slogan: Optional[str] = None
    subtext: Optional[str] = None
    post_text: Optional[str] = None
    market_report: Optional[str] = None
    image_model: Optional[str] = None

    class Config:
        from_attributes = True

from datetime import datetime

class CampaignResultBase(BaseModel):
    id: uuid.UUID
    image_url: str
    is_public: bool = False
    created_at: datetime
    class Config:
        from_attributes = True

class CampaignProductBase(BaseModel):
    id: uuid.UUID
    name: str
    image_url: str
    brand_id: Optional[uuid.UUID] = None
    class Config:
        from_attributes = True

class CampaignListResponse(BaseModel):
    id: uuid.UUID
    goal: str
    platform: str
    type: str
    slogan: Optional[str] = None
    subtext: Optional[str] = None
    post_text: Optional[str] = None
    market_report: Optional[str] = None
    image_model: Optional[str] = None
    created_at: datetime
    product: CampaignProductBase
    results: List[CampaignResultBase] = []

    class Config:
        from_attributes = True

class CampaignDetailResponse(CampaignListResponse):
    user_prompt: Optional[str] = None
    system_prompt: str

class CampaignPostTextGenerateResponse(BaseModel):
    campaign_id: uuid.UUID
    post_text: str
    hook: Optional[str] = None
    body: Optional[str] = None
    call_to_action: Optional[str] = None
    hashtags: Optional[List[str]] = []
