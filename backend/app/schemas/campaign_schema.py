import uuid
from typing import Optional
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
    generated_text: str
    slogan: str

class CampaignCreateRequest(BaseModel):
    product_id: uuid.UUID
    goal: str
    platform: str
    type: str
    user_prompt: str
    generated_text: str

class CampaignResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_analyze_id: uuid.UUID
    goal: str
    platform: str
    type: str
    user_prompt: Optional[str] = None
    system_prompt: str
    generated_text: Optional[str] = None

    class Config:
        from_attributes = True
