Admin Panel: Kampanyalar (Campaigns) Sayfası Entegrasyonu
Bu belge, Admin Panel > Campaigns sayfasının statik mock (sahte) verilerden arındırılarak, veritabanına bağlı gerçek ve dinamik bir yapıya dönüştürülmesi aşamalarını detaylandırmaktadır.

NOTE

Bu sayfa, kullanıcıların yapay zeka ile oluşturduğu kampanyaları yöneticinin incelemesi, filtrelemesi ve gerektiğinde silebilmesi için tasarlanmıştır.

1. Backend API (Veri Bağlantısı)
Yönetici paneli için yeni bir backend rotası ve denetleyici fonksiyonu geliştirildi.

Endpoint: GET /admin/campaigns
Gelişmiş Filtreleme: Arama çubuğu (search), platform (platform), format türü (type_filter), tarih aralığı (date_range) ve sıralama (sort) parametreleri eklendi.
Güvenlik: Yalnızca yönetici yetkisine (admin rolü) sahip kullanıcıların erişimini sağlamak için check_access kontrolü eklendi.
İlişkiler: Kampanyalar (Campaign) üzerinden Product ve User tablolarına JOIN yapılarak kullanıcı ad/soyad, avatar gibi bilgiler tek bir sorguda getirildi.
2. Frontend Entegrasyonu & Tasarım İyileştirmeleri
Sayfanın eski statik yapısı, Next.js'in Server-Side Rendering (SSR) özelliklerinden faydalanacak şekilde yeniden yazıldı.

Tablo ve Veri Gösterimi
CampaignResult.image_url kullanılarak her kampanyanın oluşturulan nihai görseli tabloda listelendi.
Harcanan Token (Tokens Spent) ve Maliyet bilgileri tabloya eklendi. (Gelecek yapılandırmalar için tasarım yer tutucu olarak güçlendirildi.)
İngilizce arayüz tercihlerine uygun olarak tablo başlıkları, butonlar ve yönlendirme yazıları tamamen İngilizce'ye çevrildi.
Sayfalama (Pagination) sayesinde bir sayfada maksimum 5 kampanya gösterilmesi sağlandı.
Dinamik Filtreler
Gerçek Zamanlı Arama: Arama kutusuna yazılan Hedef (Goal), Slogan veya Kullanıcı Adı verileri 150ms gecikmeli bir debounce algoritmasıyla anında sunucudan filtreleniyor. Eskiden yaşanan "yazıyorum ama çok geç geliyor" hissi ortadan kaldırıldı.
Filtreler Açılır Menüsü: Platform, Format ve Sıralama seçeneklerini barındıran şık bir menü (backdropFilter ile blur destekli) eklendi.
Tarih Aralığı: "Son 7 Gün, 1 Ay, 6 Ay..." gibi hızlı tarih seçim filtreleri eklendi.
Modern Modallar (3 Nokta Menüsü)
Eskiden bozuk olan "3 nokta" menüsü, z-index ve overlay sorunları giderilerek yeniden tasarlandı. Menü içinden ulaşılabilen iki adet modal tamamen yenilendi:

View Details (Kampanya Detayları):
İki kolonlu ızgara yapısı kullanılarak daha okunabilir hale getirildi.
Kullanıcı ve Sistem Prompt'ları kod blokları (monospace font) gibi özel vurgulu kutular içine alındı.
Delete Campaign (Kampanya Silme):
Sistemin bütünlüğüne uyan uyarı kırmızı renkleri (warning theming) ve belirgin ikonlarla donatılmış bir onay penceresi geliştirildi.
Silme işlemi başarılı olduğunda tablo router.refresh() ile anında güncellenir.
Sonraki Adımlar
Premium/Pro Planlarına göre token maliyet hesaplamalarının aktif edilmesi (şu anki altyapısı hazır).
Platform bazlı görsel üretim limitlerinin devreye girmesi.
