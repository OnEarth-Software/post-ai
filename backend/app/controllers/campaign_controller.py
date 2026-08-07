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
        slogan=ai_result["slogan"],
        generated_text=ai_result["generated_text"]
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
        generated_text=request.generated_text
    )
    
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    
    return new_campaign
