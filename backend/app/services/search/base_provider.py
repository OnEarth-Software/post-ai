from abc import ABC, abstractmethod

class BaseSearchProvider(ABC):
    @abstractmethod
    def get_shopping_results(self, query: str) -> list:
        """
        Gelen arama sorgusu için alışveriş (shopping) sonuçlarını döner.
        """
        pass

    @abstractmethod
    def get_image_insights(self, image_url: str) -> dict:
        """
        Görsel URL'i üzerinden görsel eşleşmeleri veya meta verilerini döner.
        """
        pass
