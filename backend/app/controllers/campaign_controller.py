from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.campaign import Campaign
from app.models.product_analyze import ProductAnalyze
from app.models.user import User
from app.schemas.campaign_schema import CampaignTextGenerateRequest, CampaignTextGenerateResponse, CampaignCreateRequest, CampaignResponse
from app.services.ai.generate_campaign_text import generate_product_campaing_text
from app.core.config import settings
from app.models.api_expense import ApiExpense
from app.services.ai.generate_pots_text import generate_product_post_text
from app.schemas.campaign_schema import CampaignPostTextGenerateResponse
from app.models.product import Product
from app.services.search.factory import get_search_provider
from app.services.ai.market_analysis_ai import generate_market_report, refine_search_query_with_image_insights
from app.models.brand import Brand
import uuid
from app.services.pricing.credit_service import CreditService


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
    cached_toks = ai_result.get("cached_tokens", 0)
    total_cost = ai_result.get("cost", 0.0)
    model_used = ai_result.get("model", "gpt-4o-mini")
    text_generate_cost = ApiExpense(
        user_id=current_user.id,
        service_type="TEXT_GENERATION",
        model=model_used,
        tokens_used=t_tokens,
        prompt_tokens=p_tokens,
        completion_tokens=c_tokens,
        cached_tokens=cached_toks,
        cost=total_cost
    )
    db.add(text_generate_cost)
    
    db.commit()



    return CampaignTextGenerateResponse(
        slogan=ai_result.get("slogan", ""),
        subtext=ai_result.get("subtext", "")
    )

def create_campaign(
    db: Session, 
    request: CampaignCreateRequest, 
    current_user: User
) -> Campaign:

    CreditService.deduct_credits(
        db,
        current_user.id,
        CreditService.COST_CAMPAIGN_GENERATION
    )

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


def generate_campaign_post_text(
        db: Session,
        campaign_id: str,
        current_user: User
)->CampaignPostTextGenerateResponse:

    CreditService.deduct_credits(
        db, 
        current_user.id, 
        CreditService.COST_POST_TEXT_GENERATION
    )

    campaign = db.query(Campaign).join(Product).filter(
        Campaign.id == campaign_id,
        Product.user_id == current_user.id
    ).first()

    if not campaign:
        raise HTTPException(
            status_code=404, 
            detail="Kampanya bulunamadı veya erişim yetkiniz yok."
        )

    product = campaign.product
    analyze = campaign.product_analyze

    image_url = None
    if campaign.results and len(campaign.results) > 0:
        image_url = campaign.results[0].image_url
    elif product and product.image_url:
        image_url = product.image_url

    payload = {
        "analysis_result": {
            "category": analyze.category if analyze else "",
            "style": analyze.style if analyze else "",
            "colors": analyze.colors if analyze else [],
            "audience": analyze.audience if analyze else "",
            "marketing_style": analyze.marketing_style if analyze else ""
        },
        "campaign_info": {
            "goal": campaign.goal,
            "platform": campaign.platform,
            "type": campaign.type,
            "user_prompt": campaign.user_prompt or ""
        },
        "image_url": image_url,
        "slogan": campaign.slogan or "",
        "subtext": campaign.subtext or ""
    }

    ai_result = generate_product_post_text(payload)
    generated_caption = ai_result.get("caption", "")
    campaign.post_text = generated_caption

    p_tokens = ai_result.get("prompt_tokens", 0)
    c_tokens = ai_result.get("completion_tokens", 0)
    t_tokens = ai_result.get("total_tokens", 0)
    cached_toks = ai_result.get("cached_tokens", 0)
    total_cost = ai_result.get("cost", 0.0)
    model_used = ai_result.get("model", "gpt-4o-mini")
    if t_tokens > 0 or total_cost > 0:
        expense = ApiExpense(
            user_id=current_user.id,
            service_type="POST_TEXT_GENERATION",
            model=model_used,
            tokens_used=t_tokens,
            prompt_tokens=p_tokens,
            completion_tokens=c_tokens,
            cached_tokens=cached_toks,
            cost=total_cost,
            related_entity_id=str(campaign.id)
        )
        db.add(expense)
    db.commit()
    db.refresh(campaign)

    return CampaignPostTextGenerateResponse(
        campaign_id=campaign.id,
        post_text=campaign.post_text or "",
        hook=ai_result.get("hook", ""),
        body=ai_result.get("body", ""),
        call_to_action=ai_result.get("call_to_action", ""),
        hashtags=ai_result.get("hashtags", [])
    )

def generate_campaign_market_analysis(
    db: Session, 
    campaign_id: str, 
    current_user: User
):
    CreditService.deduct_credits(
        db, 
        current_user.id, 
        CreditService.COST_MARKET_ANALYSIS
    )

    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id
    ).first()

    if not campaign or campaign.product.user_id != current_user.id:
        raise HTTPException(
            status_code=404, 
            detail="Kampanya bulunamadı veya yetkiniz yok."
        )

    product = campaign.product
    analyze = campaign.product_analyze
    if not analyze or not analyze.search_query:
        raise HTTPException(
            status_code=400, 
            detail="Bu ürün için bir arama terimi bulunamadı."
        )

    brand = db.query(Brand).filter(Brand.id == product.brand_id).first() if product.brand_id else None
    brand_name = brand.name if brand else "Bilinmeyen Marka"
    brand_desc = brand.description if brand and brand.description else "Bu yeni ve heyecan verici bir marka."
    
    image_url = None
    if product and product.image_url:
        image_url = product.image_url
    

    provider = get_search_provider()
    image_insights = None
    refined_query = analyze.search_query
    refine_expense = None
    
    if image_url:
        image_insights = provider.get_image_insights(image_url)
        if image_insights:
            refine_result = refine_search_query_with_image_insights(product.name, analyze.search_query, image_insights)
            refined_query = refine_result.get("refined_query", analyze.search_query)
            
            if refine_result.get("total_tokens", 0) > 0:
                refine_expense = ApiExpense(
                    user_id=current_user.id,
                    service_type="QUERY_REFINEMENT",
                    model=refine_result.get("model", "gpt-4o-mini"),
                    tokens_used=refine_result.get("total_tokens", 0),
                    prompt_tokens=refine_result.get("prompt_tokens", 0),
                    completion_tokens=refine_result.get("completion_tokens", 0),
                    cached_tokens=refine_result.get("cached_tokens", 0),
                    cost=refine_result.get("cost", 0.0),
                    related_entity_id=str(campaign.id)
                )

    competitor_data = provider.get_shopping_results(product.name)
    if not competitor_data:
        raise HTTPException(status_code=500, detail="Google Alışveriş'te rakip bulunamadı veya Serper API hatası.")
        
    
    campaign_image_url = None
    if campaign.results and len(campaign.results) > 0:
        campaign_image_url = campaign.results[0].image_url

    analyze_data = None
    if analyze:
        analyze_data = {
            "category": analyze.category,
            "audience": analyze.audience,
            "marketing_style": analyze.marketing_style
        }

    ai_result = generate_market_report(
        product_name=product.name,
        brand_name=brand_name,
        brand_desc=brand_desc,
        search_query=refined_query,
        competitor_data=competitor_data,
        image_insights=image_insights,
        analyze_data=analyze_data,
        campaign_image_url=campaign_image_url
    )
    
    
    campaign.market_report = ai_result.get("report")
    db.commit()
    
   
    new_spending = ApiExpense(
        user_id=current_user.id,
        service_type="MARKET_ANALYSIS",
        model=ai_result.get("model", "gpt-4o-mini"),
        tokens_used=ai_result.get("total_tokens", 0),         
        prompt_tokens=ai_result.get("prompt_tokens", 0),       
        completion_tokens=ai_result.get("completion_tokens", 0),
        cached_tokens=ai_result.get("cached_tokens", 0),
        cost=ai_result.get("cost", 0.0),          
        related_entity_id=campaign.id
    )
    db.add(new_spending)
    if refine_expense:
        db.add(refine_expense)
    db.commit()
    
    return {"message": "Analiz başarıyla tamamlandı", "report": campaign.market_report}
