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
    competitor_data: list,
    image_insights: dict = None
) -> dict:
    image_info = ""
    if image_insights:
        visual_matches = image_insights.get("visualMatches", [])
        titles = [m.get("title") for m in visual_matches[:3] if m.get("title")]
        if titles:
            image_info = f"\n    Ayrıca, ürün görselinden elde edilen benzer pazar eşleşmeleri şunlardır: {', '.join(titles)}\n    Bu veriyi pazarlama stratejisi ve ürün isimlendirmede göz önünde bulundur."

    prompt = f"""
    Sen uzman bir e-ticaret ve pazar analistisin. 
    
    Marka Adımız: {brand_name}
    Marka Açıklamamız: {brand_desc}
    
    Bizim satacağımız ürünün tam marka ve modeli şudur: '{search_query}'.
    (Kullanıcının sisteme girdiği isim '{product_name}' olsa da asıl satılacak spesifik ürün modeli '{search_query}' şeklindedir).
    {image_info}
    
    Bu ürün modeli ('{search_query}') için pazardaki satıcı verilerini elde ettik:
    
    {json.dumps(competitor_data, ensure_ascii=False, indent=2)}
    
    ÖNEMLİ KURALLAR VE MANTIK (LÜTFEN BUNLARA HARFİYEN UY):
    1. KESİN FİLTRELEME: Listedeki veriler arasında farklı modeller, çok daha ucuz aksesuarlar (skatez, grip tape vb.) veya kılıflar olabilir. FİYAT ANALİZİ YAPARKEN SADECE BİREBİR AYNI MODEL OLAN '{search_query}' ÜRÜNLERİNİ DİKKATE AL. Diğer tüm alakasız veya farklı fiyat bandındaki ürünleri analizden SİL.
    2. FİYAT STRATEJİSİ: Yukarıda filtrelediğin, BİREBİR AYNI ürünü satan geçerli platformların ve satıcıların fiyatlarını karşılaştır (Örn: Amazon'da şu kadar, Trendyol'da bu kadar). Bu gerçekçi fiyatlara dayanarak markamız için net ve rekabetçi bir satış fiyatı öner. (Aksesuar fiyatlarını yanlışlıkla ortalamaya eklersen tüm analiz çöker, buna çok dikkat et!)
    3. REKABET ORTAMI: Sadece '{search_query}' ürününü satan rakiplerin durumunu değerlendir ve pazarın bu ürün özelindeki yapısından bahset.
    
    Lütfen bu kurallara uygun olarak Türkçe, net ve stratejik bir rapor sun.
    Raporun içeriği şu başlıkları içermeli:
    1. Fiyatlandırma Stratejisi (Birebir aynı ürün diğer satıcılarda hangi fiyatlara satılıyor? Biz hangi fiyattan satmalıyız?)
    2. Rekabet Ortamı (Aynı ürünü satan satıcılar/platformlar arasındaki rekabet durumu nedir?)
    3. Pazarlama ve Farklılaşma Tavsiyesi (Bu ürünü pazarlarken hangi özellikleri öne çıkarmalı, diğer satıcılardan nasıl ayrışmalıyız?)
    
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

def refine_search_query_with_image_insights(product_name: str, original_query: str, image_insights: dict) -> dict:
    """
    Görsel araması (Lens API vb.) sonuçlarını analiz ederek, en doğru ürün adı/modelini 
    (Shopping araması için) çıkarır.
    """
    visual_matches = image_insights.get("visualMatches", [])
    if not visual_matches:
        return {
            "refined_query": original_query,
            "cost": 0.0,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
            "cached_tokens": 0
        }
        
    titles = [match.get("title") for match in visual_matches[:5] if match.get("title")]
    titles_str = ", ".join(titles)
    
    prompt = f"""
    Sen bir e-ticaret arama uzmanısın. Kullanıcının sisteme girdiği ürün adı: '{product_name}'.
    Bu ürünün görselini Google Lens ile arattık ve şu potansiyel eşleşmeleri bulduk:
    {titles_str}
    
    Lütfen Google Alışveriş'te (Google Shopping) aratmak için en spesifik, temiz ve tam ürün marka-model adını çıkar.
    KESİNLİKLE "beyaz fare", "gaming mouse", "oyuncu koltuğu" gibi genel kategori isimleri KULLANMA.
    Sadece kesin ürün marka ve modelini düz metin olarak döndür. (Örn: "Logitech G Pro X Superlight Kablosuz Beyaz")
    Hiçbir ekstra açıklama yapma.
    """
    
    model = "gpt-4o-mini" 
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=50
        )
        
        refined_query = response.choices[0].message.content.strip()
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
            "refined_query": refined_query,
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "cached_tokens": cached_tokens,
            "cost": cost
        }
    except Exception as e:
        print(f"Sorgu İyileştirme Hatası: {e}")
        return {
            "refined_query": original_query,
            "cost": 0.0,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
            "cached_tokens": 0
        }
