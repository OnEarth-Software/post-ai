import uuid
import requests
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.campaign import Campaign
from app.models.campaign_result import CampaignResult
from app.schemas.campaign_result_schema import CampaignImageGenerateRequest, CampaignImageGenerateResponse
from app.services.ai.generate_campaign_image import generate_product_campaign_image
from app.services.storage.supabase_client import get_supabase_client

def generate_and_save_campaign_image(
    db: Session, 
    request: CampaignImageGenerateRequest, 
    current_user: User
) -> CampaignImageGenerateResponse:
    
    campaign = db.query(Campaign).filter(Campaign.id == request.campaign_id).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanya bulunamadı.")
    
    analyze = campaign.product_analyze
    if not analyze:
        raise HTTPException(status_code=404, detail="Ürün analizi bulunamadı.")
        
    product = campaign.product
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")

    try:
        img_bytes = generate_product_campaign_image(
            category=analyze.category,
            style=analyze.style,
            colors=analyze.colors,
            audience=analyze.audience,
            marketing_style=analyze.marketing_style,
            image_url=product.image_url,
            
            goal=campaign.goal,
            platform=campaign.platform,
            campaign_type=campaign.type,
            user_prompt=campaign.user_prompt,
            system_prompt=campaign.system_prompt,
            slogan=campaign.slogan,
            subtext=campaign.subtext
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    if not img_bytes:
        raise HTTPException(status_code=500, detail="Görsel üretilirken bir hata oluştu.")

    # Üretilen görseli Supabase'e yükleme
    try:
        supabase = get_supabase_client()
        unique_filename = f"campaign_{campaign.id}_{uuid.uuid4()}.png"

        # Mevcut product-images bucket'ına (veya campaigns-images varsa oraya) yüklüyoruz
        supabase.storage.from_("product-images").upload(
            path=unique_filename,
            file=img_bytes,
            file_options={"content-type": "image/png"}
        )
        final_url = supabase.storage.from_("product-images").get_public_url(unique_filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase'e görsel yüklenirken hata oluştu: {e}")

    new_result = CampaignResult(
        campaign_id=campaign.id,
        image_url=final_url
    )
    
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    
    return CampaignImageGenerateResponse(
        campaign_id=new_result.campaign_id,
        image_url=new_result.image_url
    )
