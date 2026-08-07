# Walkthrough: Kampanya Oluşturma ve Veritabanı Kayıt İşlemleri

Bu döküman, kampanya metni oluşturma sayfasının backend entegrasyonu ve veritabanı kayıt işlemlerini içermektedir.

## Yapılan Değişiklikler

### 1. Backend: Schema ve Konfigürasyon
- **`app/schemas/campaign_schema.py`**: `/generate-text` endpointine gelen isteğin (`CampaignTextGenerateRequest`) içerisine `product_id` alanı eklendi.
- **`app/core/config.py`**: AI promptunu esnek bir şekilde yönetebilmek adına `Settings` sınıfına `SYSTEM_PROMPT` eklendi. Varsayılan olarak *"json içindeki goal kısmındaki amaca göre içerik yazıları olucak. Logo, Sosyal medya vb. gibi içerikleri kullanma"* değeri atandı ve `.env` üzerinden ezilebilir hale getirildi.

### 2. Backend: Campaign Router
- **`app/routers/campaign.py`**: 
  - Frontend üzerinden gelen `product_id` parametresi kullanılarak, ilgili ürüne ait son analiz bilgisi (`ProductAnalyze` tablosundan) çekildi. 
  - Yapay zeka metni üretildikten sonra; hedef kitle, platform, format, kullanıcı talimatı, sistem komutu, ürün ve analiz ilişkileri de harmanlanarak `Campaign` modeli oluşturuldu. 
  - Oluşturulan kampanya bilgileri PostgreSQL veritabanındaki `campaigns` tablosuna başarıyla kaydedildi.

### 3. Frontend: Tasarım ve API İstek Güncellemeleri
- **`app/dashboard/products/[id]/generate-campaign/page.tsx`**:
  - API isteği esnasında gönderilen `payloadToBackend` içerisine mevcut URL'den alınan `product_id` dahil edildi.
  - UI düzenlemeleri yapıldı:
    - Buton metni *"Kampanya Yazısını Oluştur"* yerine **"Oluştur"** olarak güncellendi.
    - AI metni oluşturulduğunda kullanıcıya doğrudan kampanya yazısının gösterilmesi engellendi (gizlendi).
    - Metin oluşturulduktan sonra devam niteliğinde çıkan buton **"Tasarım Oluştur"** olarak değiştirildi ve sonraki adımlara hazırlık yapıldı.

## Sonuç
Kullanıcı, arayüzden hedeflerini seçtikten sonra "Oluştur" butonuna tıkladığında, arka planda AI hem ilgili içeriği hazırlamakta hem de bu hazırlanan içerik ürün ve analiz bilgileriyle birlikte veritabanına otomatik olarak kaydedilmektedir. Ekranda ise bu metin görünmeden direkt "Tasarım Oluştur" seçeneği belirmektedir.
