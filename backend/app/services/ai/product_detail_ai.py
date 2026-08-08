import json 
import os
from openai import OpenAI


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyze_product_image_with_ai(
    image_url: str
) -> dict:

    prompt = """
    Lütfen aşağıdaki ürün görselini analiz et ve sonucu YALNIZCA aşağıdaki JSON formatında döndür. 
    Başka hiçbir metin veya açıklama ekleme:
    {
      "category": "string",
      "style": "string",
      "colors": ["string", "string"],
      "audience": "string",
      "marketing_style": "string"
    }
    """


    response = client.chat.completions.create(
            model="gpt-4o-mini", # Vision (görsel) destekli model
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url,
                                "detail":"low"
                            },
                        },
                    ],
                }
            ],
            max_tokens=300,
            response_format={ "type": "json_object" } # Sadece JSON dönmesini zorunlu tutuyoruz
        )

    result_text = response.choices[0].message.content
    return json.loads(result_text)