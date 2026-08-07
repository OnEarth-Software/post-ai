from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.campaign import Campaign
from app.models.product_analyze import ProductAnalyze
from app.models.user import User
from app.schemas.campaign_schema import CampaignTextGenerateRequest, CampaignTextGenerateResponse, CampaignCreateRequest, CampaignResponse
from app.services.ai.generate_campaign_text import generate_product_campaing_text
from app.core.config import settings


def generate_campaign_text(request: CampaignTextGenerateRequest) -> CampaignTextGenerateResponse:
    # Sadece AI'den metin üret
    ai_result = generate_product_campaing_text(request.model_dump())
    
    return CampaignTextGenerateResponse(
        slogan=ai_result.get("slogan", ""),
        subtext=ai_result.get("subtext", "")
    )

def create_campaign(db: Session, request: CampaignCreateRequest, current_user: User) -> Campaign:
    # 1. ProductAnalyze kaydını bul (en son analizi alıyoruz)
    product_analyze = db.query(ProductAnalyze).filter(
        ProductAnalyze.product_id == request.product_id
    ).order_by(ProductAnalyze.created_at.desc()).first()

    if not product_analyze:
        raise HTTPException(status_code=404, detail="Product analysis not found for this product.")

    # 2. Campaign tablosuna kaydet
    new_campaign = Campaign(
        product_id=request.product_id,
        product_analyze_id=product_analyze.id,
        goal=request.goal,
        platform=request.platform,
        type=request.type,
        user_prompt=request.user_prompt,
        system_prompt=settings.SYSTEM_PROMPT,
        slogan=request.slogan,
        subtext=request.subtext
    )
    
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    
    return new_campaign


def get_user_campaigns(db: Session, current_user: User):
    """
    Kullanıcının ürünlerine ait olan tüm kampanyaları getirir.
    Ürün (Product) ve Kampanya Sonuçlarını (CampaignResult) eager load yapar.
    """
    from app.models.product import Product
    from sqlalchemy.orm import joinedload
    
    campaigns = db.query(Campaign).join(Product).filter(
        Product.user_id == current_user.id
    ).options(
        joinedload(Campaign.product),
        joinedload(Campaign.results)
    ).order_by(Campaign.created_at.desc()).all()
    
    return campaigns

def get_campaign_detail(db: Session, campaign_id: str, current_user: User):
    """
    Belirli bir kampanyanın detaylarını getirir (Ürün ve Sonuçlarla birlikte).
    """
    from app.models.product import Product
    from sqlalchemy.orm import joinedload
    
    campaign = db.query(Campaign).join(Product).filter(
        Campaign.id == campaign_id,
        Product.user_id == current_user.id
    ).options(
        joinedload(Campaign.product),
        joinedload(Campaign.results)
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanya bulunamadı veya erişim yetkiniz yok.")
        
    return campaign
