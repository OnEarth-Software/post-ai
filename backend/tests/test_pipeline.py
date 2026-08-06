import os
import sys
import json
import requests
from dotenv import load_dotenv
from openai import OpenAI

# .env dosyasını app modüllerini import etmeden önce yüklemeliyiz!
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
load_dotenv(os.path.join(backend_dir, '.env'))

# Proje dizinini sys.path'e ekle, böylece app modüllerini import edebiliriz
sys.path.append(backend_dir)

from app.services.ai.product_detail_ai import analyze_product_image_with_ai

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def main():
    # 1. Image URL (Örnek bir görsel olarak kırmızı bir spor ayakkabı kullanıyoruz)
    image_url = "https://iuiuuxyobsnuykfgkunl.supabase.co/storage/v1/object/public/product-images/aac006f5-3d55-4e77-9bb8-44ede92da59e.png"
    print(f"--- ADIM 1: Ürün Görseli Analizi ---")
    print(f"Kullanılan URL: {image_url}")

    # 2. Mevcut analiz servisi ile ürünü analiz et
    try:
        analysis_result = analyze_product_image_with_ai(image_url)
        print("\nAnaliz Sonucu:")
        print(json.dumps(analysis_result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Analiz sırasında hata oluştu: {e}")
        return

    # 3. Kampanya bilgileri ve pazarlama yazısı üretimi (GPT-4o)
    print("\n--- ADIM 2: Kampanya Bilgileri & Pazarlama Yazısı Üretimi ---")
    campaign_info = {
        "platform": "Instagram",
        "target_audience": "Aktif yaşamı sevenler, sporseverler ve yeşilin enerjisini tarzına yansıtmak isteyenler",
        "objective": "Yeni nesil sportif saatin dinamik tarzını, şıklığını ve işlevselliğini öne çıkarmak"
    }
    
    print("Kampanya Bilgileri:")
    print(json.dumps(campaign_info, indent=2, ensure_ascii=False))

    prompt = f"""
    Sen yaratıcı bir pazarlama uzmanısın.
    Aşağıda ürünün analiz sonuçları ve kampanya bilgileri yer alıyor.
    Bu bilgilere dayanarak, görsel üzerinde yer alacak kısa, vurucu ve dikkat çekici bir pazarlama yazısı (slogan/başlık) üret.
    Lütfen metinde herhangi bir indirim, fiyat veya kampanya oranı KULLANMA, sadece dikkat çekici bir slogan üret.
    Sadece pazarlama metnini döndür, ekstra hiçbir açıklama veya tırnak işareti kullanma.
    
    Ürün Analizi: {json.dumps(analysis_result, ensure_ascii=False)}
    Kampanya Bilgileri: {json.dumps(campaign_info, ensure_ascii=False)}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        marketing_copy = response.choices[0].message.content.strip().strip('"')
        print(f"\nÜretilen Pazarlama Metni:\n>>> {marketing_copy} <<<")
    except Exception as e:
        print(f"Metin üretimi sırasında hata oluştu: {e}")
        return

    # 4. Görsel ve Metni Birleştirip Yeni Görsel Üretme
    print("\n--- ADIM 3: DALL-E İle Görsel Üretimi ---")
    dalle_prompt = f"""
    Create a highly aesthetic marketing image for {campaign_info['platform']}. 
    The product is a {analysis_result.get('category', 'sneakers/shoes')}. 
    Style: {analysis_result.get('style', 'modern and trendy')}. 
    Marketing vibe: {analysis_result.get('marketing_style', 'energetic and professional')}. 
    Incorporate the following text EXACTLY as written in an artistic, bold, and readable typography integrated into the design: "{marketing_copy}".
    The image should look like a high-end commercial advertisement.
    Reference Image URL to base the design on: {image_url}
    """
    
    print("Prompt hazırlandı, istek atılıyor...")

    try:
        import base64
        import io

        r = requests.get(image_url)
        r.raise_for_status()

        # Dosya adı verilmesi önemli
        image_file = io.BytesIO(r.content)
        image_file.name = "reference.png"


        # Görsel yükleyerek (Image-to-Image) istek atmak için OpenAI SDK'da
        # images.edit (veya create_variation) fonksiyonunu kullanmamız gerekiyor.
        # Çünkü images.generate 'image' parametresi almaz.
        image_response = client.images.edit(
            model="gpt-image-2",
            image=image_file,
            prompt=dalle_prompt,
            size="1024x1792",
            n=1
        )
        
        image_data = image_response.data[0]
        
        # 5. Görseli test_image klasörüne kaydetme
        print("\n--- ADIM 4: Görselin Kaydedilmesi ---")
        test_image_dir = os.path.join(backend_dir, 'test_image')
        os.makedirs(test_image_dir, exist_ok=True)
        save_path = os.path.join(test_image_dir, 'pipeline_result.png')

        if image_data.url:
            print(f"Üretilen Görsel URL'si: {image_data.url}")
            print(f"Görsel indiriliyor...")
            img_data_bytes = requests.get(image_data.url).content
            with open(save_path, 'wb') as handler:
                handler.write(img_data_bytes)
            print(f"Görsel başarıyla kaydedildi: {save_path}")
        elif hasattr(image_data, 'b64_json') and image_data.b64_json:
            print("API Base64 formatında görsel döndürdü, çözülüyor...")
            img_data_bytes = base64.b64decode(image_data.b64_json)
            with open(save_path, 'wb') as handler:
                handler.write(img_data_bytes)
            print(f"Görsel başarıyla kaydedildi: {save_path}")
        else:
            print("HATA: API geçerli bir URL veya base64 verisi döndürmedi!")
            print("API Yanıtı:", image_data)

    except Exception as e:
        print(f"Görsel üretimi veya kaydetme sırasında hata oluştu: {e}")

if __name__ == "__main__":
    main()
