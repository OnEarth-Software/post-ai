Assets Sistemi ve Product Silme Davranışı
Amaç

Products sayfasından bir ürün silindiğinde, o ürüne bağlı Campaign görsellerinin Supabase Storage'dan silinmesini istemiyoruz.

Şu anki sistemde Product ile Campaign arasında foreign key ilişkisi olduğu için Product silindiğinde ilgili Campaign kayıtları ve Campaign görselleri de siliniyor.

Yeni sistemde Campaign görsellerinin Product yaşam döngüsünden bağımsız olması gerekiyor.

Mevcut Problem

Şu anda Product silindiğinde:

Product DB kaydı siliniyor.
Product'a ait görsel Supabase Storage'dan siliniyor.
Product'a bağlı Campaign DB kayıtları siliniyor.
Campaign'lere ait görseller de Supabase Storage'dan siliniyor.

Buradaki 4. maddeyi değiştirmek istiyoruz.

Yeni Yapı

Yeni bir Assets sayfası oluşturulacak.

Assets sayfasının amacı, Campaign'lerde oluşturulan görselleri saklamak ve Product silinse bile bu görsellere erişmeye devam edebilmek.

Önemli kural

Product silinmesi, Campaign görsellerinin Storage'dan silinmesine neden olmamalıdır.

Product Silindiğinde Yeni Davranış

Bir Product silindiğinde:

DB
Product kaydı silinecek.
Product'a bağlı Campaign kayıtları silinecek.
Campaign görsellerini temsil eden Asset kayıtları silinmeyecek.
Supabase Storage
Product'a ait görsel silinecek.
Campaign sırasında oluşturulan görseller silinmeyecek.

Campaign görselleri Storage'da kalmaya devam edecek.

Assets Tablosu

Yeni bir assets tablosu oluşturulacak.

İlk aşamada düşünülen alanlar:

Alan	Açıklama
id	Asset'in unique ID'si
image_url	Supabase Storage'da bulunan görselin URL/path bilgisi

Ancak implementasyona başlamadan önce şu konu değerlendirilmeli:

id ve image_url dışında asset'in hangi campaign'den geldiği, oluşturulma tarihi, asset tipi veya ileride ihtiyaç duyulabilecek başka metadata alanları gerekli mi?

Gerekiyorsa uygun alanlar eklenmeli.

Campaign Görseli Oluşturulduğunda

Campaign oluşturulurken oluşturulan görsel:

Supabase Storage'a kaydedilecek.
Görselin Storage'daki path/URL bilgisi assets tablosuna kaydedilecek.
Böylece Campaign DB kaydı daha sonra silinse bile görsel Asset olarak yaşamaya devam edecek.
Assets Sayfası

Assets sayfası assets tablosundan verileri çekecek.

Örneğin:

assets
├── id
├── user_id
└── image_url


Frontend bu bilgiler üzerinden Storage'daki Campaign görsellerini gösterecek.

Foreign Key / Cascade Konusu

Mevcut Product → Campaign ilişkisi ve ON DELETE CASCADE davranışı incelenmeli.

Amaç:

Product silinir
    ↓
Product DB kaydı silinir
    ↓
Campaign DB kaydı silinebilir
    ↓
Campaign görseli Storage'dan SİLİNMEZ
    ↓
Asset kaydı korunur
    ↓
Assets sayfasında görsel gösterilir


Assets kayıtlarının Product veya Campaign silinmesine bağlı olarak cascade ile silinmemesi gerekiyor.

Storage Silme Mantığı

Mevcut Product silme kodu incelenmeli.

Şu an Product silinirken muhtemelen ilişkili Campaign görsellerini de Storage'dan temizleyen bir logic bulunuyor.

Bu logic ayrıştırılmalı.

Yeni sistemde:

Product image → Product silindiğinde Storage'dan silinecek.
Campaign image → Campaign/Product silindiğinde Storage'dan silinmeyecek.
Campaign image → Assets tarafından yönetilecek.
Uygulama Öncesi Kontrol Listesi

Implementasyona başlamadan önce mevcut kod incelenerek aşağıdakiler tespit edilmeli:

Product silme işlemi nerede yapılıyor?
Product silinirken Campaign kayıtları nasıl siliniyor?
Campaign görsellerinin Storage path'leri nerede tutuluyor?
Campaign görsellerini Storage'dan silen backend/frontend logic nerede?
Product → Campaign foreign key ilişkisi nasıl tanımlanmış?
ON DELETE CASCADE hangi tablolarda kullanılıyor?
Campaign oluşturulurken görsel Storage'a nasıl yükleniyor?
Campaign görseli oluşturulduğunda assets tablosuna hangi noktada kayıt eklenmeli?
Assets tablosu için id ve image_url dışında hangi alanlar gerekli?
Beklenen Sonuç

Product silindiğinde yalnızca Product'a ait veriler ve Product görseli temizlenmeli.

Campaign görselleri ise Storage'da korunmalı ve assets tablosu üzerinden Assets sayfasında gösterilebilmelidir.

Social / Like Davranışı

Social tarafında Campaign'lere ait Like sistemi bulunmaktadır.

Like kayıtlarının Product silindiğinde korunmasına gerek yoktur.

Product silindiğinde:

Product silinir
    ↓
Campaign silinir
    ↓
Campaign'e bağlı Like kayıtları DB'den silinir


Like verileri Storage'da tutulmadığı için burada ekstra bir işlem gerekmemektedir.

Önemli Nokta

Campaign görseli ile Like verisi birbirinden ayrı düşünülmelidir:

Campaign görseli: Product silinse bile Supabase Storage'da kalacak ve Assets üzerinden gösterilecek.
Like kaydı: Campaign/Product silindiğinde DB'den silinecek.

Mevcut Campaign → Like foreign key ve ON DELETE CASCADE yapısı incelenerek Like kayıtlarının Campaign silindiğinde otomatik olarak silinmesi sağlanmalıdır.

Implementasyona başlamadan önce mevcut proje yapısı incelenmeli ve yukarıdaki maddeler doğrulanmalıdır. Bu MD'deki gereksinimler doğrulanmadan kod değişikliğine başlanmamalıdır.