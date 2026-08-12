# Kullanıcı Yönetimi Güncellemeleri ve Abonelik (Plan) Mimarisi

Bu belgede uygulamanın Admin paneli altındaki Kullanıcı Yönetimi (`/admin/users`) sekmesinde yapılan son geliştirmeler ve geleceğe yönelik kurulan "Plan (Abonelik) - Limit" mimarisi açıklanmaktadır.

## 1. Yeni Eklenen Özellikler

- **Gelişmiş Kullanıcı Silme Modalı (İngilizce):** Admin sayfasında kullanıcıyı silmek istediğinizde çıkan basit tarayıcı onayı (window.confirm) kaldırılarak, sistemin tasarım diline uygun şık bir Modal (onay penceresi) oluşturuldu. Modal metinleri uygulamanın İngilizce dil yapısına uygun hale getirildi. 
- **Pasif Hesap Kontrolü:** Kullanıcının hesabı yönetici tarafından pasife (`Inactive`) alındığında, kullanıcının sisteme giriş yapması (Login) tamamen engellendi. Mevcut oturumu olan bir pasif kullanıcı da API istekleri sırasında `403 Forbidden` (Hesabınız pasif duruma alınmıştır) hatası ile engellenerek sistem dışına çıkarılır.

## 2. Plan (Abonelik) ve Limit Mimarisi (Geleceğe Yatırım)

Platformda ileride kullanılması planlanan "Stripe ile ödemeli üyelik" sistemi için altyapı şimdiden hazırlandı.

### Mimarinin Çalışma Mantığı:
1. **İki Ayrı Limit Tutma Yeri:** Limit bilgileri (`design_limit`, `product_limit`) hem `plans` (Plan/Abonelik Paketleri) tablosunda hem de `users` (Kullanıcılar) tablosunda tutulur. 
2. **Kopyalama Mantığı:** Bir kullanıcı standart olarak bir plana dahil olduğunda, o planın sahip olduğu limitler kopyalanarak kullanıcının kendi limit kolonlarına yazılır. (Örn: Pro planın 100 limiti varsa, müşterinin limiti de 100 olur.)
3. **Esneklik ve Ekstra Limit (Bonus):** Limitlerin doğrudan kullanıcı tablosunda da tutulmasının en büyük faydası **esneklik** sağlamasıdır. Örneğin, "Pro" planda olan bir müşteriye, admin olarak inisiyatif alıp plan standartını değiştirmeden "+50 tasarım hakkı" (toplam 150) verebilirsiniz.

### Admin Panelinde Limit Düzenleme Süreci
- Admin panelindeki profil düzenleme formunda, bir kullanıcının planı değiştirilirse, backend (sunucu) otomatik olarak yeni planın standart limitlerini o kullanıcıya atar.
- Fakat Admin aynı anda form üzerinden limitleri elle düzenlerse, sistem Admin'in yazdığı özel limiti baz alır. Bu sayede manuel müdahale (bonus tanımlama) yetkisi her zaman sistem otomasyonundan üstün tutulur.

## 3. Yapılan Veritabanı Değişiklikleri
- `plans` tablosuna `design_limit` (varsayılan: 5) ve `product_limit` (varsayılan: 5) alanları `Alembic Migration` kullanılarak eklendi ve mevcut veritabanı başarıyla güncellendi.
- Backend kodlarında (`admin_controller.py`) plan değişikliklerini yakalayıp limitleri senkronize eden mantık inşa edildi.
