# Hattat Sıtkı Çoban Kişisel Web Sitesi

Next.js + Payload CMS (Postgres). Bütün sayfalar Türkçe, İngilizce (`/en`) ve Arapça (`/ar`) olarak
veritabanından statik üretilir; yönetim paneli `/admin` altındadır.

| Sayfa | Türkçe / İngilizce-Arapça yol | Panelde |
| --- | --- | --- |
| Ana sayfa | `/` | Ana Sayfa, Dersler, Eserler, Kitaplar, Yazılar, Hayatı, Videolar |
| Eserler | `/eserler` · `/works` | Eserler, Eser türleri |
| Kitaplar | `/kitaplar` · `/books` | Kitaplar |
| Yazılar | `/yazilar` · `/writings`, yazı `/yazilar/<slug>` | Yazılar, Yazı kategorileri (yalnızca "Yayında" olanlar görünür) |
| Videolar | `/videolar` · `/videos` | Videolar, Video kategorileri |
| Hayatı (İcazet) | `/hayati` · `/biography` | Hayatı, Hocalar |
| İletişim | `/iletisim` · `/contact`, aydınlatma `/iletisim/aydinlatma` · `/contact/privacy` | İletişim, Site ayarları |

Arayüz metinleri `UI metinleri` (ve sayfaya özgü olanlar ilgili global) içindedir; sosyal bağlantılar
(Instagram, Facebook, YouTube) ve formun hedef adresi `Site ayarları`ndadır.

`tasarim/` klasörü tasarım kaynağıdır (statik HTML); site ondan sunulmaz. Eski `/tasarim/*` kopyaları ve
onları `public/` altına kopyalayan betik kaldırıldı. Logo `public/imza.png`, simge `public/favicon.svg`;
diğer bütün görseller panelden (media) gelir.

## Gereksinimler

- Node.js 22+
- pnpm
- PostgreSQL

## Kurulum (yerel)

```sh
createdb sitkicoban
cp .env.example .env   # DATABASE_URL, PAYLOAD_SECRET, SEED_ADMIN_* değerlerini doldurun (diğerleri aşağıda)
pnpm install
pnpm seed              # tasarım içeriğini ve yönetici kullanıcıyı yükler; tekrar çalıştırmak çift kayıt üretmez
pnpm dev
```

Site <http://localhost:3000>, panel <http://localhost:3000/admin> (giriş: `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD`). Yerelde şema `push` ile otomatik eşitlenir, migration çalıştırmak gerekmez.

`pnpm seed` önbellek yenilemesini atlar: çalışan bir sunucu varsa seed'den sonra yeniden başlatın
(üretim derlemesinde `.next` klasörünü silip yeniden derleyin), yoksa eski içerik görünmeye devam eder.

pnpm 11 `package.json`'daki `pnpm` alanını okumaz: derleme betiklerine izin `pnpm-workspace.yaml`
(`allowBuilds`) içindedir.

### Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `DATABASE_URL`, `PAYLOAD_SECRET` | Veritabanı ve Payload gizli anahtarı (zorunlu) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Seed'in oluşturduğu yönetici (yalnızca seed ve kabul kontrolü) |
| `SITE_URL` | Sitenin adresi (yalnızca sunucuda: ısıtma, sitemap, robots). Vercel'de boş bırakılabilir; yayında üretim alan adı, önizlemede önizleme adresi kullanılır |
| `BLOB_READ_WRITE_TOKEN` | Ayarlıysa görseller Vercel Blob'a yüklenir; değilse `public/media` (veya `MEDIA_DIR`) |
| `RESEND_API_KEY`, `RESEND_FROM` | İletişim formu e-postası (Resend). `RESEND_FROM` Resend'de **doğrulanmış bir alan adından** olmalı (ör. `Sıtkı Çoban <form@sitkicoban.com>`). İkisinden biri ya da `Site ayarları > Form hedef e-postası` boşsa form "şu an gönderilemiyor" der; mesajlar kaydedilmez |

### İletişim formu

Mesajlar yalnızca e-posta ile gider (`replyTo` gönderenin adresi). Bal küpü alanı dolu ya da sayfa açıldıktan
3 saniyeden kısa sürede gönderilen formlar sessizce "gönderildi" der ama gönderilmez; JavaScript yüklenmeden
gönderilen form görünür bir hata alır. `?konu=<anahtar>` (ör. `?konu=mesk`; anahtarlar panelde "Form
konuları"nda, üç dilde aynı) konuyu, `?eser=<ad>` eser konusunu ve hazır mesajı seçer.

## Testler

Entegrasyon testleri tabloları silip yeniden yazar; bu yüzden yalnızca adı `_test` ile biten ayrı bir
veritabanında çalışır (`vitest.setup.ts` aksi halde hata verir, `BLOB_READ_WRITE_TOKEN`'ı da yok sayar):

```sh
createdb sitkicoban_test   # .env içinde DATABASE_URL_TEST=postgres://localhost:5432/sitkicoban_test
pnpm test:int
```

## Kabul kontrolü

Doğrular: üç dilde bütün sayfaların ve yayındaki bir yazının gezintisi veritabanına sorgu göndermez; bir eser
kaydedilince yalnızca Eserler, ana sayfa ve Hayatı sayfası (üç dilde), bir ders kaydedilince yalnızca ana sayfa (üç dilde)
yeniden üretilir; iletişim formu gönderimi (sunucu eylemi) sorgu göndermez.

```sh
pnpm build
RESEND_API_KEY= SORGU_LOG=/tmp/sorgu.log pnpm start > /tmp/sunucu.log 2>&1 &
SORGU_LOG=/tmp/sorgu.log SUNUCU_LOG=/tmp/sunucu.log pnpm sorgu-kontrol
```

`SORGU_LOG` ayarlıyken sunucu her SQL sorgusunu bu dosyaya yazar. Sunucu `RESEND_API_KEY=` (boş) ile
başlatılır: betiğin gönderdiği form e-posta göndermez, "unavailable" döner (dönmezse betik hata verir).
Port 3000 doluysa `pnpm start -p <port>` kullanın ve `SITE_URL`'yi aynı porta ayarlayın (derleme
de bu değerle yapılmalı). Betik, ana sayfanın ilk eserinin başlığını ve bir dersin kurumunu panel API'si
üzerinden (`SEED_ADMIN_*` ile giriş yaparak) geçici olarak değiştirir ve sonunda geri yükler.
Yönetici bilgisi gönderdiği ve içerik düzenlediği için `SITE_URL` ana makinesi `localhost`,
`127.0.0.1` veya `::1` değilse çalışmayı reddeder. REST/GraphQL okuması yalnızca giriş yapmış kullanıcıya
açıktır (anonim istek 401/403 alır); site verisini Local API ile okur, `/media` dosyaları statik sunulur.

## Yayın

Site Vercel'de yayındadır (`main` dalı → sitkicoban.com; `develop` otomatik yayınlanmaz). Veritabanı Neon
(Postgres), görseller Vercel Blob, e-posta Resend. Ortam değişkenleri Doppler üzerinden Vercel'e senkronlanır:
`DATABASE_URL` (Neon **pooled** adres), `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`,
`RESEND_FROM`; `SITE_URL` isteğe bağlıdır. `pnpm build` veritabanını sorguladığı için bu değişkenler derleme
sırasında da gerekir; Preview ortamı da aynılarına ihtiyaç duyar.

- **Şema değişikliği:** `pnpm payload migrate:create <ad>` ile migration oluşturup commitleyin; yayından
  önce Neon'un **doğrudan** (adında `-pooler` olmayan) adresiyle `DATABASE_URL=<doğrudan adres> pnpm payload migrate`
  çalıştırın. Uzak veritabanında şema `push` kapalıdır; Neon'a bağlıyken `pnpm dev` çalıştırmayın.
- **Seed'i canlıda yeniden çalıştırmayın:** seed boş bir veritabanını kurmak içindir; panelde düzenlenmiş
  alanların üzerine yazar (içerik silmez).
- **Blob deposu:** Vercel'e bağlı depo canlı sitenin deposudur. Yerelde ayrı bir geliştirme deposu/token
  kullanın; canlı token'la yerelde görsel silmek canlıdaki dosyayı da siler.
- **Sitemap ve robots:** `/sitemap.xml` sayfaları ve yayındaki yazıları üç dilde listeler, yazı kaydında
  yenilenir; `/robots.txt` `/admin` ve `/api`'yi tarama dışı tutar. `/llms.txt` yapay zekâ ajanları için
  sitenin özetidir (ana sayfanın İngilizce arama açıklaması, üç dilde sayfalar, yayındaki yazılar); statik
  üretilir, ana sayfa, yazı, kitap ve görsel kaydında yeniden ısıtılır.
- **Google Analytics:** Ölçüm kimliği `Site ayarları > Google Analytics ölçüm kimliği`ndedir; boşsa etiket ve
  çerez bildirimi hiç çıkmaz. Etiket Google'ın izin moduyla (Consent Mode v2) yüklenir: ziyaretçi kabul
  edene kadar çerez yazılmaz, yalnızca çerezsiz sinyal gider; kabul edilince analiz çerezleri açılır, reklam
  izinleri hiç açılmaz. Bildirim metinleri `Site ayarları > Çerez bildirimi`ndedir.
