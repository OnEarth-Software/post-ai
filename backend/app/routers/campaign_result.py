import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.campaign_schema import CampaignResultBase
from app.schemas.campaign_result_schema import (
    CampaignImageGenerateRequest, 
    CampaignImageGenerateResponse,
    CampaignResultSocialToggleRequest
)
from app.controllers.campaign_result_controller import (
    generate_and_save_campaign_image,
    toggle_social_status,
    get_social_feed
)

router = APIRouter()

@router.post("/generate-image", response_model=CampaignImageGenerateResponse)
def generate_campaign_image_endpoint(
    request: CampaignImageGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI kullanarak kampanya için görsel üretir ve sonucu CampaignResult tablosuna kaydeder.
    """
    return generate_and_save_campaign_image(db=db, request=request, current_user=current_user)


@router.get("/social/feed")
def get_social_feed_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Herkese açık (is_public=True) olan sosyal akışı getirir.
    """
    return get_social_feed(db=db, current_user=current_user)


    
@router.patch("/{result_id}/social")
def toggle_social_status_endpoint(
    result_id: str,
    request: CampaignResultSocialToggleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının görselini sosyal akışta paylaşıp/kaldırmasını sağlar.
    """
    return toggle_social_status(db=db, result_id=result_id, is_public=request.is_public, current_user=current_user)