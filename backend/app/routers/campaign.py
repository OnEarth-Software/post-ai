from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.database.connection import get_db
from app.core.deps import get_current_user
from app.schemas.campaign_schema import CampaignTextGenerateRequest, CampaignTextGenerateResponse, CampaignCreateRequest, CampaignResponse
from app.controllers.campaign_controller import generate_campaign_text, create_campaign

router = APIRouter()

@router.post("/generate-text", response_model=CampaignTextGenerateResponse)
def generate_campaign_text_endpoint(
    request: CampaignTextGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Sadece gelen JSON verisine göre AI ile kampanya metni üretir ve geri döner.
    Veritabanına kayıt işlemi yapmaz.
    """
    return generate_campaign_text(request=request)


@router.post("/create", response_model=CampaignResponse)
def create_campaign_endpoint(
    request: CampaignCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kampanyayı veritabanına kaydeder.
    """
    return create_campaign(db=db, request=request, current_user=current_user)
