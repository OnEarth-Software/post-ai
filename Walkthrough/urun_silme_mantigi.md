# Ürün Silme Mantığı (Product Deletion Logic)

Şu anda sistemde bir ürün silindiğinde, o ürüne bağlı olan tüm veriler kalıcı olarak silinmektedir. Bu özellik ileride değiştirilmek istenirse diye bu dokümantasyon oluşturulmuştur.

## Mevcut Silme İşlemi Adımları:

1. **Bağlı Kampanyaların ve Sonuçların Silinmesi:**
   - Ürüne bağlı tüm `Campaign` (Kampanya) kayıtları sorgulanır.
   - Her bir kampanyaya ait `CampaignResult` (Kampanya Sonuçları - AI tarafından üretilen görseller vs.) silinir.
   - Eğer kampanya sonuçlarında görsel URL'si (`image_url`) varsa, bu dosya isimleri Supabase Storage'dan silinmek üzere bir listeye eklenir.

2. **Ürün Analizinin Silinmesi:**
   - Ürüne ait AI tarafından yapılan vizyon analizi (`ProductAnalyze` tablosu) veritabanından silinir.

3. **Ürünün Kendi Görselinin Silinmesi:**
   - Ürünün ana görsel URL'si (`image_url`) Supabase Storage'dan silinmek üzere silinecek dosyalar listesine eklenir.

4. **Supabase Storage'dan Toplu Silme:**
   - Hem ürünün kendi resmi hem de AI tarafından üretilen kampanya görselleri Supabase `product-images` bucket'ından tek seferde topluca silinir.

5. **Veritabanından Ürünün Silinmesi:**
   - Tüm bağlı veriler ve dosyalar temizlendikten sonra, asıl `Product` (Ürün) kaydı veritabanından kalıcı olarak silinir.

**Not:** Gelecekte bir ürün silindiğinde ona ait AI kampanya görsellerinin silinmemesi veya kampanyaların saklanmaya devam etmesi istenirse, `backend/app/controllers/product_controller.py` dosyasındaki `delete_product` fonksiyonu içindeki 1. adımda yer alan `Campaign` ve `CampaignResult` silme işlemlerinin kaldırılması gerekecektir.
