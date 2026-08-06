from openai.types import model
import os
import sys
import json
from openai import OpenAI


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def generate_product_campaing_text(
    data: dict
) -> str:


    analysis_result = data.get("analysis_result", {})
    campaign_info = data.get("campaign_info", {})
    image_url = data.get("image_url")

    prompt_text = f"""
        Sen yaratıcı bir dijital pazarlama uzmanısın.
        Aşağıda ürünün yapay zeka analiz sonuçları, kullanıcının kampanya bilgileri ve ÜRÜNÜN FOTOĞRAFI yer alıyor.
        Lütfen fotoğrafa detaylıca bakarak ve analiz verilerini kullanarak; görsel üzerinde yer alacak kısa, vurucu ve dikkat çekici bir pazarlama yazısı (slogan/başlık) üret.
        
        Lütfen metinde herhangi bir indirim, fiyat veya kampanya oranı KULLANMA.
        Sadece pazarlama metnini döndür, ekstra hiçbir açıklama, başlık veya tırnak işareti kullanma.
        
        Ürün Analizi:
        {json.dumps(analysis_result, ensure_ascii=False)}
        
        Kampanya Bilgileri:
        {json.dumps(campaign_info, ensure_ascii=False)}
    """

    message_content = [
        {
            "type": "text", 
            "text": prompt_text
        }
    ]

    if image_url:
        message_content.append({
            "type": "image_url",
            "image_url": {"url": image_url}
        })

    try:
        response = client.chat.completions.create(
            model="gpt-4o", 
            messages=[
                {
                    "role": "user",
                    "content": message_content
                }
            ],
            max_tokens=150,
            temperature=0.7 
        )
        marketing_copy = response.choices[0].message.content.strip().strip('"')
        return marketing_copy

    except Exception as e:
        print(f"Pazarlama metni üretimi sırasında hata: {e}")
        return "Şıklığı Keşfet!"