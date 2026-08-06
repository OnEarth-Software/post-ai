import os
import io
import base64
from pathlib import Path

import requests
from dotenv import load_dotenv
from openai import OpenAI

# .env yükle
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Supabase public/signed URL
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

r = requests.get(image_url)
r.raise_for_status()

# Dosya adı verilmesi önemli
image_file = io.BytesIO(r.content)
image_file.name = "reference.png"

print("OpenAI Image Edit isteği gönderiliyor...")

result = client.images.edit(
    model="gpt-image-2",
    image=image_file,
    prompt=prompt,
    size="1024x1536",
)

# çıktı klasörü
output_dir = Path("backend/test_image")
output_dir.mkdir(parents=True, exist_ok=True)

output_path = output_dir / "output.png"

image_bytes = base64.b64decode(result.data[0].b64_json)

with open(output_path, "wb") as f:
    f.write(image_bytes)

print("Kaydedildi:", output_path.resolve())