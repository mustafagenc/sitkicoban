# Hattat Sıtkı Çoban Kişisel Web Sitesi

Next.js + Payload CMS (Postgres). Ana sayfa, Eserler ve Kitaplar Türkçe, İngilizce (`/en`) ve Arapça (`/ar`)
olarak veritabanından statik üretilir; yönetim paneli `/admin` altındadır.

## Gereksinimler

- Node.js 22+
- pnpm
- PostgreSQL

## Kurulum (yerel)

```sh
createdb sitkicoban
cp .env.example .env   # DATABASE_URL, PAYLOAD_SECRET, SEED_ADMIN_* değerlerini doldurun
pnpm install
pnpm seed              # tasarım içeriğini ve yönetici kullanıcıyı yükler; tekrar çalıştırmak çift kayıt üretmez
pnpm dev
```

Site <http://localhost:3000>, panel <http://localhost:3000/admin> (giriş: `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD`). Yerelde şema `push` ile otomatik eşitlenir, migration çalıştırmak gerekmez.

`pnpm seed` önbellek yenilemesini atlar: çalışan bir sunucu varsa seed'den sonra yeniden başlatın
(üretim derlemesinde `.next` klasörünü silip yeniden derleyin), yoksa eski içerik görünmeye devam eder.

Menüdeki henüz yapılmamış sayfalar (`/tasarim/*`) statik tasarım kopyasından sunulur.

## Kabul kontrolü

Ziyaretçi gezintisinin veritabanına sorgu göndermediğini ve bir eser kaydedilince yalnızca Eserler ile ana
sayfanın (üç dilde) yeniden üretildiğini doğrular:

```sh
pnpm build
SORGU_LOG=/tmp/sorgu.log pnpm start > /tmp/sunucu.log 2>&1 &
SORGU_LOG=/tmp/sorgu.log SUNUCU_LOG=/tmp/sunucu.log pnpm sorgu-kontrol
```

`SORGU_LOG` ayarlıyken sunucu her SQL sorgusunu bu dosyaya yazar. Betik, ana sayfanın ilk eserinin başlığını
panel API'si üzerinden (`SEED_ADMIN_*` ile giriş yaparak) geçici olarak değiştirir ve sonunda geri yükler.

## Neon'a geçiş

1. `DATABASE_URL` değerini Neon'un **pooled** bağlantı adresi yapın.
2. `pnpm payload migrate` ile şemayı `src/migrations` içindeki migration'lardan kurun.
3. `NODE_ENV=production pnpm seed` ile içeriği yükleyin (`NODE_ENV=production`, seed'in uzak veritabanında
   `push` yapmasını önler).

Uyarı: seed'i yeniden çalıştırmak, panelde düzenlenmiş olsa bile seed'in yazdığı alanların üzerine yazar.
Şema değişikliklerinde `pnpm payload migrate:create <ad>` ile yeni migration oluşturup dağıtımda
`pnpm payload migrate` çalıştırın.
