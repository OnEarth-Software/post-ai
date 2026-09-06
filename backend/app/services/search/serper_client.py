import os
import requests

def search_google_shopping(
    query: str
):
    url = "https://google.serper.dev/shopping"

    payload = {
        "q": query,
        "gl": "tr",
        "hl": "tr"
    }

    headers = {
        'X-API-KEY':os.getenv("SERPER_API_KEY"),
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        data = response.json()

        shopping_result = data.get("shopping", [])

        filtered_results = []
        for item in shopping_result[:10]:
            filtered_results.append({
                "title": item.get("title"),
                "price": item.get("price"),
                "source": item.get("source"),
                "rating": item.get("rating"),
                "ratingCount": item.get("ratingCount"),
                "imageUrl": item.get("imageUrl")
            })

        return filtered_results
    
    except Exception as e:
        print(f"Serper API Hatası: {e}")
        return []