# Resmi Python imajını kullanıyoruz
FROM python:3.11-slim

# Çalışma dizinini belirliyoruz
WORKDIR /app

# Python'un .pyc dosyaları oluşturmasını engelliyoruz
ENV PYTHONDONTWRITEBYTECODE=1
# Python çıktılarının buffer'lanmadan terminale yansımasını sağlıyoruz
ENV PYTHONUNBUFFERED=1

# Sistem bağımlılıklarını güncelliyoruz
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Bağımlılıkları kopyalayıp kuruyoruz
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Proje dosyalarını kopyalıyoruz
COPY . .

# Uygulamanın çalışacağı port
EXPOSE 8000

# Geliştirme ortamında hot-reload (canlı yenileme) özelliği için uvicorn'u --reload ile başlatıyoruz
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
