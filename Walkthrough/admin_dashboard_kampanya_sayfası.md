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




Admin Panel: Kampanyalar (Campaigns) Sayfası Entegrasyonu

Bu belge, Admin Panel > Campaigns sayfasının statik mock (sahte) verilerden arındırılarak, veritabanına bağlı gerçek ve dinamik bir yapıya dönüştürülmesi aşamalarını detaylandırmaktadır.

NOTE

Bu sayfa, kullanıcıların yapay zeka ile oluşturduğu kampanyaları yöneticinin incelemesi, filtrelemesi ve gerektiğinde silebilmesi için tasarlanmıştır.

1. Backend API (Veri Bağlantısı)

Yönetici paneli için yeni bir backend rotası ve denetleyici fonksiyonu geliştirildi.

Endpoint
GET /admin/campaigns

Gelişmiş Filtreleme

Endpoint aşağıdaki filtreleme ve sıralama parametrelerini destekleyecek şekilde geliştirildi:

search — Arama
platform — Platform filtresi
type_filter — Format türü filtresi
date_range — Tarih aralığı filtresi
sort — Sıralama
Güvenlik

Yalnızca admin rolüne sahip kullanıcıların endpoint'e erişebilmesi için check_access kontrolü eklendi.

İlişkili Veriler

Campaign üzerinden Product ve User tablolarına JOIN yapılarak aşağıdaki bilgiler tek bir sorguda getiriliyor:

Kullanıcı adı
Kullanıcı soyadı
Kullanıcı avatarı
Ürün bilgileri
Kampanya bilgileri

Bu sayede frontend tarafında gerekli kullanıcı ve ürün bilgilerine ayrıca sorgu gönderilmesine gerek kalmıyor.

2. Frontend Entegrasyonu & Tasarım İyileştirmeleri

Sayfanın eski statik yapısı kaldırılarak Next.js Server-Side Rendering (SSR) özelliklerinden faydalanan dinamik bir yapıya geçirildi.

Tablo ve Veri Gösterimi

Kampanyaların oluşturulan nihai görselleri CampaignResult.image_url üzerinden tabloda gösteriliyor.

Tabloya aşağıdaki yeni bilgiler eklendi:

Campaign görseli
Campaign bilgileri
User bilgileri
Platform
Format
Tokens Spent
Cost
Oluşturulma tarihi
İşlem menüsü

Tokens Spent ve Cost alanları şu an için tasarım altyapısı olarak hazırlandı. İlerleyen aşamada Premium/Pro planlarına göre gerçek token maliyet hesaplamaları bu alanlara entegre edilecek.

İngilizce Arayüz

İngilizce arayüz standardına uygun olarak:

Tablo başlıkları
Butonlar
Filtre seçenekleri
Modal başlıkları
Yönlendirme metinleri
Empty state mesajları

tamamen İngilizce olacak şekilde düzenlendi.

Pagination

Pagination sistemi eklendi.

Her sayfada maksimum 5 kampanya gösterilecek şekilde yapılandırıldı.

3. Dinamik Filtreler
Gerçek Zamanlı Arama

Arama kutusuna girilen aşağıdaki bilgiler üzerinden sunucu taraflı filtreleme yapılabiliyor:

Goal
Slogan
Kullanıcı adı

Arama işlemi 150ms debounce algoritması ile çalışıyor.

Bu sayede kullanıcı her karakter girdiğinde gereksiz API çağrılarının önüne geçilirken, arama sonuçlarının hızlı şekilde güncellenmesi sağlandı.

Daha önce yaşanan "yazıyorum ama çok geç geliyor" hissi bu yapı sayesinde giderildi.

Filtreler Menüsü

Modern bir filtre menüsü eklendi.

Menü içerisinde:

Platform
Format
Sorting

seçenekleri bulunuyor.

Menü tasarımında backdropFilter kullanılarak blur efektli modern bir görünüm sağlandı.

Tarih Aralığı

Kullanıcıların kampanyaları hızlı şekilde filtreleyebilmesi için hazır tarih aralıkları eklendi:

Last 7 Days
Last 1 Month
Last 6 Months
vb.

Bu filtreler sayesinde belirli zaman aralıklarında oluşturulan kampanyalar kolayca listelenebiliyor.

4. Modern Modallar & 3 Nokta Menüsü

Daha önce düzgün çalışmayan 3 nokta (...) işlem menüsü, z-index ve overlay problemleri giderilerek yeniden tasarlandı.

Menü üzerinden iki temel işlem gerçekleştirilebiliyor:

View Details
Delete Campaign
4.1 View Details

Campaign detaylarını göstermek için modern bir detay modalı geliştirildi.

Modal içerisinde iki kolonlu grid yapısı kullanılarak bilgilerin daha okunabilir şekilde sunulması sağlandı.

Gösterilen bilgiler arasında:

Campaign bilgileri
User bilgileri
Product bilgileri
Platform
Format
Goal
Slogan
Token bilgileri
Cost
User Prompt
System Prompt

bulunuyor.

Prompt Görünümü

User Prompt ve System Prompt alanları, kod bloklarını andıran özel kutular içerisinde gösteriliyor.

Monospace font kullanılarak prompt içeriklerinin okunabilirliği artırıldı.

4.2 Delete Campaign

Campaign silme işlemi için özel bir confirmation modal geliştirildi.

Modal içerisinde:

Warning teması
Kırmızı renk paleti
Belirgin delete ikonu
Açıklayıcı uyarı metni
Cancel butonu
Delete butonu

kullanılarak işlemin geri döndürülemez olduğu açık şekilde belirtiliyor.

Silme işlemi başarılı olduğunda:

router.refresh()


kullanılarak tablo anında güncelleniyor.

Böylece kullanıcı sayfayı manuel olarak yenilemek zorunda kalmadan silinen campaign'in listeden kaldırıldığını görebiliyor.

5. Sonraki Adımlar
Premium / Pro Token Maliyetleri

Premium ve Pro planlarına göre token maliyet hesaplamalarının aktif edilmesi planlanıyor.

Gerekli frontend ve backend alanları şimdiden hazırlandığı için ilerleyen aşamada gerçek maliyet hesaplama sisteminin entegre edilmesi kolaylaştırıldı.

Platform Bazlı Görsel Üretim Limitleri

Platform bazlı görsel üretim limitlerinin devreye alınması planlanıyor.

Bu yapı ile ilerleyen aşamada:

Platform bazlı limitler
Plan bazlı limitler
Kullanıcı bazlı kullanım kontrolü
Token tüketimi
Görsel üretim kotası

gibi özelliklerin yönetilmesi hedefleniyor.

Sonuç

Admin Panel > Campaigns sayfası, statik mock verilerden tamamen arındırılarak gerçek backend ve veritabanı bağlantısına sahip dinamik bir yapıya dönüştürüldü.

Yapılan geliştirmeler ile:

Gerçek campaign verileri gösteriliyor.
Admin yetkilendirmesi uygulanıyor.
Gelişmiş arama ve filtreleme destekleniyor.
Pagination kullanılıyor.
Campaign görselleri dinamik olarak yükleniyor.
User ve Product ilişkileri backend üzerinden getiriliyor.
Campaign detayları modern bir modal içerisinde görüntülenebiliyor.
Campaign silme işlemi güvenli bir confirmation modal üzerinden gerçekleştiriliyor.
Silme sonrası tablo otomatik olarak güncelleniyor.
Gelecekteki token maliyeti ve platform limitleri için gerekli altyapı hazırlanmış durumda.