# Admin Panel: Ürünler (Products) Sayfası Entegrasyonu

Bu belge, Admin Panel > Products sayfasının mock verilerden arındırılarak, veritabanına bağlı gerçek yapıya dönüştürülmesini anlatır.

## 1. Backend API (Veri Bağlantısı)
- **Endpoint:** GET /admin/products
- **Özellikler:** Sayfalama (pagination), Arama (search), Sıralama (sort), Tarih Aralığı (date_range).
- **Birleştirilen Veriler:**
  - **Product** tablosu ana veri olarak çekildi.
  - **User** tablosu JOIN edilerek kullanıcı bilgileri alındı.
  - **ProductAnalyze** tablosu kontrol edilerek analiz durumu (Analyzed/Pending) getirildi.
  - **ApiExpense** tablosundan ürün bazlı harcanan token ve maliyet toplamı (Tokens Spent, Cost) çekildi.
- **Güvenlik:** Sadece admin yetkililerinin girebilmesi için check_access middleware'i kullanıldı.
- **Silme İşlemi:** DELETE /admin/products/{id} rotası eklendi. Ürün silindiğinde, bağlı olan tüm ApiExpense ve ProductAnalyze kayıtları da otomatik temizleniyor.

## 2. Frontend Entegrasyonu
- **Server Component (page.tsx):** Backend API'sinden SSR olarak verileri güvenli şekilde çeker.
- **Client Component (ProductsClient.tsx):** Etkileşimli arayüzü sunar.
- **Tasarım:** Campaigns sayfasındaki şık menüler (backdrop blur) ve arama algoritmaları (150ms debounce) buraya da entegre edildi.
- **Detay Gör (View Details):** Modern bir modal üzerinden ürünün adı, durumu, harcanan token ve maliyeti, yükleyen kullanıcı bilgileri sunuldu.
- **Silme (Delete):** Warning temalı güvenli bir silme onay penceresi tasarlandı.