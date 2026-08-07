from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.campaign import Campaign
from app.models.product_analyze import ProductAnalyze
from app.models.user import User
from app.schemas.campaign_schema import CampaignTextGenerateRequest, CampaignTextGenerateResponse
from app.services.ai.generate_campaign_text import generate_product_campaing_text
from app.core.config import settings

def create_campaign_text(db: Session, request: CampaignTextGenerateRequest, current_user: User) -> CampaignTextGenerateResponse:
    # 1. ProductAnalyze kaydını bul (en son analizi alıyoruz)
    product_analyze = db.query(ProductAnalyze).filter(
        ProductAnalyze.product_id == request.product_id
    ).order_by(ProductAnalyze.created_at.desc()).first()

    if not product_analyze:
        raise HTTPException(status_code=404, detail="Product analysis not found for this product.")

    # 2. Gelen pydantic modelini dictionary'e çevirip yapay zeka servisine yolluyoruz
    ai_result = generate_product_campaing_text(request.model_dump())
    
    # 3. Campaign tablosuna kaydet
    new_campaign = Campaign(
        product_id=request.product_id,
        product_analyze_id=product_analyze.id,
        goal=request.campaign_info.goal,
        platform=request.campaign_info.platform,
        type=request.campaign_info.type,
        user_prompt=request.campaign_info.user_prompt,
        system_prompt=settings.SYSTEM_PROMPT,
        generated_text=ai_result["generated_text"]
    )
    
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    
    return CampaignTextGenerateResponse(
        slogan=ai_result["slogan"],
        generated_text=ai_result["generated_text"]
    )
