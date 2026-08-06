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

image_url = "https://iuiuuxyobsnuykfgkunl.supabase.co/storage/v1/object/public/product-images/60d78c32-7f40-48f4-8d86-670b19e11499.png"

prompt = """
{ 
"category": "mug", 
"style": "modern", 
"colors": ["Green", "white"], 
"audience": "adults", 
"marketing_style": "practical", 
"goal": "Ürün Pazarlaması", 
"platform": "instagram", 
"type": "story", 
"user_prompt": "Termosun dayanıklığını belirten bir tasarım istiyorum", 
"system_prompt": "json içindeki goal kısmındaki amaca göre içerik yazıları olucak. Logo, Sosyal medya vb. gibi içerikleri kullanma" 
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