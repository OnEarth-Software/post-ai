import os
import requests
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

image_url = "https://iuiuuxyobsnuykfgkunl.supabase.co/storage/v1/object/public/product-images/f3f06575-2fda-4298-8ddd-668092883e64.jpg"

prompt = """
{
  "category": "Cap",
  "style": "Casual",
  "colors": ["Black", "Beige", "White", "Red"],
  "audience": "Unisex 18-35",
  "marketing_style": "Modern",
  "goal": "Marka Tanınırlığı",
  "platform": "instagram",
  "type": "story",
  "user_prompt": "Referans olarak sağlanan şapkayı hiçbir şekilde değiştirme. Şapkanın logosunu, renklerini, dikişlerini, file yapısını, formunu ve tüm detaylarını birebir koru. Şapka, genç ve şık giyimli bir kişinin başında doğal şekilde sergilensin. Modern şehir atmosferi, sıcak gün batımı ışığı, premium lifestyle hissi, sinematik arka plan, hafif alan derinliği ve profesyonel reklam fotoğrafçılığı kullanılmalı. Şapka sahnenin ana odak noktası olmalı. Gerçekçi gölgeler, yüksek detay, lüks moda kampanyası kalitesi ve Instagram Story (9:16) kompozisyonunda oluştur.",
  "system_prompt": "Referans görseldeki ürünü yeniden tasarlama veya yeniden çizme. Ürünün logosunu, renklerini, dokusunu, dikişlerini, oranlarını ve tüm görsel özelliklerini aynen koru. Sadece ürünün bulunduğu ortamı, modeli, ışığı ve reklam kompozisyonunu oluştur. Goal alanına göre kısa reklam metni üret. Logo, sosyal medya kullanıcı adı, QR kod, web sitesi, telefon numarası, fiyat etiketi, indirim etiketi veya filigran ekleme."
}
"""

print("Referans görsel indiriliyor...")

response = requests.get(image_url)
response.raise_for_status()

print("Gemini isteği gönderiliyor...")

result = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[
        prompt,
        types.Part.from_bytes(
            data=response.content,
            mime_type="image/jpeg",
        ),
    ],
)

output_dir = Path("backend/test_image")
output_dir.mkdir(parents=True, exist_ok=True)

saved = False

for part in result.candidates[0].content.parts:
    if getattr(part, "inline_data", None):
        output_path = output_dir / "output.png"

        with open(output_path, "wb") as f:
            f.write(part.inline_data.data)

        print("Kaydedildi:", output_path.resolve())
        saved = True
        break

if not saved:
    print(result.text)