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

## Testler

Entegrasyon testleri tabloları silip yeniden yazar; bu yüzden yalnızca adı `_test` ile biten ayrı bir
veritabanında çalışır (`vitest.setup.ts` aksi halde hata verir, `BLOB_READ_WRITE_TOKEN`'ı da yok sayar):

```sh
createdb sitkicoban_test   # .env içinde DATABASE_URL_TEST=postgres://localhost:5432/sitkicoban_test
pnpm test:int
```

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
Yönetici bilgisi gönderdiği ve içerik düzenlediği için `NEXT_PUBLIC_SITE_URL` ana makinesi `localhost`,
`127.0.0.1` veya `::1` değilse çalışmayı reddeder. REST/GraphQL okuması yalnızca giriş yapmış kullanıcıya
açıktır (anonim istek 401/403 alır); site verisini Local API ile okur, `/media` dosyaları statik sunulur.

## Neon'a geçiş

1. `DATABASE_URL` değerini Neon'un **pooled** bağlantı adresi yapın. Şema `push` yalnızca ana makine
   `localhost`/`127.0.0.1`/`::1` ise açıktır; uzak veritabanında kapalıdır. Yine de **Neon
   `DATABASE_URL` ile asla `pnpm dev` çalıştırmayın**.
2. Görseller Vercel Blob'a gidecekse seed'den önce `BLOB_READ_WRITE_TOKEN` ayarlayın (ayarlıysa seed var
   olan görsel kayıtlarını yeniden kullanır, tekrar yüklemez).
3. `pnpm payload migrate` ve hemen ardından `NODE_ENV=production pnpm seed` çalıştırın
   (`NODE_ENV=production`, seed'in uzak veritabanında `push` yapmasını önler). İlk kullanıcı seed ile
   oluşur; arada kalan süre içinde `/admin/create-first-user` herkese açıktır, bu yüzden iki komutu art arda
   çalıştırın.
4. Üretimde `NEXT_PUBLIC_SITE_URL` ayarlayın; yoksa içerik kaydedilince sayfa ısıtması yapılmaz.
5. `pnpm build` veritabanını sorgular (beklenen davranış); sorgu günlüğü (`SORGU_LOG`) yalnızca `pnpm start`
   sırasında anlamlıdır.

Uyarı: seed'i yeniden çalıştırmak, panelde düzenlenmiş olsa bile seed'in yazdığı alanların üzerine yazar.
Şema değişikliklerinde `pnpm payload migrate:create <ad>` ile yeni migration oluşturup dağıtımda
`pnpm payload migrate` çalıştırın.
