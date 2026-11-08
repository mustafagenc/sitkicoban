# Kalan bölümler: Dersler, Yazılar, Hayatı + İcazet, Videolar, İletişim — 2. aşama

Tarih: 2026-11-07 · Dal: `develop` · Önceki aşama: `2026-11-07-altyapi-design.md`

## Amaç ve neden

1. aşamada altyapı kuruldu; Eserler, Kitaplar ve ana sayfanın eser/kitap kısımları panelden yönetiliyor. Geri
kalan her şey hâlâ statik tasarım kopyası (`/tasarim/*.html`) ya da ana sayfada sabit Türkçe JSX. Site sahibi
"neredeyse her şeyin panelden güncellenebilir olmasını" istedi. Bu aşama kalan bölümleri aynı kalıpla panele
taşır ve statik kopyalara olan bağımlılığı bitirir.

Sıra (kullanıcının onayladığı): Dersler → Yazılar → Hayatı + İcazet → Videolar → İletişim formu. Yayına alma
(Neon, Vercel, görsel optimizasyonu, main'e merge) bu aşamanın dışında, ayrı bir aşamadır.

## Hedefler

1. **Dersler (Duyurular):** ana sayfadaki "Bu dönem dersler" bölümü panelden yönetilir.
2. **Yazılar:** liste sayfası (kategori filtresi) ve yazı ayrıntı sayfası; gövde zengin metin editörüyle.
3. **Hayatı + İcazet:** Hayatı sayfası ve ana sayfadaki İcazet + Hayatı bölümleri panelden.
4. **Videolar:** liste (kategori filtresi), YouTube oynatıcı penceresi, seri bölümleri; ana sayfadaki Video
   bölümü panelden.
5. **İletişim:** sayfa panelden, form Resend ile e-posta gönderir.
6. Bunlar bittiğinde menüde ve sayfalarda `/tasarim/...` linki kalmaz; `public/tasarim` kopyası ve
   `tasarim-kopyala` betiği kaldırılır (`tasarim/` klasörü repoda referans olarak kalır).

## Hedef dışı

- Yayına alma: Neon, Vercel ortam değişkenleri, `next/image`, stilli 404, main'e merge.
- Arama, yorum, bülten, istatistik.
- Yazı/video için ayrı yazar sistemi (yazar her zaman Sıtkı Çoban).
- Mesajların veritabanında saklanması (kullanıcı kararı: yalnızca e-posta).

## Olmaması gerekenler

- 1. aşamanın kuralları aynen geçerli: ziyaretçi isteğinde veritabanına sorgu yok; yalnızca etiketle yenileme
  ve kayıt sonrası ısıtma; tasarımdan görünür sapma yok; eksik çeviri Türkçe görünür; görünen arayüz metni
  bileşen içine sabit yazılmaz, `ui-metinleri`'nden gelir.
- İletişim formu ziyaretçi isteğiyle veritabanına gitmemeli (form gönderimi bir ziyaretçi isteğidir).
- Spam kolayca geçmemeli; ama ziyaretçiye captcha çözdürülmez.
- Süresi geçmiş ders sitede görünmemeli.

## Kısıtlar

1. aşamadakiler (Next.js 16 + Payload 3, tr/en/ar, yerel Postgres, Blob, pnpm, Türkçe commit, Claude/
Co-Authored-By yok) aynen geçerli. Yeni sayfalar mevcut `[locale]` yapısına, proxy yollarına
(`src/i18n/config.ts` `ROUTES`), önbellek etiketlerine (`src/lib/cache/tags.ts`) ve `ui-metinleri` kalıbına
eklenir.

## Kullanıcının verdiği kararlar

- Kalan işler bu sırayla yapılır: Dersler, Yazılar, Hayatı, Videolar, İletişim.
- Duyurular için ayrı bir sayfa yok; dönem dersleri ana sayfada gösterilir (önceki konuşmada kararlaştırıldı).
- İletişim formu Resend ile belirli bir adrese gider; hedef adres site ayarlarından; mesaj veritabanına yazılmaz.
- Çeviri: arayüz metinleri ve bölüm başlıkları seed'de üç dilde; içerikler Türkçe girilir, sonra çevrilir.

## Benim kararlarım (değiştirilebilir)

**Ortak.**
- Her yeni koleksiyonun metin alanları (başlık, özet, gövde, açıklama) localized; tarih, görsel, link tek.
- Yeni sayfa anahtarları ve yollar: `yazilar` (`/yazilar`, `/en/writings`, `/ar/writings`), yazı ayrıntısı
  (`/yazilar/<slug>`, `/en/writings/<slug>`, `/ar/writings/<slug>`), `videolar` (`/videolar`, `/en/videos`,
  `/ar/videos`), `hayati` (`/hayati`, `/en/biography`, `/ar/biography`), `iletisim` (`/iletisim`,
  `/en/contact`, `/ar/contact`). Slug Türkçe başlıktan, üç dilde aynı.
- Ayrıntı sayfaları `generateStaticParams` ile tüm yazılar × 3 dil için üretilir; yeni yazı eklenince yeni
  sayfa kayıt sonrası ısıtma ile üretilir (statik parametre listesinde olmayan slug istenince, sayfa ilk kez
  sunucuda üretilip önbelleğe girer; bu yalnızca yayından sonraki ilk istek için bir sorgudur ve ısıtma bunu
  ziyaretçiden önce yapar).
- Zengin metin: Payload Lexical editörü. Yazı gövdesi için ek bloklar: **Âyet** (Arapça metin, meal, kaynak —
  tasarımdaki `.ayet`), **Öne çıkan söz** (`.pull`). Başlıklar (h2/h3), kalın/italik, link, liste, alıntı.
  Ön yüzde Lexical JSON'u sunucu tarafında HTML/React'e çevrilir; istemciye editör kodu gitmez.
- Okuma süresi gövdeden otomatik hesaplanır (dakikada ~200 kelime); panelde elle değiştirilebilir.
- Önbellek etiketleri: `dersler`, `yazilar`, `hayati`, `videolar`, `iletisim`; her biri yalnızca onu gösteren
  sayfaları yeniler (ör. ders kaydı → yalnızca ana sayfa ×3; yazı kaydı → yazılar listesi, o yazının ayrıntısı,
  ana sayfa, ve kitaplarda "ilgili yazılar" varsa kitaplar).

**Dersler.**
- Koleksiyon `dersler`, tasarımdaki satırlarla birebir: `kurum`*, `baslik`*, `altBaslik`* (opsiyonel,
  italik satır, ör. "Nokta'nın Seyri"), `aciklama`*, `gun`* (ör. "Her Cumartesi"), `saat` (ör.
  "09.00–11.00"), `yer`* (opsiyonel), `kontenjan` (opsiyonel), `afis` (media, opsiyonel), `bitis` (tarih,
  zorunlu), `sira`. Boş opsiyonel satırlar hiç çizilmez.
- Bitiş tarihi geçen ders ziyaretçi tarafında (istemcide) gizlenir, tasarımdaki gibi; tüm dersler bitmişse
  bölüm gizlenir. Ek olarak her gece değil, ders kaydedildiğinde sayfa yenilenir — gece kendiliğinden yenileme
  yok (zaman tabanlı yenileme yasak).
- Kayıt/bilgi linki İletişim sayfasına `?konu=Meşk` ile gider (yeni iletişim sayfasına).
- Seed: tasarımdaki iki ders (İMÜ afişli, Çamlıca "Her Cumartesi · 09.00–11.00"), bitiş tarihleri tasarımdaki
  gibi.

**Yazılar.**
- Koleksiyonlar `yazi-kategorileri` (`ad`*, `sira`; seed: Tefsir, Sanat, Edebiyat) ve `yazilar`: `baslik`*,
  `slug`, `kategori`, `ozet`*, `govde`* (Lexical), `tarih`, `okumaSuresi` (otomatik), `kapak` (opsiyonel),
  `kaynaklar`* (opsiyonel, tasarımdaki `.sources`), `ilgiliKitaplar` (opsiyonel ilişki), `yayinda` (taslak/yayında).
- Yalnızca `yayinda` olanlar sitede görünür. Payload'ın sürüm/taslak özelliği kullanılmaz (basit tutmak için).
- Liste sayfası tasarımdaki gibi: en yeni yazı büyük, diğerleri numaralı liste, kategori çipleri.
- Ayrıntı sayfası tasarımdaki gibi: kategori kırıntısı, başlık, özet, yazar · tarih · süre, gövde, kaynaklar,
  önceki/sonraki yazı, okuma ilerleme çubuğu.
- Ana sayfadaki "Son yazılar" bölümü en yeni 3 yazıyı gösterir.
- Kitap penceresindeki "İlgili yazılar" butonu, kitapla ilişkilendirilmiş yazı varsa Yazılar sayfasına o
  kitaba göre filtreli gider; yoksa gizlenir.
- Seed: tasarımdaki 7 yazının başlık/kategori/özet/tarihleri (tasarım bunları "taslak örneği" diye işaretliyor;
  Tefsir başlıkları gerçek). İlk yazıya tasarımdaki örnek gövde konur, diğerlerinin gövdesi boş, `yayinda`
  kapalı — böylece sitede yalnızca örnek gövdeli yazı görünür. Site sahibi gerçek metinleri panelden girer.

**Hayatı + İcazet.**
- Global `hayati`: kısa künye alanları (doğum*, eğitim*, görev*), giriş cümlesi*, portre (media),
  bölümler dizisi (`baslik`*, `govde`* Lexical) — sayfa içi "Bu sayfada" menüsü bölüm başlıklarından üretilir.
- Koleksiyon `hocalar` (İcazet): `ad`, `kalemler`* (ör. "Rik'a · Ta'lik"), `aciklama`*, `imza` (media),
  `sira`. Ana sayfadaki İcazet bölümü ve Hayatı sayfasındaki hoca kartları buradan.
- Ana sayfadaki Hayatı bölümü `hayati` global'inin kısa metninden (`anasayfaOzet`*).
- Seed: hayati.html'deki metin, iki hoca ve imzaları (`tasarim/img/imza-*.png`).

**Videolar.**
- Koleksiyonlar `video-kategorileri` (`ad`*; seed: Meşk, Söyleşi, Program) ve `videolar`: `baslik`*,
  `altBaslik`*, `youtube` (link ya da ID), `kategori`, `seri` (metin, opsiyonel), `bolum` (sayı), `sure`
  (metin, elle), `tarih`, `kanal` (opsiyonel), `aciklama`*, `kapak` (opsiyonel; yoksa YouTube kapağı
  `i.ytimg.com`), `sira`.
- YouTube'dan otomatik süre/kapak çekmek için API anahtarı gerekir; bunu kullanmıyorum. Kapak YouTube'un sabit
  kapak adresinden, süre elle girilir.
- Oynatıcı tasarımdaki gibi `youtube-nocookie.com` iframe'i, tıklanınca yüklenir (sayfa açılışında YouTube'a
  istek yok).
- Ana sayfadaki Video bölümü panelde işaretlenen bir videoyu gösterir.
- Seed: tasarımdaki tek gerçek video ("Affetmenin Hafifliği", `aLry4uypqxs`) yayında; diğer örnekler seed'e
  girmez (sahte içerik yayınlanmaz).

**İletişim.**
- Global `iletisim` ya da mevcut `site-ayarlari` genişletilir: sayfa açıklaması*, "ne için yazabilirsiniz"
  maddeleri* (dizi), konu seçenekleri* (dizi), aydınlatma metni* (Lexical) — aydınlatma metni ayrı bir sayfada
  (`/iletisim/aydinlatma` ve karşılıkları) gösterilir.
- Form: ad, e-posta, konu, telefon (opsiyonel), mesaj (en çok 2000), onay kutusu. `?konu=` ve `?eser=` ile
  önceden doldurma tasarımdaki gibi.
- Gönderim bir Next.js server action ya da route handler ile Resend'e gider; **veritabanına gitmez**: hedef
  adres ve gerekli metinler build sırasında sayfaya/önbelleğe alınmış veriden okunur (önbellekli getter), form
  isteğinde Payload sorgusu yapılmaz.
- Spam: gizli tuzak alan + formun açılışından gönderime kadar en az 3 saniye geçmesi kontrolü + ad/mesaj
  uzunluk sınırları. Captcha yok.
- Gönderen adresi `RESEND_FROM` (ör. `iletisim@sitkicoban.com`, Resend'de doğrulanmış alan adı gerekir),
  ziyaretçinin adresi `reply-to`. Yeni env: `RESEND_API_KEY`, `RESEND_FROM`. Anahtar yoksa form "şu an
  gönderilemiyor" der ve hata vermez; testlerde Resend taklit edilir.
- Başarılı/başarısız durum mesajları `ui-metinleri`'nden.

**Kapanış.**
- Tüm `TASARIM_LINKS` kullanımları gerçek yollara döner; `TASARIM_LINKS`, `scripts/tasarim-kopyala.mjs`,
  `predev/prebuild` kancaları ve `public/tasarim` kaldırılır; proxy eşleştiricisindeki `tasarim` istisnası
  kalkar. Ana sayfadaki sabit bölümler (`HomeStatic`) tamamen veriye bağlanmış olur.
- Kabul betiği (`scripts/sorgu-kontrol.mjs`) yeni sayfaları da gezer; iletişim formu gönderiminin sorgu
  üretmediğini de doğrular (Resend taklit adresine).
- Yeni migration(lar) üretilir.

## Kabul kriterleri

- Panelden ders eklemek/silmek ana sayfayı (3 dil) yeniler, başka sayfayı yenilemez; bitiş tarihi geçmiş ders
  görünmez.
- Panelden yazı eklemek: liste, yeni yazının ayrıntı sayfası ve ana sayfa yenilenir; yeni yazının sayfası ilk
  ziyaretçide sorgusuz açılır. `yayinda` kapalı yazı hiçbir yerde görünmez ve adresi 404.
- Yazı gövdesindeki Âyet ve Öne çıkan söz blokları tasarımdaki gibi görünür; Arapça satır sağdan sola.
- Hayatı, Videolar, İletişim, yazı listesi ve ayrıntısı `tasarim/` karşılıklarıyla aynı görünür (açık/koyu,
  1280 ve 375); `/ar` aynalanır.
- Video penceresi açılmadan YouTube'a istek gitmez; seri bölümleri arasında geçiş çalışır.
- İletişim formu Resend'e (testte taklit) doğru alanlarla gider; tuzak alan doluysa ya da 3 saniyeden hızlı
  gönderilirse e-posta gitmez ama ziyaretçiye başarılı görünür; form gönderiminde veritabanına sorgu gitmez.
- Kabul betiği yeni sayfalarla birlikte 0 sorgu verir; kodda `/tasarim/` linki kalmaz.
- `pnpm test:int`, `pnpm build` hatasız.

## Kurucuya bırakılanlar

- Lexical'ın ön yüzde hangi dönüştürücüyle çizileceği (`@payloadcms/richtext-lexical/react` önerilir).
- Seri/bölüm sıralamasının veri modelindeki ayrıntısı.
- Form gönderiminin server action mı route handler mı olacağı.
- Görev sırası ve test ayrıntıları; her bölüm kendi içinde tamamlanıp doğrulanabilir olmalı.
