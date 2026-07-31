# Authentication System Walkthrough

Uygulamaya **JSON Web Token (JWT)** ve **bcrypt** tabanlı kimlik doğrulama başarıyla eklendi.

## Yapılan Değişiklikler

### 1. Bağımlılıkların Eklenmesi
`requirements.txt` dosyası güncellendi ve `passlib[bcrypt]` ile `PyJWT` projeye entegre edildi. Ortamınıza kuruldu.

### 2. Ayarlar & Güvenlik
- **`app/core/config.py`**: Projenin gizli ayarlarını tutmak (Secret Key, JWT Algorithm, vb.) için `BaseSettings` ile bir Config dosyası oluşturuldu.
- **`app/core/security.py`**: Parolaları bcrypt ile hash'lemek, doğrulamak ve JWT token (Access Token) oluşturmak için fonksiyonlar eklendi.

### 3. Kullanıcı Oturum Yönetimi (Dependencies)
- **`app/core/deps.py`**: Herhangi bir korunması gereken uç nokta (endpoint) için kullanılacak olan `get_current_user` bağımlılığı (dependency) yazıldı. Gelen `Bearer Token` ayrıştırılarak kullanıcının bilgileri veritabanından çekiliyor.

### 4. Şemalar & Yönlendirmeler
- **`app/schemas/token.py`**: JWT döngüsünde kullanılan `Token` ve `TokenPayload` şemaları eklendi.
- **`app/controllers/auth_controller.py`**: İş mantığı (Kullanıcı kaydı ve Login olma sırasında şifrenin doğrulanması) eklendi.
- **`app/routers/auth.py`**: `/auth/login` ve `/auth/register` olmak üzere dışarıya açık API uç noktaları yazıldı.

### 5. Uygulama Entegrasyonu
- **`app/main.py`**: Auth router'ı FastAPI uygulamasına `/auth` prefiksi ile bağlandı.

## Doğrulama
Yeni özellikleri test etmek için projenizi şu komut ile başlatabilirsiniz:
```bash
uvicorn app.main:app --reload
```
Daha sonra `http://localhost:8000/docs` adresinden Swagger UI'a girebilir ve:
1. `POST /auth/register` ile yeni bir hesap açabilir,
2. `POST /auth/login` ile (OAuth2 Password akışıyla) sisteme giriş yaparak Token'ınızı alabilirsiniz.
3. Alınan token ileride eklenecek `Depends(get_current_user)` ile korunan rotalara erişmenizi sağlayacaktır.
