import os
import requests
from app.services.search.base_provider import BaseSearchProvider

class SerperSearchProvider(BaseSearchProvider):
    def get_shopping_results(self, query: str) -> list:
        url = "https://google.serper.dev/shopping"
        payload = {
            "q": query,
            "gl": "tr",
            "hl": "tr"
        }
        headers = {
            'X-API-KEY': os.getenv("SERPER_API_KEY"),
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
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
            print(f"Serper API Shopping Error: {e}")
            return []

    def get_image_insights(self, image_url: str) -> dict:
        url = "https://google.serper.dev/lens"
        payload = {
            "url": image_url,
            "gl": "tr",
            "hl": "tr"
        }
        headers = {
            'X-API-KEY': os.getenv("SERPER_API_KEY"),
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Serper API Lens Error: {e}")
            return {}

# Geriye dönük uyumluluk için, eğer bir yerlerde eski fonksiyon import edilmişse
def search_google_shopping(query: str):
    provider = SerperSearchProvider()
    return provider.get_shopping_results(query)