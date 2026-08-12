# Admin Paneli Güvenlik Mimarisi ve Server-Side Authorization Özeti

Bugün, Admin panelinin güvenliğini en üst düzeye çıkarmak ve "Defense in Depth" (Derinlemesine Savunma) prensibini uygulamak için ciddi mimari değişiklikler yaptık. Özellikle, normal bir kullanıcının yetkisiz şekilde admin endpointlerine istek attığında (örneğin Burp Suite gibi araçlarla) hiçbir admin verisini, HTML'ini veya Next.js RSC (React Server Components) payload'unu görememesini sağladık.

İşte adım adım yaptıklarımız:

## 1. FastAPI Backend: JWT'ye Rol Eklemesi
Daha önce JWT (JSON Web Token) sadece kullanıcının `id` bilgisini tutuyordu. Next.js Edge Middleware'in her istekte backend'e gidip zaman kaybetmesini (latency) engellemek için, kullanıcının `role` bilgisini de token'ın payload'una (içine) şifreledik.
- **Değişen Dosyalar:** `backend/app/core/security.py`, `backend/app/routers/auth.py`

## 2. Next.js API Route ile HttpOnly Cookie
Eski sistemde giriş yapıldığında token sadece tarayıcının `localStorage`'ına kaydediliyordu. Bu durum, Next.js sunucusunun token'ı okuyamamasına neden oluyordu.
- **Yapılanlar:** Frontend tarafında `/api/auth/login` adında yeni bir Next.js proxy API'si yazdık. Kullanıcı giriş yaptığında istek önce buraya geliyor, buradan FastAPI'a gidiyor. FastAPI'dan gelen token alınarak, JavaScript tarafından okunamayan (XSS saldırılarına karşı güvenli) `HttpOnly` bir cookie'ye kaydediliyor.
- Frontend'deki diğer veri çekme (data fetching) işlemlerinin bozulmaması için token aynı zamanda `localStorage`'a da yazılmaya devam ediliyor.
- **Değişen Dosyalar:** `frontend/src/app/api/auth/login/route.ts`, `frontend/src/app/login/page.tsx`

## 3. Edge Middleware ile Hızlı Yönlendirme
Kullanıcı `/admin/*` sayfalarından birine girmek istediğinde, Next.js bileşenleri (components) daha yüklenmeye bile başlamadan devreye giren bir Middleware yazdık.
- **Nasıl Çalışır:** Bu middleware `token` cookie'sini okuyor, içindeki JWT payload'unu Base64 ile hızlıca çözümlüyor ve `role` bilgisini kontrol ediyor. Eğer kullanıcı `admin` değilse, onu anında `/dashboard` sayfasına yönlendiriyor.
- **Değişen Dosyalar:** `frontend/src/middleware.ts`

## 4. Server-Side Layout Doğrulaması (Tam İzolasyon)
Middleware sadece hızlı bir yönlendirme katmanıdır. Kötü niyetli biri token imzasını bozarak payload içindeki rolü `admin` yapsa bile, asıl sıkı güvenliği sağlayan Layout devreye girer.
- **Yapılanlar:** `admin/layout.tsx` dosyasını tamamen bir Server Component'e çevirdik (`"use client"` kaldırıldı). Bu layout, cookie'deki token'ı alır ve FastAPI backend'indeki `/auth/me` endpoint'ine sıkı bir doğrulama isteği atar.
- Eğer token geçersizse, süresi dolmuşsa veya backend'den dönen asıl rol `admin` değilse, sunucu hiçbir admin bileşenini render etmez ve kullanıcıyı güvenli bir şekilde yönlendirir. Böylece yetkisiz kişilerin response payload'unda admin verisi görmesi kesin olarak engellenir.
- **Değişen Dosyalar:** `frontend/src/app/admin/layout.tsx`

## 5. Docker ve Deployment API URL Çözümü
Geliştirme ortamında Next.js'in Server-Side çalışan kısımlarının, FastAPI'a erişememesi (`ECONNREFUSED` hatası) sorununu çözdük. 
- Docker içindeki bir konteynerin, diğer bir konteynere `localhost` üzerinden ulaşamayacağını göz önünde bulundurarak akıllı bir URL fallback mekanizması kurduk.
- Kod artık `.env` dosyasındaki `NEXT_PUBLIC_API_URL` değişkenini okuyor. Eğer geliştirme ortamında (localhost) çalışıyorsak, Docker'ın iç ağına uygun olan `http://backend:8000` adresine gidiyor. Proje canlıya (prod) alındığında ise tek bir değişkenden beslenerek kusursuz çalışıyor.

---

Bu altyapı sayesinde, Next.js uygulamanızda hem kullanıcı deneyimi çok hızlı (Edge Middleware sayesinde) tutuldu hem de sunucu tarafı render güvenliği (RSC payload güvenliği) en üst düzeye çıkarıldı. Eline sağlık!
