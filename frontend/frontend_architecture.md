# Frontend Mimari Yapısı (Next.js / React)

Bu döküman, projemizin frontend tarafı için oluşturulan modern ve ölçeklenebilir klasör mimarisini açıklamaktadır. Bu yapı, kodların spagettiye dönmesini engeller ve ekibin rahatça çalışmasını sağlar.

## 📂 Klasör Hiyerarşisi ve Görevleri

Frontend projemizin ana çalışma dizini `src/` klasörüdür. Klasörler ve içlerine yazılması gereken dosyalar şu şekildedir:

### 1. `src/app/` (Next.js App Router)
Sadece sayfa (page) ve layout (düzen) tanımlamalarının yapıldığı yerdir.
- **Hangi dosyalar yazılır?** `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Ne işe yarar?** URL rotalarını (routing) belirler. Örneğin `app/login/page.tsx` dosyası web sitesindeki `/login` adresine karşılık gelir.

### 2. `src/components/`
Uygulama genelinde tekrar tekrar kullanılacak görsel bileşenlerin (butonlar, inputlar, modallar vb.) bulunduğu yerdir. İkiye ayrılır:
- **`ui/` (Kullanıcı Arayüzü):** Sadece görsel olan, içinde iş mantığı (business logic) barındırmayan saf bileşenler. (Örn: `Button.tsx`, `Card.tsx`, `Input.tsx`).
- **`shared/` (Ortak):** Birden fazla sayfada kullanılan birleşik bileşenler. (Örn: `Navbar.tsx`, `Footer.tsx`, `Sidebar.tsx`).

### 3. `src/features/`
İşte mimarinin kalbi burası! Projeyi özellik (feature) bazlı modüllere ayırdığımız yerdir. Her özelliğin kendi bileşenleri, API çağrıları ve tipleri kendi klasöründe durur.
- **`products/`**: Ürün yükleme, listeleme bileşenleri. (Örn: `components/ProductCard.tsx`, `api/uploadProduct.ts`).
- **`campaigns/`**: Kampanya oluşturma bileşenleri.
- **Neden var?** İlerde proje büyüdüğünde "Ürünlerle ilgili her şey nerede?" diye aramak yerine doğrudan `features/products` klasörüne girip her şeyi orada bulabilmek için.

### 4. `src/hooks/`
Özel React hook'larımızın (Custom Hooks) bulunduğu klasördür.
- **Hangi dosyalar yazılır?** `useAuth.ts`, `useWindowSize.ts`, `useDebounce.ts`
- **Ne işe yarar?** Sayfalarda tekrar eden React mantıklarını (state yönetimi, useEffect sarmalları vb.) merkezi bir yere toplar.

### 5. `src/services/`
Backend ile (FastAPI) iletişime geçeceğimiz API fonksiyonlarının bulunduğu yerdir.
- **Hangi dosyalar yazılır?** `api.ts` (Axios ayarları), `authService.ts`, `productService.ts`
- **Ne işe yarar?** Frontend'deki bileşenlerin içine doğrudan `fetch` veya `axios` yazmak yerine, istekleri bu klasördeki fonksiyonlar üzerinden yaparız. URL değişirse sadece burayı güncelleriz.

### 6. `src/store/`
Uygulamanın global state (küresel durum) yönetiminin yapıldığı klasördür. (Zustand, Redux veya Context API).
- **Hangi dosyalar yazılır?** `authStore.ts` (Kullanıcı giriş yaptı mı?), `themeStore.ts` (Dark/Light mode).
- **Ne işe yarar?** Bir sayfadaki verinin, uygulamadaki diğer tüm sayfalardan da ulaşılabilir olmasını sağlar.

### 7. `src/types/`
TypeScript kullandığımız için, objelerimizin tiplerini (interface/type) tanımladığımız yerdir.
- **Hangi dosyalar yazılır?** `user.types.ts`, `product.types.ts`
- **Ne işe yarar?** Backend'deki "Pydantic Schemas" klasörünün frontend'deki karşılığıdır. API'den dönecek verinin şeklini burada tanımlarız ki kod yazarken otomatik tamamlama (autocomplete) çalışsın ve hata yapmayalım.

### 8. `src/utils/`
Yardımcı (Utility) fonksiyonların bulunduğu yerdir.
- **Hangi dosyalar yazılır?** `formatDate.ts` (Tarih formatlayıcı), `cn.ts` (Tailwind class birleştirici).
- **Ne işe yarar?** React ile ilgisi olmayan, sadece veri işleyen saf JavaScript/TypeScript fonksiyonlarını barındırır.

### 9. `src/assets/` ve `public/`
- **`assets/`:** Kodun içinden import edilecek vektörel ikonlar, global CSS dosyaları veya SVG'ler.
- **`public/`:** Web sitesine doğrudan URL ile erişilebilecek dışa açık statik dosyalar (Örn: favicon.ico, logo.png).
