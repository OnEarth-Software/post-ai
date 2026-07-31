FROM node:20-alpine

WORKDIR /app

# Eğer package.json oluşturulmuşsa kopyala ve paketleri kur
COPY package*.json ./
RUN if [ -f package.json ]; then npm install; fi

# Tüm proje dosyalarını kopyala
COPY . .

# Next.js'in dışarıya yayın yapacağı port
EXPOSE 3000

# Kodlar kaydedildiğinde anında yenilenmesi (hot-reload) için geliştirici modunda başlat
# Eğer henüz Next.js kurulmadıysa (package.json yoksa), hata verip kapanmaması için uykuda bekler
CMD if [ -f package.json ]; then npm run dev; else echo "Next.js kurulumu bekleniyor..." && tail -f /dev/null; fi
