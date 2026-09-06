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
    image_insights: dict = None,
    analyze_data: dict = None,
    campaign_image_url: str = None
) -> dict:
    image_info = ""
    if image_insights:
        visual_matches = image_insights.get("visualMatches", [])
        titles = [m.get("title") for m in visual_matches[:3] if m.get("title")]
        if titles:
            image_info = f"\n    Ayrıca, ürün görselinden elde edilen benzer pazar eşleşmeleri şunlardır: {', '.join(titles)}\n    Bu veriyi pazarlama stratejisi ve ürün isimlendirmede göz önünde bulundur."

    analyze_info = ""
    if analyze_data:
        analyze_info = f"""
    Hedef Kitle: {analyze_data.get('audience', 'Belirtilmedi')}
    Kategori: {analyze_data.get('category', 'Belirtilmedi')}
    Pazarlama Tarzı: {analyze_data.get('marketing_style', 'Belirtilmedi')}
    """

    prompt = f"""
    Sen uzman bir e-ticaret, marka stratejisti ve pazar analistisin. 
    Aşağıda markamız, ürünümüz ve pazar durumuyla ilgili veriler yer almaktadır. Senden bu verileri kullanarak detaylı, profesyonel ve stratejik bir 'Rakip ve Pazar Analizi Raporu' oluşturmanı istiyorum.
    
    # GİRDİ VERİLERİ
    Marka Adı: {brand_name}
    Marka Açıklaması: {brand_desc}
    
    Asıl Satılacak Ürün / Model: '{search_query}' (Kullanıcı girişi: '{product_name}')
    {analyze_info}
    {image_info}
    
    Pazardaki Rakip Satıcı Verileri (Google Shopping):
    {json.dumps(competitor_data, ensure_ascii=False, indent=2)}
    
    # KURALLAR VE MANTIK:
    1. FİLTRELEME: Listedeki veriler arasında farklı modeller veya daha ucuz aksesuarlar olabilir. Fiyat analizi yaparken sadece birebir '{search_query}' olanları dikkate al.
    2. PROFESYONEL DİL: Raporu şık bir Markdown formatında, bir ajansın markaya sunduğu rapor profesyonelliğinde (başlıklar, listeler, kalın yazılar ile) hazırla.
    
    # RAPOR YAPISI (Lütfen bu başlıkları kullanarak Markdown formatında dön):
    
    ## 1. Yönetici Özeti
    Pazarın genel durumu, rekabet seviyesi ve markamız için en büyük fırsat/risk (4-5 cümle).
    
    ## 2. Genel Pazar Görünümü
    Sektörün mevcut trendleri ve fiyatlandırma eğilimleri.
    
    ## 3. Rekabet Yoğunluğu
    Pazardaki satıcıların sayısı ve fiyat dağılımına göre rekabetin seviyesi (Yüksek, Orta vb.).
    
    ## 4. Rakip Analizi
    Öne çıkan 2-3 rakip/satıcı için fiyat/teklif stratejisi ve markamıza karşı avantaj/dezavantajları.
    
    ## 5. Rakiplerin Ortak Stratejileri
    Satıcıların fiyatlandırma ve konumlandırmadaki ortak eğilimleri.
    
    ## 6. Rakiplerin Güçlü ve Zayıf Yönleri
    Pazardaki genel güçlü ve zayıf yönler.
    
    ## 7. Marka Konumlandırma Analizi
    Markamız pazarda nerede konumlanmalı?
    
    ## 8. Hedef Kitle Analizi
    Hedef kitle beklentileri ve problemleri.
    
    ## 9. Tüketici İçgörüleri (Consumer Insights)
    Tüketici satın alma motivasyonları.
    
    ## 10. Farklılaşma Fırsatları
    Rakiplerden nasıl ayrışabiliriz?
    
    ## 11. White Space Analysis
    Rakiplerin sahiplenmediği pazarlama alanları.
    
    ## 12. İçerik Fırsatları
    Kullanılabilecek içerik formatları.
    
    ## 13. Reklam Mesajı Önerileri
    Ana ve alternatif kanca/mesajlar.
    
    ## 14. CTA Önerileri
    En uygun Call-to-Action metinleri.
    
    ## 15. Kampanya Stratejisi
    Platform, ton ve genel strateji tavsiyesi.
    
    ## 16. A/B Test Önerileri
    Test edilecek varyasyonlar.
    
    ## 17. Önceliklendirilmiş Öneriler
    Aksiyonların öncelik sırası.
    
    ## 18. Sonuç
    Kapanış değerlendirmesi.
    """
    
    model = "gpt-4o-mini" 
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=3500
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
