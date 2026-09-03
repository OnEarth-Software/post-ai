import os
import json
from openai import OpenAI
from app.services.pricing.openai_pricing import calculate_openai_cost

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def generate_product_post_text(
    data: dict = None, 
    **kwargs
) -> dict:
    """
    Görsel postlar için sosyal medya açıklama metni (caption), 
    dikkat çekici giriş (hook), harekete geçirici mesaj (CTA) ve etiketler (hashtags) üretir.
    
    Hem dict (örn. request.model_dump()) hem de keyword argument olarak veri alabilir.
    """

    if data is None:
        data = {}

    payload = {
        **data,
        **kwargs
    }

    analysis_result = payload.get("analysis_result", {})

    campaign_info = payload.get("campaign_info", {})
    image_url = payload.get("image_url")
    slogan = payload.get("slogan") or campaign_info.get("slogan", "")
    subtext = payload.get("subtext") or campaign_info.get("subtext", "")
    platform = campaign_info.get("platform") or payload.get("platform", "Instagram")
    goal = campaign_info.get("goal") or payload.get("goal", "Etkileşim")
    user_prompt = campaign_info.get("user_prompt") or payload.get("user_prompt", "")
    campaign_type = campaign_info.get("type") or payload.get("type", "post")

    if campaign_type and campaign_type.lower() not in ["post", "feed", "görsel post", "gorsel_post", "gorsel"]:
        return {
            "caption": "",
            "hook": "",
            "body": "",
            "call_to_action": "",
            "hashtags": [],
            "model": "gpt-4o-mini",
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
            "cached_tokens": 0,
            "cost": 0.0,
            "skipped": True,
            "message": f"İçerik tipi '{campaign_type}' olduğu için post açıklama yazısı üretilmedi."
        }

    prompt_text = f"""
    Sen profesyonel bir sosyal medya yöneticisi ve dijital pazarlama metin yazarısın.
    
    Görevin:
    Aşağıda referans görseli, yapay zeka analiz verileri ve kampanya hedefleri verilen ürün için 
    {platform} platformuna uygun, yüksek etkileşim sağlayacak profesyonel bir post açıklama metni (caption) hazırlamak.
    Kurallar:
    - Referans görseldeki ürünün estetiğini, renklerini, tasarım detaylarını ve kullanım bağlamını dikkate al.
    - Metin akıcı, samimi ve sosyal medya dinamiklerine uygun olsun (uygun yerlerde zarif emojiler kullan).
    - Agresif "hemen satın al" ifadelerinden kaçın; merak ve arzu uyandır.
    - Eğer varsa belirlenen slogana ve tasarıma atıfta bulun.
    - Hashtag'ler Türkiye ve global pazara hitap eden, ürün ve sektörle doğrudan ilgili 5-8 popüler etiketten oluşsun.
    Aşağıdaki JSON formatında yanıt ver:
    {{
        "hook": "Kullanıcının akışta durmasını sağlayacak 1 cümlelik çok dikkat çekici giriş cümlesi",
        "body": "Ürünün değerini, hikayesini veya sunduğu konforu/faydayı anlatan 2-3 cümlelik ana metin",
        "call_to_action": "Etkileşim veya profile yönlendiren harekete geçirici mesaj (Örn: 'Sizin favoriniz hangisi? Yorumlarda buluşalım 👇')",
        "hashtags": ["#etiket1", "#etiket2", "#etiket3"],
        "caption": "Tüm bunların (hook + body + call_to_action + hashtags) birleştiği, kullanıcının kopyalayıp doğrudan paylaşabileceği eksiksiz post metni"
    }}
    YALNIZCA JSON döndür. Başka hiçbir açıklama ekleme.
    Ürün Analizi:
    {json.dumps(analysis_result, ensure_ascii=False)}
    Kampanya Bilgileri:
    {json.dumps(campaign_info, ensure_ascii=False)}
    Ek Bilgiler:
    - Hedef: {goal}
    - Platform: {platform}
    - Varsa Slogan: {slogan}
    - Varsa Tasarım Alt Metni: {subtext}
    - Kullanıcı Özel Notu: {user_prompt}
    """

    message_content = [
        {
            "type" : "text",
            "text" : prompt_text
        }
    ]

    if image_url:
        message_content.append({
            "type":"image_url",
            "image_url":{
                "url":image_url,
                "detail":"low"
            }
        })

    model = "gpt-4o-mini"
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": message_content
                }
            ],
            max_tokens=600,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        usage = response.usage
        prompt_tokens = usage.prompt_tokens or 0
        completion_tokens = usage.completion_tokens or 0
        total_tokens = usage.total_tokens or 0
        cached_tokens = 0
        if hasattr(usage, "prompt_tokens_details") and usage.prompt_tokens_details:
            details = usage.prompt_tokens_details
            if isinstance(details, dict):
                cached_tokens = details.get("cached_tokens", 0)
            else:
                cached_tokens = getattr(details, "cached_tokens", 0)
                
        cost = calculate_openai_cost(
            model=model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            cached_tokens=cached_tokens
        )
        raw_content = response.choices[0].message.content.strip()
        parsed_json = json.loads(raw_content)
        return {
            "caption": parsed_json.get("caption", ""),
            "hook": parsed_json.get("hook", ""),
            "body": parsed_json.get("body", ""),
            "call_to_action": parsed_json.get("call_to_action", ""),
            "hashtags": parsed_json.get("hashtags", []),
            # Kullanım ve Maliyet Bilgileri
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "cached_tokens": cached_tokens,
            "cost": cost
        }
    except Exception as e:
        print(f"Post açıklama metni üretimi sırasında hata: {e}")
        return {
            "caption": "Tarzınızı yansıtacak en özel detaylar sizlerle. Keşfetmek için profilimizi ziyaret edin!",
            "hook": "Zarafeti ve Şıklığı Keşfedin!",
            "body": "Özenle tasarlanan bu parça stilinize yepyeni bir soluk getirecek.",
            "call_to_action": "Detaylar profildeki linkte!",
            "hashtags": ["#yenisezon", "#stil", "#trend", "#kalite"],
            "model": model,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
            "cached_tokens": 0,
            "cost": 0.0,
            "error": str(e)
        }