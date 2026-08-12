from fastapi import APIRouter, Depends
from typing import Any

from app.core.deps import get_current_admin
from app.models.user import User
from app.controllers import admin_controller

router = APIRouter()

@router.get("/check-access")
def check_admin_access(
    current_admin: User = Depends(get_current_admin)
) -> Any:
    """
    Check if the current user has admin access.
    """
    return admin_controller.check_access(current_admin=current_admin)
