import os
import io
import requests
import json
import base64
from openai import OpenAI

from app.services.pricing.openai_pricing import calculate_openai_cost


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


def generate_product_campaign_image(
    category: str,
    style: str,
    colors: list,
    audience: str,
    marketing_style: str,
    image_url: str,

    goal: str,
    platform: str,
    campaign_type: str,
    user_prompt: str,
    system_prompt: str,
    slogan: str,
    subtext: str,
    image_model: str = "gpt-image-2"
) -> dict:

    if not slogan:
        slogan = ""

    if not subtext:
        subtext = ""

    slogan_words = slogan.split()

    if len(slogan_words) > 5:
        slogan = " ".join(slogan_words[:4])

    size = (
        "1024x1536"
        if campaign_type.lower() == "story"
        else "1024x1024"
    )

    model = image_model

    prompt_data = {
        "category": category,
        "style": style,
        "colors": colors,
        "audience": audience,
        "marketing_style": marketing_style,
        "goal": goal,
        "platform": platform,
        "type": campaign_type,
        "user_prompt": user_prompt,
        "system_prompt": system_prompt,
        "slogan": slogan,
        "subtext": subtext
    }

    # PROMPT AYNI
    prompt_text = f"""
    Create a highly aesthetic marketing image based on the following configuration.

    Use the provided product image as the main reference.
    Preserve the product's important visual characteristics.

    Incorporate the 'slogan' and 'subtext' EXACTLY as written
    in an artistic, bold, and readable typography integrated
    into the design.

    The image should look like a high-end commercial advertisement.

    Configuration:
    {json.dumps(prompt_data, indent=2, ensure_ascii=False)}
    """

    try:
        r = requests.get(image_url, timeout=30)
        r.raise_for_status()

        image_file = io.BytesIO(r.content)
        image_file.name = "reference.png"

        response = client.images.edit(
            model=model,
            image=image_file,
            prompt=prompt_text,
            size=size,
            quality="high",
            n=1,
        )

        usage_data = {}

        if hasattr(response, "usage") and response.usage:

            usage = response.usage

            if hasattr(usage, "model_dump"):
                usage_data = usage.model_dump()

            elif hasattr(usage, "dict"):
                usage_data = usage.dict()

            elif isinstance(usage, dict):
                usage_data = usage

        input_tokens = usage_data.get(
            "input_tokens",
            0
        )

        output_tokens = usage_data.get(
            "output_tokens",
            0
        )

        cached_tokens = usage_data.get(
            "cached_tokens",
            0
        )

        image_cost = calculate_openai_cost(
            model=model,
            prompt_tokens=input_tokens,
            completion_tokens=output_tokens,
            cached_tokens=cached_tokens
        )

        image_data = response.data[0]

        if hasattr(image_data, "b64_json") and image_data.b64_json:

            img_bytes = base64.b64decode(
                image_data.b64_json
            )

        elif hasattr(image_data, "url") and image_data.url:

            img_response = requests.get(
                image_data.url,
                timeout=60
            )

            img_response.raise_for_status()

            img_bytes = img_response.content

        else:
            raise Exception(
                "API geçerli bir URL veya base64 verisi döndürmedi!"
            )

        return {
            "image_bytes": img_bytes,
            "model": model,
            "size": size,
            "usage": usage_data,
            "prompt_tokens": input_tokens,
            "completion_tokens": output_tokens,
            "cached_tokens": cached_tokens,
            "cost": image_cost
        }

    except Exception as e:

        print(
            f"Görsel üretimi sırasında hata oluştu: {e}"
        )

        raise Exception(
            f"OpenAI Hatası: {str(e)}"
        )