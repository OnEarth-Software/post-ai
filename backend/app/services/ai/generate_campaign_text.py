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
        Sen deneyimli bir pazarlama metin yazarı ve marka iletişimi uzmanısın.

        Aşağıda ürünün yapay zeka analiz sonuçları, kampanya bilgileri ve ürünün görseli bulunuyor.
        Ürünün görselini dikkatlice incele ve analiz verilerini birlikte değerlendirerek profesyonel bir pazarlama metni oluştur.

        Kurallar:
        - Ürünün öne çıkan özelliklerini ve sunduğu değeri vurgula.
        - Metin doğal, akıcı ve sosyal medyada etkileşim alacak tarzda olsun.
        - Gerekiyorsa ürünün tasarımını, malzemesini, kullanım alanını ve hedef kitlesini görselden çıkarım yaparak metne yansıt.
        - Fiyat, indirim, kampanya oranı veya "hemen satın al" gibi agresif satış ifadeleri kullanma.
        - Renklerden bahsederken HEX kodu kullanma; yalnızca doğal renk isimleri kullan.
        - Görselde kesin olarak görülmeyen özellikleri uydurma.
        - Marka adı analiz bilgilerinde veya görselde yer almıyorsa marka ismi üretme.

        ÖNEMLİ KURALLAR (Görsel Tasarımı İçin):
        - `slogan`: Görselin en dikkat çekici yerine büyük puntoyla yazılacak, maksimum 3-4 kelimelik çok vurucu bir başlık. (Örn: "ENERJİNİ ZAMANA YANSIT!")
        - `subtext`: Görselde sloganın altına daha küçük yazılacak, 1-2 cümlelik estetik ve tamamlayıcı bir tasarım yazısı. (Örn: "Sporun dinamizmi, tarzının imzası. Her anına eşlik eder.")

        Aşağıdaki JSON formatında cevap ver:

        {{
        "slogan": "Çok kısa ve vurucu slogan",
        "subtext": "1-2 cümlelik kısa tasarım yazısı"
        }}

        Sadece JSON döndür. Açıklama veya başka metin ekleme.

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
        subtext = parsed_json.get("subtext", "")
        
        return {
            "slogan": slogan,
            "subtext": subtext
        }
        
    except Exception as e:
        print(f"Pazarlama metni üretimi sırasında hata: {e}")
        return {
            "slogan": "Şıklığı Keşfet!",
            "subtext": ""
        }