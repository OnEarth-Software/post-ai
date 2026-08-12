from fastapi import APIRouter, Depends
from typing import Any
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.core.deps import get_current_admin
from app.controllers import admin_controller
from app.schemas.admin_schema import DashboardStatsResponse

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
    return admin_controller.get_dashboard_stats(db)
