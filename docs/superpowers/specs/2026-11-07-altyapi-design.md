# Altyapı: Next.js + Payload CMS — 1. aşama

Tarih: 2026-11-07 · Dal: `develop`

## Amaç ve neden

sitkicoban.com şu an `tasarim/` klasöründe duran statik HTML bir tasarım. İçerik (eserler, kitaplar, yazılar,
duyurular, videolar, hayatı…) sayfaların içine gömülü; değiştirmek kod düzenlemek demek. Sıtkı Bey ve site
sahibi (Mustafa Genç) içeriği kod bilmeden, bir panelden girebilmeli: **neredeyse her metin ve görsel
panelden güncellenebilir olmalı**.

Site üç dilde olacak (Türkçe ana dil, İngilizce, Arapça). Veritabanı Neon (Postgres) — istek ve çalışma
süresine göre ücretlendiriyor, bu yüzden **ziyaretçi trafiği veritabanına hiç gitmemeli**; veritabanı yalnızca
panel kullanılırken ve sayfa yeniden üretilirken uyanmalı.

Bu doküman ilk aşamayı anlatır: altyapı + birkaç bölüm. Kalan bölümler sonraki aşamalarda aynı kalıpla eklenir.

## Hedefler (1. aşama)

1. `develop` dalında Next.js (App Router) + Payload CMS 3 uygulaması; panel `/admin`.
2. Çok dilli altyapı: `tr` (varsayılan), `en`, `ar` (sağdan sola).
3. Önbellek modeli: ziyaretçi sayfaları önceden üretilmiş/önbellekten gelir; panelde kayıt olunca yalnızca
   etkilenen sayfalar yenilenir.
4. Ortak düzen (üst menü, mobil menü, alt bilgi, tema, logo ve parıltısı) mevcut tasarımla birebir.
5. Site ayarları paneli: iletişim bilgileri, sosyal medya linkleri, iletişim formunun gideceği e-posta.
6. Bölümler: **Eserler** (liste + filtre + görünüm seçici + görüntüleyici), **Kitaplar** (raf + ayrıntı
   penceresi) ve **Ana sayfa** (eserler ve kitaplar bölümleri veritabanından).
7. Seed: mevcut tasarımdaki eser ve kitap verilerini, görselleriyle birlikte veritabanına yükleyen komut.
   Önce yerel Postgres'te, sonra aynı komutla Neon'da çalışır.

## Hedef dışı (sonraki aşamalar)

- Yazılar, Videolar, Duyurular/Dersler, Hayatı, İcazet bölümlerinin panele taşınması.
- İletişim formu (Resend ile gönderim — karar verildi, aşağıda; ama bu aşamada kurulmaz).
- Arama, yorum, bülten, istatistik.
- `main` dalına merge ve canlıya alma.

## Olmaması gerekenler (çalışsa bile başarısızlık sayılır)

- Ziyaretçinin bir sayfayı açmasıyla Neon'a sorgu gitmesi.
- Tasarımdan görünür sapma: yeni uygulamadaki sayfalar `tasarim/` karşılıklarıyla yan yana konduğunda aynı
  görünmeli (açık ve koyu tema, masaüstü ve mobil).
- İngilizce/Arapça sayfada çevrilmemiş alanların boş görünmesi.
- Panelde değişiklik kaydedilince sitenin güncellenmemesi ya da tüm sitenin baştan üretilmesi.

## Kısıtlar

- Barındırma Vercel, veritabanı Neon (yayında), görseller Vercel Blob.
- Geliştirme yerelde kurulu PostgreSQL 18 üzerinde (`sitkicoban` adında ayrı veritabanı).
- Node 24, pnpm.
- `tasarim/` klasörü referans olarak olduğu gibi kalır; `main` dalındaki statik yayın bozulmaz.
- Commit mesajlarında ve PR'larda Claude/Co-Authored-By geçmez.

## Kullanıcının verdiği kararlar

- **İçeriği girenler:** Sıtkı Bey ve Mustafa Genç; panelde iki yönetici hesabı.
- **Panelden yönetim:** neredeyse her şey (bölüm içerikleri, sabit metinler, ayarlar).
- **Diller:** Türkçe ana dil; İngilizce ve Arapça girişlere uygun yapı.
- **Eksik çeviri:** o alan Türkçesiyle gösterilir.
- **İletişim formu:** Resend ile belirli bir e-posta adresine gönderilir.
- **Veritabanı:** önce yerel Postgres, sonra Neon'a geçiş; bunun için seed mekanizması.
- **İlk bölümler:** Eserler, Kitaplar ve ana sayfa.
- **Henüz taşınmayan bölümler:** Ana sayfadaki İcazet, Yazılar, Video, Dersler ve Hayatı bölümleri bu aşamada
  tasarımdaki gibi sabit Türkçe içerikle durur; kendi aşamalarında panele taşınır. Menü ve alt bilgideki,
  sayfası henüz yapılmamış linkler (Yazılar, Videolar, Hayatı, İletişim, yazı ayrıntısı) mevcut statik
  tasarım sayfalarına gider.
- **Çeviriler:** Arayüz metinlerinin (menü, butonlar, sabit yazılar, ana sayfa bölüm başlıkları) İngilizce ve
  Arapçası seed'e eklenir. Eser ve kitap içerikleri şimdilik yalnızca Türkçe girilir; çevirilerini site sahipleri
  sonra panelden yapar. O zamana kadar `/en` ve `/ar`'da bu içerikler Türkçe görünür.

## Benim kararlarım (değiştirilebilir)

**Repo düzeni.** Next.js uygulaması repo kökünde kurulur (`package.json`, `src/`). `tasarim/`, `assets/`,
`docs/` yerinde kalır. `develop`'taki `vercel.json` Next.js'e göre güncellenir; `main`'deki statik yayın
merge edilene kadar etkilenmez.

**Yalnızca yerel.** 1. aşama tamamen yerelde çalışır; `develop` Vercel'de yayınlanmaz (gerekirse
`vercel.json` ile bu dal için otomatik deploy kapatılır). Neon ve Blob hattı kurulmaz; yalnızca Payload
migration dosyaları üretilip commitlenir, Blob adaptörü ortam değişkenine bağlı olarak hazır bekler.

**Henüz yapılmamış sayfalara linkler.** Statik tasarım sayfaları uygulamanın `public/` klasörü altına (ör.
`/tasarim/yazilar.html`) kopyalanarak sunulur; menü bu adreslere gider. Kopyalama bir betikle yapılır, elle
değil. Bölümler taşındıkça bu linkler gerçek sayfalara döner, kopyalar silinir.

**Payload.** Payload 3 (Next.js içinde, aynı uygulama), `@payloadcms/db-postgres`. Panel arayüzü Türkçe.
Yerelde şema `push` ile; Neon için Payload migration dosyaları üretilip commitlenir.

**Dil yapısı.** Payload `localization`: `locales: tr, en, ar(rtl)`, `defaultLocale: tr`, `fallback: true`.
Metin alanları (başlık, açıklama, anlam, kaynak, yazı türü adları…) `localized`; görsel, oran, yıl, ölçü,
sıra gibi dile bağlı olmayan alanlar tek. Eserin Arapça metni (`ar` alanı) zaten Arapça olduğu için
localized değildir.

**Adresler.** Türkçe kökte: `/`, `/eserler`, `/kitaplar`. İngilizce `/en`, `/en/works`, `/en/books`.
Arapça `/ar`, `/ar/works`, `/ar/books` (Latin harfli yol). Dil seçici aynı sayfanın diğer dildeki adresine
gider. `<html lang dir>` dile göre; Arapçada `dir="rtl"`.

**Arayüz metinleri.** Menü adları, buton yazıları, "Bilgi girilecek" gibi sabit metinler `UI Metinleri`
adlı localized bir Payload global'inde tutulur; Türkçe, İngilizce ve Arapça karşılıkları seed ile girilir.

**İçerik modeli (1. aşama).**

- `users`: e-posta + şifre, yalnızca yöneticiler.
- `media`: yükleme koleksiyonu; `alt` localized. Yerelde diske, `BLOB_READ_WRITE_TOKEN` varsa
  `@payloadcms/storage-vercel-blob` ile Blob'a. Next.js görsel optimizasyonu kullanılır.
- `yazi-turleri` (Sülüs, Nesih, Celî Sülüs, Ta'lik…): `ad` localized, `sira`.
- `eser-turleri` (Levha, Hilye, Âyet, Beyit…): `ad` localized.
- `eserler`: `baslik`*, `slug`, `gorsel` (media), `oran` (görselden otomatik hesaplanır), `yaziTurleri`
  (çoklu ilişki), `tur` (ilişki), `yil`, `metin` (Arapça), `anlam`*, `kaynak`*, `aciklama`*, `olcu`,
  `malzeme`*, `tezhip`*, `ebru`*, `sira`, `anasayfadaGoster` (+ sıra). (* localized)
- `kitaplar`: `baslik`*, `altBaslik`*, `slug`, `rol` (Yazar/Hazırlayan/Sadeleştiren/Derleyen — select,
  etiketleri UI metinlerinden), `asilYazar`, `kapak` (media, opsiyonel; yoksa yazı kapak), `kapakSigdir`
  (contain), `yayinevi`, `yil`, `sayfa`, `isbn`, `aciklama`*, `satinAlLinki`, `sira`, `anasayfadaGoster`.
- Global `site-ayarlari`: e-posta, telefon, adres*, Instagram/Facebook/YouTube linkleri, iletişim formu hedef
  e-postası.
- Global `ui-metinleri`: yukarıda.
- Global `anasayfa`: bu aşamada yalnızca hero ve eserler/kitaplar bölümlerinin üst yazıları (eyebrow, başlık,
  açıklama)*; diğer bölümler sonraki aşamalarda eklenecek alanlarla gelir.

Boş bırakılan bilgi alanları sitede tasarımdaki gibi "Bilgi girilecek" olarak görünür.

**Önbellek.**

- Sayfalar statik üretilir (`generateStaticParams` ile üç dil). Veri Payload Local API ile, etiketli önbellek
  sarmalayıcıları üzerinden okunur (`unstable_cache` ya da Next sürümüne göre `'use cache'` + `cacheTag`).
  Süreye bağlı yenileme yok.
- Her koleksiyon/global'in `afterChange` ve `afterDelete` kancaları ilgili etiketleri `revalidateTag` ile
  düşürür (ör. eser kaydı → `eserler`, `anasayfa`; site ayarları → `ayarlar`, tüm düzen).
- Kayıttan hemen sonra aynı kanca etkilenen sayfa adreslerini (üç dilde) arka planda bir kez ister; böylece
  sayfa kayıt anında yeniden üretilir, veritabanını uyandıran bir ziyaretçi olmaz. Değişiklik başına sorgu
  sayısı sabit kalır.
- Seed, build ve bu yeniden üretim sırasında veritabanına gidilir; ziyaretçi isteğinde gidilmez. Bunun
  doğrulanması kabul kriteridir (aşağıda).
- Neon'da pooled bağlantı adresi kullanılır; Neon'un uykuya geçme özelliği açık kalır.

**Ön yüz.** `tasarim/` sayfaları React bileşenlerine çevrilir; CSS (`ortak.css`, sayfa stilleri,
`eser-lb.css`, `kitap-lb.css`) olabildiğince aynen taşınır. Yazı tipleri `next/font` ile. Tema seçimi,
`localStorage` anahtarı `tema` aynı kalır ve ilk boyamada yanıp sönme olmaz. Eser görüntüleyici, kitap penceresi,
filtre ve görünüm seçici istemci bileşenleri olur; veriyi sayfadan alır, istek atmaz. Arapça için CSS'te
mantıksal özellikler (`margin-inline-start` vb.) ve gereken yerlerde aynalama.

**Seed.** `pnpm seed`: `tasarim/eser-lb.js` ve `tasarim/kitap-lb.js` içindeki `ESERLER`/`KITAPLAR`
dizilerini okur (dosya `vm` ile değerlendirilir), görselleri `tasarim/img/`'den media'ya yükler, yazı/eser
türlerini çıkarır, UI metinleri ve site ayarlarının varsayılanlarını girer, bir yönetici hesabı oluşturur
(bilgiler `.env`'den). Tekrar çalıştırılabilir: `slug`'a göre günceller, çift kayıt üretmez. Hangi veritabanına
yazacağını yalnızca `DATABASE_URL` belirler; Neon'a geçiş = migration + aynı komut.

**İletişim formu (sonraki aşama için kayıt).** Resend ile gönderim; hedef adres site ayarlarından; ziyaretçinin
adresi `reply-to`; mesajlar veritabanına yazılmaz; spam için gizli tuzak alan ve süre kontrolü.

**Ortam değişkenleri.** `DATABASE_URL`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN` (opsiyonel),
`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`. `.env.example` commitlenir.

## Kabul kriterleri

- `pnpm dev` ile site ve `/admin` yerelde açılıyor; `pnpm seed` boş bir veritabanını doldurup ikinci kez
  çalıştırıldığında çift kayıt üretmiyor.
- `/`, `/eserler`, `/kitaplar` ve `en`/`ar` karşılıkları `tasarim/` ile aynı görünüyor (açık/koyu, 1280 ve 375
  genişlik); Arapça sağdan sola.
- Panelde bir eserin başlığı değiştirilince Eserler ve ana sayfa güncelleniyor, Kitaplar yeniden üretilmiyor.
- `pnpm build && pnpm start` sonrası sayfalar gezilirken veritabanına sorgu gitmiyor (Postgres sorgu günlüğü ya
  da Payload/Drizzle loglaması ile gösterilir).
- İngilizce sayfada çevirisi olmayan eser Türkçe başlığıyla görünüyor; menü ve butonlar İngilizce/Arapça.
- Menüdeki henüz yapılmamış sayfaların linkleri statik tasarım sayfalarını açıyor.
- `pnpm build` hatasız; konsol hatası yok.

## Kurucuya bırakılanlar

- Next.js / Payload paket sürümleri (yazım anındaki güncel kararlı sürümler).
- Bileşen ve klasör yapısı, CSS'in modüllere bölünüp bölünmeyeceği.
- `slug` üretimi (Türkçe karakterlerin dönüştürülmesi).
- Test yaklaşımı (seed ve önbellek davranışı için en azından otomatik bir kontrol beklenir).
