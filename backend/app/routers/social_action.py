from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.social_action_schema import LikeToggleResponse, NotificationResponse
from app.controllers.social_action_controller import toggle_like, get_user_notifications, mark_notification_as_read

router = APIRouter()

@router.post("/campaign-results/{result_id}/like", response_model=LikeToggleResponse)
def toggle_like_endpoint(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return toggle_like(db=db, result_id=result_id, current_user=current_user)

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_notifications(db=db, current_user=current_user)

@router.post("/notifications/{notification_id}/read")
def read_notification_endpoint(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return mark_notification_as_read(db=db, notification_id=notification_id, current_user=current_user)
