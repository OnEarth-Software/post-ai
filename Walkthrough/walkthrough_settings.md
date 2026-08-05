# Dashboard Ayarları & Güvenlik Özellikleri

Bu doküman, Dashboard Ayarlar (Settings) sayfası için bugün geliştirilen tüm özellikleri özetlemektedir. Kullanıcı Profili Güncelleme, Şifre Yönetimi ve İki Aşamalı Doğrulama (2FA) özellikleri detaylandırılmıştır.

---

## Bölüm 1: Kullanıcı Profili ve E-posta Güncelleme

### 1. Backend Şema & Controller
- Profil güncelleme isteklerini (`name`, `surname`, `email`, ve `current_password`) yönetmek için `backend/app/schemas/user_schema.py` dosyasına `UserUpdate` Pydantic şeması eklendi.
- `backend/app/controllers/auth_controller.py` dosyasına `update_user` fonksiyonu eklendi.
- **Güvenlik Kontrolü:** Kullanıcı e-posta adresini değiştirmek isterse, sistem önce yeni e-postanın başka bir kullanıcı tarafından kullanılıp kullanılmadığını kontrol eder. Ardından değişikliğin uygulanabilmesi için kullanıcının mevcut şifresini (`current_password`) girmesini zorunlu kılar.

### 2. API Endpoint (`PATCH /auth/me`)
- `backend/app/routers/auth.py` dosyasına `get_current_user` bağımlılığını (dependency) kullanan korumalı yeni bir route eklendi.
- Bu endpoint `UserUpdate` verisini alır ve veritabanını güvenli bir şekilde günceller.

### 3. Frontend Entegrasyonu
- **Form State:** `frontend/src/app/dashboard/settings/page.tsx` dosyasındaki Kullanıcı Bilgileri formu, kontrollü React state (`formData`) yapısına geçirildi.
- **E-posta Değiştirme Modalı:** Kullanıcı e-postasını düzenleyip "Save Changes" butonuna tıkladığında, işlemi onaylamak için "Mevcut Şifre" (Current Password) soran bir pop-up modal mantığı eklendi.
- **Geri Bildirimler:** Daha iyi bir kullanıcı deneyimi için standart tarayıcı uyarıları (`alert()`) yerine özel Toast bildirimleri (başarılı işlemler için yeşil, hatalar için kırmızı) eklendi.

---

## Bölüm 2: Güvenlik Özellikleri (Şifre & 2FA)

### 1. Ön Hazırlık (Yapılması Gerekenler)
Eğer henüz yapmadıysan, sistemin local/Docker ortamında sorunsuz çalışması için şu komutları çalıştırman gerekmektedir:
- **Backend Migration:** 2FA sütunlarını (`two_factor_secret`, `is_2fa_enabled`) veritabanına eklemek için:
  ```bash
  # Backend dizininde veya container içinde çalıştırın
  python -m alembic upgrade head
  ```
- **Frontend Bağımlılıkları:** QR kod kütüphanesini yüklemek için:
  ```bash
  # Frontend dizininde çalıştırın
  npm install
  ``` 
- **npm install / frontend** Bu kısım da ben yapmadım çunku docker oto json dosyasından çekıyor dıye biliyorum volume olduğundan dolayı eğer bu dosyayı okumak isterse ekip arkadaşım ona bunu söyle.

### 2. Şifre Değiştirme
- **Endpoint:** `current_password` ve `new_password` parametrelerini alan `PUT /auth/password` endpointi eklendi.
- **Frontend:** Security sekmesindeki "Change Password" butonuna tıklandığında bir modal açılır. Güvenli API isteği gönderilmeden önce yeni şifrenin onay şifresiyle eşleşip eşleşmediği kontrol edilir.

### 3. İki Aşamalı Doğrulama (2FA) Kurulum & İptal
- **Altyapı:** Tamamen çevrimdışı çalışan ve sıfır API maliyeti olan TOTP (Zamana Dayalı Tek Kullanımlık Şifre) mantığı için backend'e `pyotp` kütüphanesi entegre edildi.
- **Kurulum Akışı:** 
  1. 2FA düğmesi açıldığında `POST /auth/2fa/setup` isteği atılır.
  2. Ekranda bir QR Kod oluşturulur ve gösterilir.
  3. Kullanıcı bunu Google Authenticator veya Authy ile okutur.
  4. Kullanıcı 6 haneli kodu girer, `POST /auth/2fa/verify` isteği ile bu gizli anahtar sisteme kilitlenir (onaylanır).
- **İptal Akışı:**
  1. Zaten aktif olan bir 2FA düğmesine tıklandığında "Kapatma (Disable)" modalı açılır.
  2. Kullanıcının 2FA özelliğini güvenli bir şekilde kapatabilmesi için, telefonundaki o anki 6 haneli kodu girmesi gerekir (`POST /auth/2fa/disable`).

### 4. 2FA'lı Güvenli Giriş Akışı
- **Düzenlenen Giriş Endpointi (`POST /auth/login`):** Kullanıcı doğru giriş bilgilerini girerse ancak hesabında 2FA aktifse, backend direkt erişim token'ı (access_token) dönmek yerine kısa ömürlü bir `temp_token` döner ve `requires_2fa: true` bayrağını iletir.
- **Frontend Giriş İşlemi:** Giriş sayfası bu bayrağı yakalar ve güvenli 2FA kod giriş ekranına geçiş yapar.
- **Doğrulama (`POST /auth/login/2fa`):** Kullanıcı, 6 haneli kodu ve `temp_token` verisini gönderir. Backend geçici token'ı çözer, 6 haneli kodu doğrular ve en sonunda asıl giriş token'ını (access_token) kullanıcıya teslim eder.

> [!TIP]
> **Tüm Akışı Test Etmek İçin:**
> 1. **Dashboard -> Settings** sayfasına gidin. İsim/e-posta adresinizi değiştirip şifre doğrulama modalını test edin.
> 2. **Security** sekmesine geçin. Şifrenizi değiştirin.
> 3. 2FA özelliğini açın, QR kodu telefonunuzla okutup 6 haneli kodla doğrulayın.
> 4. Sistemden çıkış yapın ve güvenli 2FA giriş adımını görmek için tekrar giriş yapmayı deneyin!
> 5. Ayarlara geri dönüp, tekrar telefonunuzdaki 6 haneli kodu kullanarak 2FA özelliğini kapatmayı test edin.
