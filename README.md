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
| Bülten | `/bulten` · `/newsletter`, onay `/bulten/onay` · `/newsletter/confirm` | Bülten |

Arayüz metinleri `UI metinleri` (ve sayfaya özgü olanlar ilgili global) içindedir; sosyal bağlantılar
(Instagram, Facebook, YouTube) ve formun hedef adresi `Site ayarları`ndadır.

`tasarim/` klasörü tasarım kaynağıdır (statik HTML); site ondan sunulmaz. Eski `/tasarim/*` kopyaları ve
onları `public/` altına kopyalayan betik kaldırıldı. Logo `public/imza.png`, simge `public/favicon.svg`;
ana ekran simgeleri (`public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`) imza logosundan üretildi ve
web app manifest'te (`src/app/manifest.ts` → `/manifest.webmanifest`) kullanılır; diğer bütün görseller panelden
(media) gelir.

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
| `RESEND_API_KEY`, `RESEND_FROM` | İletişim formu e-postası ve bülten (Resend). `RESEND_FROM` Resend'de **doğrulanmış bir alan adından** olmalı (ör. `Sıtkı Çoban <form@sitkicoban.com>`). İkisinden biri ya da `Site ayarları > Form hedef e-postası` boşsa form "şu an gönderilemiyor" der; mesajlar kaydedilmez. Bülten için anahtarın **tam yetkili** (Full access) olması gerekir: yalnızca gönderim yetkili anahtar kişi, segment, konu ve toplu gönderim (Broadcasts) işlemlerini yapamaz |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Tarayıcı bildirimleri (Web Push). `VAPID_SUBJECT` bir `mailto:` adresidir (ör. `mailto:iletisim@sitkicoban.com`). Anahtarlar `npx web-push generate-vapid-keys` ile bir kez üretilir ve değiştirilmez (değişirse mevcut bildirim aboneleri geçersiz olur). Biri boşsa bülten sayfasında bildirim bölümü çıkmaz; site hata vermez. Public anahtar sayfaya derleme sırasında yazılır |

### İletişim formu

Mesajlar yalnızca e-posta ile gider (`replyTo` gönderenin adresi). Bal küpü alanı dolu ya da sayfa açıldıktan
3 saniyeden kısa sürede gönderilen formlar sessizce "gönderildi" der ama gönderilmez; JavaScript yüklenmeden
gönderilen form görünür bir hata alır. `?konu=<anahtar>` (ör. `?konu=mesk`; anahtarlar panelde "Form
konuları"nda, üç dilde aynı) konuyu, `?eser=<ad>` eser konusunu ve hazır mesajı seçer.

### Bülten

Ziyaretçi `/bulten`'de e-posta adresini, konuları (Yazılar, Kitaplar, Eserler, Videolar) ve açık rızayı verir;
abonelik yalnızca e-postadaki onay bağlantısıyla başlar (çift onay). Kişiler Resend'de tutulur, sitenin
veritabanında e-posta adresi saklanmaz: dil = segment (`sitkicoban-tr`, `-en`, `-ar`), konu = topic
(`yazilar`, `kitaplar`, `eserler`, `videolar`), kişi özelliği `bulten_onay` (onay e-postası zamanı). Bunlar ada
göre bulunur, yoksa ilk kullanımda kendiliğinden oluşturulur; Resend panelinde elle bir şey kurmak gerekmez.
Abonelikten çıkma ve konu tercihleri her e-postanın altındaki Resend bağlantısıyla yapılır.

Aynı sayfadaki "Tarayıcı bildirimleri" bölümü Web Push aboneliği açar (`public/sw.js`; kayıtlar panelde
"Bildirim abonelikleri"). iPhone/iPad'de bildirim yalnızca site Safari'de "Ana Ekrana Ekle" ile eklenip oradan
açıldığında çalışır (iOS 16.4+); bunun için site bir web app manifest'i (`display: standalone`) sunar.

**Duyuru:** Yazı, kitap, eser ve video kayıtlarının yan panelinde "Kaydedince abonelere duyur — bir kez"
kutusu vardır. İşaretleyip kaydedince (yazılarda kayıt "Yayında" olmalı) o konuya abone olanlara her dilde
bir e-posta (Resend Broadcast) ve tarayıcı bildirimi gider; kutu kendiliğinden kalkar, "Duyuruldu" alanına
tarih yazılır. Duyurulmuş bir kaydı tekrar göndermek için "Yeniden duyur" işaretlenir. Seed hiçbir zaman
duyuru göndermez. Kitap duyurusu sitedeki Kitaplar sayfasına bağlanır; e-postalarda ve
bildirimlerde **satın alma bağlantısı hiçbir zaman yer almaz**. Metinler (konu satırı şablonları `{baslik}`,
bağlantı metinleri, form ve onay metinleri) panelde `Bülten` global'indedir; boşsa form çizilmez.

**Serbest duyuru:** Panelde **Duyurular** bölümünden başlık, metin, isteğe bağlı görsel ve sitedeki bir
sayfaya bağlantıyla (dış bağlantı girilemez) duyuru yazılır; "Kime" (bütün aboneler ya da bir konunun
aboneleri) ve "Nasıl" (e-posta, tarayıcı bildirimi) seçilip "Kaydedince gönder — bir kez" işaretlenerek
kaydedilince gönderilir. Gönderim zamanı ve sonucu kayıtta görünür; aynı duyuru kaydı çoğaltılarak yeniden
gönderilebilir.

**Bildirim daveti:** Bildirimi destekleyen tarayıcıda ziyaretçi bir sayfada 15 sn kaldıktan sonra (çerez
bildirimi kapandıysa) küçük bir kart bildirim almak isteyip istemediğini sorar; tarayıcının izin penceresi
yalnızca "Bildirimleri aç"a basınca açılır. "Daha sonra" 30 gün boyunca yeniden sormaz. Metinleri `Bülten`
global'inde (davet metni, "Daha sonra").

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
yeniden üretilir; iletişim formu gönderimi (sunucu eylemi) sorgu göndermez. Gezintiye bülten ve onay sayfaları
(üç dilde), `/sw.js` ve `/manifest.webmanifest` dahildir.

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
`RESEND_FROM`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`; `SITE_URL` isteğe bağlıdır. `pnpm build` veritabanını sorguladığı için bu değişkenler derleme
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
- **Bülten:** `RESEND_API_KEY` tam yetkili olmalı (Contacts, Segments, Topics, Broadcasts). VAPID anahtarlarını
  bir kez üretin (`npx web-push generate-vapid-keys`; çıktıdaki Public Key → `VAPID_PUBLIC_KEY`, Private Key →
  `VAPID_PRIVATE_KEY`) ve yalnızca Doppler'da tutun. Onay bağlantıları `PAYLOAD_SECRET`'ten türetilen anahtarla
  imzalanır (7 gün geçerli); `PAYLOAD_SECRET` değişirse bekleyen onay bağlantıları geçersiz olur.
- **Aydınlatma metni:** Bülten kişisel veri (e-posta adresi, dil ve konu tercihleri, bildirim aboneliği)
  işlediği için panelde `İletişim > Aydınlatma metni`ne (üç dilde) bir bülten paragrafı eklenmelidir. Öneri:

  > **Bülten ve bildirimler.** Bültene abone olduğunuzda e-posta adresiniz, dil ve konu tercihleriniz ile
  > onay zamanı, yeni içerikleri size duyurmak amacıyla açık rızanıza dayanılarak işlenir ve e-posta hizmet
  > sağlayıcımız Resend (ABD) tarafından saklanır. Aboneliğiniz, e-postadaki onay bağlantısına tıkladığınızda
  > başlar. Tarayıcı bildirimlerine izin verdiğinizde tarayıcınızın bildirim adresi ve dil/konu tercihleriniz
  > sitemizin veritabanında saklanır. Her e-postanın altındaki bağlantıdan, bildirimleri ise bülten
  > sayfasından ya da tarayıcı ayarlarından dilediğiniz zaman kapatabilirsiniz; bu durumda verileriniz bülten
  > amacıyla kullanılmaz.
- **Google Analytics:** Ölçüm kimliği `Site ayarları > Google Analytics ölçüm kimliği`ndedir; boşsa etiket ve
  çerez bildirimi hiç çıkmaz. Etiket Google'ın izin moduyla (Consent Mode v2) yüklenir: ziyaretçi kabul
  edene kadar çerez yazılmaz, yalnızca çerezsiz sinyal gider; kabul edilince analiz çerezleri açılır, reklam
  izinleri hiç açılmaz. Bildirim metinleri `Site ayarları > Çerez bildirimi`ndedir.
