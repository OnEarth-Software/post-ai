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
        Lütfen fotoğrafa detaylıca bakarak ve analiz verilerini kullanarak harika bir pazarlama metni oluştur.
        
        Senden beklentim JSON formatında dönmen:
        1) "slogan": Çok vurucu, kısa bir ANA SLOGAN. (Görselin üzerine yazılacak olan budur)
        2) "description": Bu sloganı destekleyen, ürünü öne çıkaran 2-3 cümlelik akıcı bir AÇIKLAMA. İstersen ufak 2 3 madde'de verebilirsin.
        
        Lütfen metinde herhangi bir emoji, indirim, fiyat veya kampanya oranı KULLANMA.
        Eğer renklerden bahsedeceksen, KESİNLİKLE HEX kodu (#10b981 gibi) kullanma; bunun yerine rengin adını (örn: zümrüt yeşili, beyaz vb.) betimleyerek kullan.
        Sadece JSON objesi döndür. Ekstra hiçbir giriş/çıkış cümlesi kullanma.
        
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
            max_tokens=300,
            temperature=0.7,
            response_format={ "type": "json_object" }
        )
        
        raw_content = response.choices[0].message.content.strip()
        parsed_json = json.loads(raw_content)
        
        slogan = parsed_json.get("slogan", "Şıklığı Keşfet!")
        
        # Yapay zeka bazen 'description' yerine 'generated_text' anahtarını kullanabilir
        description = parsed_json.get("description", parsed_json.get("generated_text", ""))
        
        return {
            "slogan": slogan,
            "generated_text": f"{slogan}\n\n{description}"
        }

    except Exception as e:
        print(f"Pazarlama metni üretimi sırasında hata: {e}")
        return "Şıklığı Keşfet!"