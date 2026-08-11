from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.asset_schema import AssetResponse
from app.controllers import asset_controller

router = APIRouter()

@router.get("/", response_model=List[AssetResponse])
def get_user_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all generated campaign assets (images) for the logged in user.
    """
    return asset_controller.get_assets_by_user(db, current_user)

@router.delete("/{asset_id}")
def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific asset and its associated storage file.
    """
    return asset_controller.delete_asset(db, asset_id, current_user)
