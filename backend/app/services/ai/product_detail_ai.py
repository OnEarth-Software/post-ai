import json 
import os
from openai import OpenAI
from app.services.pricing.openai_pricing import calculate_openai_cost


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyze_product_image_with_ai(
    image_url: str
) -> dict:

    prompt = """
    Lütfen aşağıdaki ürün görselini analiz et ve sonucu YALNIZCA aşağıdaki JSON formatında döndür. 
    Başka hiçbir metin veya açıklama ekleme.
    Ayrıca bu ürünü Google Alışveriş'te (Google Shopping Türkiye) aratmak ve benzer rakip ürünleri bulmak için kullanılabilecek en uygun 1 adet Türkçe arama terimini 'search_query' alanına ekle.
    
    {
      "category": "string",
      "style": "string",
      "colors": ["string", "string"],
      "audience": "string",
      "marketing_style": "string",
      "search_query": "string"
    }
    """
    model = "gpt-4o-mini"

    response = client.chat.completions.create(
            model=model, # Vision (görsel) destekli model
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
    parsed = json.loads(result_text)

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
    

    parsed["model"] = model

    parsed["prompt_tokens"] = prompt_tokens
    parsed["completion_tokens"] = completion_tokens
    parsed["total_tokens"] = total_tokens
    parsed["cached_tokens"] = cached_tokens
    parsed["cost"] = cost

    return parsed