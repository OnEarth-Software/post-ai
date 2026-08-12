from typing import Any
from sqlalchemy.orm import Session
from app.models.user import User

def check_access(current_admin: User) -> Any:
    """
    Check if the current user has admin access.
    """
    return {
        "status": "ok", 
        "message": "Admin access verified", 
        "user_id": str(current_admin.id)
    }
