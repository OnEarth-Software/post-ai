from fastapi import APIRouter, Depends
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.campaign_schema import CampaignTextGenerateRequest, CampaignTextGenerateResponse
from app.services.ai.generate_campaign_text import generate_product_campaing_text

router = APIRouter()

@router.post("/generate-text", response_model=CampaignTextGenerateResponse)
def generate_campaign_text_endpoint(
    request: CampaignTextGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Sadece gelen JSON verisine göre AI ile kampanya metni üretir ve geri döner.
    Veritabanına kayıt işlemi yapmaz (Ekip arkadaşı tarafından eklenecek).
    """
    # Gelen pydantic modelini dictionary'e çevirip yapay zeka servisine yolluyoruz
    ai_result = generate_product_campaing_text(request.model_dump())
    
    return CampaignTextGenerateResponse(
        slogan=ai_result["slogan"],
        generated_text=ai_result["generated_text"]
    )
