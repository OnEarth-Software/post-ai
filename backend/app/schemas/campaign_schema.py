from pydantic import BaseModel

class CampaignInfo(BaseModel):
    goal: str
    platform: str
    type: str
    user_prompt: str

class CampaignTextGenerateRequest(BaseModel):
    analysis_result: dict
    campaign_info: CampaignInfo
    image_url: str

class CampaignTextGenerateResponse(BaseModel):
    generated_text: str
