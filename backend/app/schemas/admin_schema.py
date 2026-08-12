from pydantic import BaseModel
from typing import List, Optional

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

class UserAdminResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    plan: str
    designUsage: int
    designLimit: int
    productUsage: int
    productLimit: int
    status: str

class PaginatedUserResponse(BaseModel):
    items: List[UserAdminResponse]
    total: int
    page: int
    limit: int

class UserAdminUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    plan: Optional[str] = None
    designLimit: Optional[int] = None
    productLimit: Optional[int] = None
