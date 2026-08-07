import os
import io
import requests
import json
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def generate_product_campaign_image(
    category: str,
    style: str,
    colors: list,
    audience: str,
    marketing_style: str,
    image_url: str,
    
    goal: str,
    platform: str,
    campaign_type: str, 
    user_prompt: str,
    system_prompt: str,
    slogan: str,
    subtext: str
) -> bytes:
    """
    Ürün analizi ve kampanya parametrelerini alıp orijinal görseli 
    referans kullanarak gpt-image-2 ile yeni bir görsel üretir.
    """

    if not slogan:
        slogan = ""
    if not subtext:
        subtext = ""

    # DALL-E çok uzun yazılarda çuvalladığı için maksimum 4-5 kelimeyle sınırla
    slogan_words = slogan.split()
    if len(slogan_words) > 5:
        slogan = " ".join(slogan_words[:4])

    size = "1024x1792" if campaign_type.lower() == "story" else "1024x1024"

   
    prompt_text = f"""
    Create a highly aesthetic marketing image for {platform}. 
    The product is a {category}. 
    Style: {style}. 
    Marketing vibe: {marketing_style}. 
    Incorporate the following text EXACTLY as written in an artistic, bold, and readable typography integrated into the design: 
    "{slogan}"
    "{subtext}"
    The image should look like a high-end commercial advertisement.
    Reference Image URL to base the design on: {image_url}
    """
    
    
    if user_prompt:
        prompt_text += f"\n\nAdditional User Instruction:\n{user_prompt}"

    if system_prompt:
        prompt_text += f"\n\nSystem Constraints / Rules:\n{system_prompt}"

    try:
        r = requests.get(image_url)
        r.raise_for_status()
        
        image_file = io.BytesIO(r.content)
        image_file.name = "reference.png"

        response = client.images.edit(
            model="gpt-image-2",
            image=image_file,
            prompt=prompt_text,
            size=size,
            n=1,
        )
        
        image_data = response.data[0]
        
        if image_data.url:
            img_bytes = requests.get(image_data.url).content
            return img_bytes
        elif hasattr(image_data, 'b64_json') and image_data.b64_json:
            import base64
            img_bytes = base64.b64decode(image_data.b64_json)
            return img_bytes
        else:
            raise Exception("API geçerli bir URL veya base64 verisi döndürmedi!")

    except Exception as e:
        print(f"Görsel üretimi sırasında hata oluştu: {e}")
        raise Exception(f"OpenAI Hatası: {str(e)}")
