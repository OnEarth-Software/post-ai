from fastapi import APIRouter, Depends, Response
from typing import Any
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.core.deps import get_current_admin
from app.controllers import admin_controller
from app.schemas.admin_schema import (
    DashboardStatsResponse, UserAdminResponse, PaginatedUserResponse,
    UserAdminUpdateRequest, PaginatedCampaignAdminResponse, FinancialStatsResponse,
    PaginatedProductAdminResponse, PaginatedMarketReportAdminResponse, SystemConfigUpdate
)

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


@router.get("/products", response_model=PaginatedProductAdminResponse)
def get_products_paginated(
    page: int = 1,
    limit: int = 5,
    search: str = None,
    sort: str = "desc",
    date_range: str = "all",
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.get_products_paginated(db, page, limit, search, sort, date_range)

@router.delete("/products/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.delete_product(db, product_id)

@router.get("/products/export")
def export_products(
    start_date: str = None,
    end_date: str = None,
    search: str = None,
    sort: str = "desc",
    date_range: str = "all",
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    csv_data = admin_controller.export_products_csv(
        db, start_date, end_date, search, sort, date_range
    )
    
    s_date = start_date or "filtered"
    e_date = end_date or "export"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=products_{s_date}_to_{e_date}.csv"
        }
    )


@router.get("/finance-stats", response_model=FinancialStatsResponse)
def get_finance_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.get_financial_stats(db)

@router.get("/campaigns/export")
def export_campaigns(
    start_date: str = None,
    end_date: str = None,
    search: str = None,
    platform: str = None,
    type_filter: str = None,
    sort: str = "desc",
    date_range: str = "all",
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    csv_data = admin_controller.export_campaigns_csv(
        db, start_date, end_date, search, platform, type_filter, sort, date_range
    )
    
    s_date = start_date or "filtered"
    e_date = end_date or "export"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=campaigns_{s_date}_to_{e_date}.csv"
        }
    )

@router.get("/market-reports", response_model=PaginatedMarketReportAdminResponse)
def get_market_reports_paginated(
    page: int = 1,
    limit: int = 5,
    search: str = None,
    sort: str = "desc",
    date_range: str = "all",
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.get_market_reports_paginated(db, page, limit, search, sort, date_range)

@router.delete("/market-reports/{campaign_id}")
def delete_market_report(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.delete_market_report(db, campaign_id)

@router.get("/market-reports/export")
def export_market_reports(
    start_date: str = None,
    end_date: str = None,
    search: str = None,
    sort: str = "desc",
    date_range: str = "all",
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    csv_data = admin_controller.export_market_reports_csv(
        db, start_date, end_date, search, sort, date_range
    )
    
    s_date = start_date or "filtered"
    e_date = end_date or "export"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=market_reports_{s_date}_to_{e_date}.csv"
        }
    )

@router.get("/configs")
def configs(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.get_system_configs(db)

@router.put("/configs")
def update_config(
    config_data: SystemConfigUpdate, 
    db: Session = Depends(get_db), 
    current_admin=Depends(get_current_admin)
):
    admin_controller.check_access(current_admin)
    return admin_controller.update_system_config(db, config_data)
