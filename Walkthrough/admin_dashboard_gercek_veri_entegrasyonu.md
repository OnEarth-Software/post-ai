# Admin Dashboard Gerçek Veri Entegrasyonu

Bu belge, Admin Paneli Dashboard sayfasındaki mock (sahte) verilerin, veritabanından çekilen gerçek istatistiklerle değiştirilmesini kapsayan geliştirmeleri özetlemektedir.

## 1. Backend (FastAPI) Geliştirmeleri

Admin paneline veri sağlamak amacıyla `admin_controller.py` içerisine yeni bir istatistik fonksiyonu eklendi ve bu fonksiyon `routers/admin.py` üzerinden dışarı açıldı.

- **Genel İstatistikler:**
  - Veritabanından toplam kullanıcı sayısı (`total_users`) ve üretilen toplam tasarım sayısı (`total_campaigns`) çekildi.
  - Önceki 30 gün ile son 30 gün kıyaslanarak, kullanıcı ve tasarım büyüme/küçülme oranları hesaplandı (`users_change_percentage`, `campaigns_change_percentage`).

- **Günlük Tasarım Üretimi (Çubuk Grafik Verisi):**
  - Son 7 gün dinamik olarak hesaplandı.
  - Her bir gün için veritabanındaki `Campaign` tablosundan kaç adet tasarım üretildiği sayılarak (`GROUP BY`), `daily_campaigns` adında bir veri seti oluşturuldu.

- **En Aktif Müşteriler:**
  - `User`, `Product` ve `Campaign` tabloları `JOIN` edilerek, kullanıcıların bugüne kadar ürettiği toplam tasarım sayıları hesaplandı.
  - Tasarım sayılarına göre büyükten küçüğe sıralanarak en aktif 5 kullanıcı (`active_users`) listelendi.

## 2. Frontend (Next.js) Geliştirmeleri

`/admin/dashboard` sayfası bir Server Component haline getirilerek sunucu tarafında veri çekecek şekilde yapılandırıldı.

- **Gerçek Veri Bağlantısı:**
  - API'den dönen gerçek toplam kullanıcı, üretilen tasarım sayıları arayüze entegre edildi.
  - İstek üzerine, henüz hazır olmayan **Harcanan Token** ve **Toplam Gelir** kartları eski tasarımlarıyla bırakıldı.

- **Dinamik Yüzdelik Artış/Azalış Oranları:**
  - Büyüme göstergeleri backend'den gelen oranlara göre renklendirildi. Artış varsa yeşil yukarı ok (↗), azalış varsa kırmızı aşağı ok (↘) gösterecek şekilde UI mantığı kuruldu.

- **Dinamik Çubuk Grafiği:**
  - "Günlük Tasarım Üretimi" grafiği statik yapıdan kurtarıldı.
  - En yüksek tasarım sayısına göre grafiğin Y ekseni (sol taraf) otomatik olarak ölçeklenir hale getirildi. 
  - Çubukların boyu ve renk yoğunluğu, o gün üretilen tasarım sayısının maksimum değere oranına göre dinamik olarak hesaplandı.

- **Kullanıcı Avatarları:**
  - En aktif müşteriler listesinde mock resimler yerine `ui-avatars` kullanılarak kullanıcıların isim ve soyisim baş harflerine göre dinamik, renkli profil fotoğrafları üretildi.
