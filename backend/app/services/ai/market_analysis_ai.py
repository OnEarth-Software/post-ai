import json
import os
from openai import OpenAI
from app.services.pricing.openai_pricing import calculate_openai_cost

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_market_report(
    product_name: str, 
    brand_name: str, 
    brand_desc: str, 
    search_query: str, 
    competitor_data: list
) -> dict:
    prompt = f"""
    Sen uzman bir e-ticaret ve pazar analistisin. 
    
    Marka Adımız: {brand_name}
    Marka Açıklamamız: {brand_desc}
    
    Biz bu marka kimliği altında '{product_name}' isminde yeni bir ürün satıyoruz.
    Bu ürün için Google Alışveriş'te (Türkiye) '{search_query}' araması yaptık ve aşağıdaki rakip verilerini elde ettik:
    
    {json.dumps(competitor_data, ensure_ascii=False, indent=2)}
    
    Lütfen bize markamızın vizyonunu ve hedef kitlesini göz önünde bulundurarak Türkçe olarak net ve stratejik bir rakip analizi raporu sun. 
    Raporun içeriği şu başlıkları içermeli:
    1. Fiyatlandırma Stratejisi (Pazardaki ortalama fiyat nedir, marka değerimize göre biz hangi fiyattan pazara girmeliyiz?)
    2. Rekabet Ortamı (Öne çıkan rakip markalar kimler, onların zayıf yönlerini nasıl avantaja çevirebiliriz?)
    3. Ürün İsimlendirme ve Pazarlama Tavsiyesi (Rakipler hangi kelimeleri vurgulamış, biz nasıl farklılaşabiliriz?)
    
    Lütfen yanıtını doğrudan metin (Markdown) formatında ver. Başka hiçbir gereksiz açıklama yapma.
    """
    
    model = "gpt-4o-mini" 
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=800
        )
        
        report_text = response.choices[0].message.content
        
        
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
        
        
        return {
            "report": report_text,
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "cached_tokens": cached_tokens,
            "cost": cost
        }
        
    except Exception as e:
        print(f"Pazar Raporu Oluşturma Hatası: {e}")
        return {
            "report": "Rapor oluşturulamadı.",
            "cost": 0.0,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
            "cached_tokens": 0
        }
