import uuid
import requests
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.campaign import Campaign
from app.models.campaign_result import CampaignResult
from app.schemas.campaign_result_schema import CampaignImageGenerateRequest, CampaignImageGenerateResponse, SocialFeedItemResponse
from app.services.ai.generate_campaign_image import generate_product_campaign_image
from app.services.storage.supabase_client import get_supabase_client
from app.models.product import Product

def generate_and_save_campaign_image(
    db: Session, 
    request: CampaignImageGenerateRequest, 
    current_user: User
) -> CampaignImageGenerateResponse:

    if not current_user:
        raise HTTPException(
            status_code=404,
            detail="Bu özelliği kullanmanız için giriş yapmalısınız."
        )
    
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
        supabase.storage.from_("campaign-images").upload(
            path=unique_filename,
            file=img_bytes,
            file_options={"content-type": "image/png"}
        )
        final_url = supabase.storage.from_("campaign-images").get_public_url(unique_filename)
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


def toggle_social_status(
    db: Session,
    result_id: str,
    is_public: bool,
    current_user: User
):

    result = db.query(CampaignResult).join(Campaign).join(Product).filter(
        CampaignResult.id == result_id,
        Product.user_id == current_user.id
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="Kampanya sonucu bulunamadı veya yetkiniz yok.")

    result.is_public = is_public
    db.commit()
    db.refresh(result)

    return {
        "message": "Durum güncellendi", 
        "is_public": result.is_public
    }

def get_social_feed(
    db: Session
):

    results = (
        db.query(CampaignResult, Campaign, User)
        .join(Campaign, CampaignResult.campaign_id == Campaign.id)
        .join(Product, Campaign.product_id == Product.id)
        .join(User, Product.user_id == User.id)
        .filter(CampaignResult.is_public == True)
        .order_by(CampaignResult.created_at.desc())
        .all()
    )
    
    feed = []
    for cam_res, cam, user in results:
        feed.append(SocialFeedItemResponse(
            id=cam_res.id,
            image_url=cam_res.image_url,
            user_name=f"{user.name} {user.surname}",
            product_name=cam.product.name if cam.product else "İsimsiz Ürün",
            created_at=cam_res.created_at,
            campaign_goal=cam.goal,
            campaign_type=cam.type
        ))
        
    return feed