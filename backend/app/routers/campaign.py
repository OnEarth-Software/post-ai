from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.database.connection import get_db
from app.core.deps import get_current_user
from app.schemas.campaign_schema import (
    CampaignTextGenerateRequest, 
    CampaignTextGenerateResponse, 
    CampaignCreateRequest, 
    CampaignResponse, 
    CampaignListResponse, 
    CampaignDetailResponse,
    CampaignPostTextGenerateResponse 
)
from app.controllers.campaign_controller import (
    generate_campaign_text, 
    create_campaign, 
    get_user_campaigns, 
    get_campaign_detail,
    generate_campaign_post_text   
) 
from typing import List
from app.schemas.campaign_schema import CampaignPostTextGenerateResponse


router = APIRouter()

@router.post("/generate-text", response_model=CampaignTextGenerateResponse)
def generate_campaign_text_endpoint(
    request: CampaignTextGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sadece gelen JSON verisine göre AI ile kampanya metni üretir ve geri döner.
    Veritabanına kayıt işlemi yapmaz.
    """
    return generate_campaign_text(db=db, request=request, current_user=current_user)


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

@router.get("/", response_model=List[CampaignListResponse])
def get_campaigns_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kullanıcının oluşturduğu tüm kampanyaları listeler.
    """
    return get_user_campaigns(db=db, current_user=current_user)

@router.get("/{campaign_id}", response_model=CampaignDetailResponse)
def get_campaign_detail_endpoint(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Belirli bir kampanyanın detaylarını getirir.
    """
    return get_campaign_detail(db=db, campaign_id=campaign_id, current_user=current_user)


@router.post("/{campaign_id}/generate-post-text", response_model=CampaignPostTextGenerateResponse)
def generate_campaign_post_text_endpoint(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Belirli bir kampanya için AI ile pazarlama post açıklaması üretir ve campaigns tablosuna kaydeder.
    """
    return generate_campaign_post_text(db=db, campaign_id=campaign_id, current_user=current_user)