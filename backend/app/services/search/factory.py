import os
from app.services.search.base_provider import BaseSearchProvider
from app.services.search.serper_client import SerperSearchProvider

def get_search_provider() -> BaseSearchProvider:
    """
    Çevresel değişkenlere (ENV) bakarak uygun arama sağlayıcısını döner.
    Gelecekte farklı sağlayıcılar eklendiğinde bu metod güncellenebilir.
    """
    provider_name = os.getenv("SEARCH_PROVIDER", "serper").lower()
    
    if provider_name == "serper":
        return SerperSearchProvider()
    
    # Varsayılan olarak serper döndür
    return SerperSearchProvider()
