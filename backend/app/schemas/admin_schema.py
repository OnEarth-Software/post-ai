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
    total_tokens_spent: int
    total_cost: float
    users_change_percentage: float
    campaigns_change_percentage: float
    tokens_change_percentage: float
    cost_change_percentage: float
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

class CampaignUserSchema(BaseModel):
    name: str
    avatar: str

class CampaignAdminResponse(BaseModel):
    id: str
    imageUrl: str
    platform: str
    type: str
    goal: str
    slogan: str
    tokensSpent: int
    cost: str
    user: CampaignUserSchema
    createdAt: str
    user_prompt: Optional[str] = None
    system_prompt: Optional[str] = None
    subtext: Optional[str] = None

class PaginatedCampaignAdminResponse(BaseModel):
    items: List[CampaignAdminResponse]
    total: int
    page: int
    limit: int


class PlanRevenue(BaseModel):
    id: str
    plan: str
    price: str
    subscribers: int
    totalRevenue: str
    mrrGrowth: str

class ApiExpenseItem(BaseModel):
    id: str
    service: str
    tokensUsed: str
    totalCost: str
    trend: str

class MonthlyChartData(BaseModel):
    month: str
    income: float
    expense: float

class UserApiCost(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    tokensUsed: str
    totalCost: str

class FinancialStatsResponse(BaseModel):
    totalRevenue: float
    apiCost: float
    netProfit: float
    activeSubscribers: int
    revenueGrowth: float
    apiCostGrowth: float
    netProfitGrowth: float
    newSubscribers: int
    planRevenues: List[PlanRevenue]
    apiExpenses: List[ApiExpenseItem]
    monthlyChart: List[MonthlyChartData]
    userApiCosts: List[UserApiCost]
