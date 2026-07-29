# AGENTS.md

# Proje Genel Bakış

Bu proje, kullanıcıların ürün görsellerinden yapay zeka kullanarak pazarlama içerikleri oluşturmasını sağlayan bir platformdur.

Sistem temel olarak:

- Kullanıcıdan ürün görseli alır.
- Yapay zeka ile ürünün özelliklerini analiz eder.
- Ürün bilgilerini JSON formatında oluşturur.
- Kullanıcının bu bilgileri düzenlemesine ve onaylamasına izin verir.
- Kullanıcının seçtiği platforma göre (Instagram vb.) içerik üretim akışı başlatır.
- Yapay zeka ile pazarlama görselleri oluşturur.
- Kullanıcı geri bildirimlerine göre tekrar üretim yapılabilir.


# Ana Pipeline


Ürün Görseli Yükleme

↓

AI Vision Analizi

↓

Ürün Bilgileri JSON Oluşturma

↓

Kullanıcı Düzenleme / Onay

↓

Platform ve İçerik Tipi Seçimi

↓

AI Prompt Oluşturma

↓

Görsel Üretimi

↓

Kullanıcı Kontrolü

↓

Onaylanan İçeriğin Kaydedilmesi


# Temel Modüller


## Product

Kullanıcının yüklediği ürün görsellerini ve AI tarafından çıkarılan ürün bilgilerini yönetir.


## Campaign

Kullanıcının oluşturduğu pazarlama kampanyalarını yönetir.

Örnek bilgiler:

- Kategori
- Stil
- Hedef kitle
- Pazarlama amacı
- Platform


## AI Generation

Yapay zeka ile:

- Ürün analizi
- Prompt oluşturma
- Görsel üretimi

işlemlerini yönetir.


## Asset

Üretilen görselleri ve içerikleri yönetir.


# Teknoloji Yapısı


Backend:

- Python
- FastAPI


Database:

- PostgreSQL
- Supabase


Storage:

- Supabase Storage


Frontend:

- React / Next.js


# Geliştirme Prensibi

Kod yapısı modüler olmalıdır.

- API işlemleri router/controller katmanında
- İş mantığı service katmanında
- AI işlemleri ayrı servislerde tutulmalıdır.

Yeni özellik eklenirken mevcut pipeline akışına uygun geliştirme yapılmalıdır.