from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.core.deps import get_current_user

from app.schemas.campaign_result_schema import CampaignImageGenerateRequest, CampaignImageGenerateResponse
from app.controllers.campaign_result_controller import generate_and_save_campaign_image

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
