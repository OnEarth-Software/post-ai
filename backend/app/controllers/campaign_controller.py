from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.campaign import Campaign
from app.models.product_analyze import ProductAnalyze
from app.models.user import User
from app.schemas.campaign_schema import CampaignTextGenerateRequest, CampaignTextGenerateResponse, CampaignCreateRequest, CampaignResponse
from app.services.ai.generate_campaign_text import generate_product_campaing_text
from app.core.config import settings
from app.models.api_expense import ApiExpense

INPUT_PRICE_PER_1M = 0.15
OUTPUT_PRICE_PER_1M = 0.60
def generate_campaign_text(
    db: Session,
    request: CampaignTextGenerateRequest,
    current_user: User
) -> CampaignTextGenerateResponse:

    # Sadece AI'den metin üret
    ai_result = generate_product_campaing_text(request.model_dump())
    
    p_tokens = ai_result.get("prompt_tokens", 0)
    c_tokens = ai_result.get("completion_tokens", 0)
    t_tokens = ai_result.get("total_tokens", 0)
    
    input_cost = (p_tokens / 1_000_000) * INPUT_PRICE_PER_1M
    output_cost = (c_tokens / 1_000_000) * OUTPUT_PRICE_PER_1M
    total_cost = input_cost + output_cost

    text_generate_cost = ApiExpense(
        user_id= current_user.id,
        service_type= "TEXT_GENERATION",
        tokens_used=t_tokens,
        prompt_tokens=p_tokens,
        completion_tokens=c_tokens,
        cost=total_cost
    )
    db.add(text_generate_cost)
    db.commit()



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
    unlinked_text_expense = db.query(ApiExpense).filter(
        ApiExpense.user_id == current_user.id,
        ApiExpense.service_type == "TEXT_GENERATION",
        ApiExpense.related_entity_id == None
    ).order_by(ApiExpense.created_at.desc()).first()

    if unlinked_text_expense:
        unlinked_text_expense.related_entity_id = str(new_campaign.id)
        db.commit() 
    
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
