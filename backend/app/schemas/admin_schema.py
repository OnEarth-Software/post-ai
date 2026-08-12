from pydantic import BaseModel
from typing import List

class ActiveUser(BaseModel):
    name: str
    surname: str
    campaign_count: int

class DailyCampaign(BaseModel):
    date: str
    count: int

class DashboardStatsResponse(BaseModel):
    total_users: int
    total_campaigns: int
    users_change_percentage: float
    campaigns_change_percentage: float
    active_users: List[ActiveUser]
    daily_campaigns: List[DailyCampaign]
