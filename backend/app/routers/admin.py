from fastapi import APIRouter, Depends, Response
from typing import Any
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.core.deps import get_current_admin
from app.controllers import admin_controller
from app.schemas.admin_schema import FinancialStatsResponse, DashboardStatsResponse, PaginatedUserResponse, UserAdminUpdateRequest, PaginatedCampaignAdminResponse

router = APIRouter()

@router.get("/check-access")
def check_admin_access(
    current_admin: User = Depends(get_current_admin)
) -> Any:
    """
    Verify if current user is admin.
    """
    return admin_controller.check_access(current_admin)

@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
) -> Any:
    """
    Get statistics for the admin dashboard.
    """
    admin_controller.check_access(current_admin)
    return admin_controller.get_dashboard_stats(db)

@router.get("/users", response_model=PaginatedUserResponse)
def get_users_paginated(
    page: int = 1,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.get_users_paginated(db, page, limit)

@router.put("/users/{user_id}")
def update_user_profile(
    user_id: str,
    update_data: UserAdminUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.update_user_profile(db, user_id, update_data)

@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.delete_user(db, user_id)

@router.get("/campaigns", response_model=PaginatedCampaignAdminResponse)
def get_campaigns_paginated(
    page: int = 1,
    limit: int = 5,
    search: str = None,
    platform: str = None,
    type_filter: str = None,
    sort: str = "desc",
    date_range: str = "all",
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.get_campaigns_paginated(db, page, limit, search, platform, type_filter, sort, date_range)

@router.delete("/campaigns/{campaign_id}")
def delete_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.delete_campaign(db, campaign_id)


@router.get("/finance-stats", response_model=FinancialStatsResponse)
def get_finance_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.get_financial_stats(db)

@router.get("/campaigns/export")
def export_campaigns(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    csv_data = admin_controller.export_campaigns_csv(db, start_date, end_date)
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=campaigns_{start_date}_to_{end_date}.csv"
        }
    )