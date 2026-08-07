from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.database.connection import get_db
from app.core.deps import get_current_user
from app.schemas.campaign_schema import CampaignTextGenerateRequest, CampaignTextGenerateResponse
from app.controllers.campaign_controller import create_campaign_text

router = APIRouter()

@router.post("/generate-text", response_model=CampaignTextGenerateResponse)
def generate_campaign_text_endpoint(
    request: CampaignTextGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sadece gelen JSON verisine göre AI ile kampanya metni üretir ve geri döner.
    Veritabanına kayıt işlemi yapar (İş mantığı Controller üzerinden yürütülür).
    """
    return create_campaign_text(db=db, request=request, current_user=current_user)
