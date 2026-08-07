from pydantic import BaseModel
import uuid

class CampaignImageGenerateRequest(BaseModel):
    campaign_id: uuid.UUID

class CampaignImageGenerateResponse(BaseModel):
    campaign_id: uuid.UUID
    image_url: str
