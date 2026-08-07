import uuid
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
