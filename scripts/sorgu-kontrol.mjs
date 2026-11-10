// Kabul kontrolü: çalışan bir üretim sunucusunda (pnpm build && pnpm start)
//  1) ziyaretçi gezintisi (üç dilde tüm sayfalar ve yayındaki bir yazı) veritabanına hiç sorgu göndermiyor mu?
//  2) bir eserin başlığı panelden (REST) değişince Eserler ve ana sayfa (üç dilde) yeniden
//     üretiliyor, Kitaplar üretilmiyor mu; yeni başlık ilk ziyarette sorgusuz geliyor mu?
//  3) bir ders kaydedilince yalnızca ana sayfa (üç dilde) yeniden üretiliyor mu?
//  4) iletişim formu gönderimi (sunucu eylemi, RESEND_API_KEY ayarsız) hiç sorgu göndermiyor mu?
//
// Sunucu `RESEND_API_KEY=` (boş) ile başlatılmalı: form gönderimi "unavailable" dönmezse betik hata verir.
//
// Gerekli ortam değişkenleri:
//   SORGU_LOG   sunucunun da kullandığı sorgu günlüğü dosyası (payload.config.ts yazar)
//   SUNUCU_LOG  `pnpm start` çıktısının yönlendirildiği dosya ([yenile] satırı buradan okunur)
// .env'den: SITE_URL (yoksa http://localhost:3000), SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
import 'dotenv/config'
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
// Sunucu eylemi gövdesi, tarayıcıdaki React istemcisinin ürettiği biçimde kodlanır.
const { encodeReply } = require('next/dist/compiled/react-server-dom-webpack/client.edge.js')

const BASE = process.env.SITE_URL || 'http://localhost:3000'
const SORGU_LOG = process.env.SORGU_LOG
const SUNUCU_LOG = process.env.SUNUCU_LOG
const EMAIL = process.env.SEED_ADMIN_EMAIL
const PASSWORD = process.env.SEED_ADMIN_PASSWORD

// src/i18n/config.ts ROUTES ile aynı: her sayfa üç dilde.
const YOLLAR = {
  tr: ['', 'eserler', 'kitaplar', 'yazilar', 'videolar', 'hayati', 'iletisim', 'iletisim/aydinlatma'],
  en: ['', 'works', 'books', 'writings', 'videos', 'biography', 'contact', 'contact/privacy'],
  ar: ['', 'works', 'books', 'writings', 'videos', 'biography', 'contact', 'contact/privacy'],
}
const onEk = (l) => (l === 'tr' ? '' : `/${l}`)
const SAYFALAR = Object.entries(YOLLAR).flatMap(([l, yollar]) => yollar.map((y) => `${onEk(l)}/${y}`.replace(/\/$/, '') || '/'))
const YAZILAR = { tr: 'yazilar', en: 'writings', ar: 'writings' }
const ANASAYFA = ['/', '/en', '/ar']
const BEKLENEN_YENILEME = ['/eserler', '/', '/en/works', '/en', '/ar/works', '/ar', '/hayati', '/en/biography', '/ar/biography', '/llms.txt']
const ILK_ZIYARET = ['/eserler', '/en/works', '/']
// Eser başlığını göstermeyen ama aynı etiketle ısıtılan sayfalar: yalnızca sorgusuz açıldığı doğrulanır.
const ILK_ZIYARET_SORGUSUZ = ['/en/biography']

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function hata(mesaj) {
  console.error(`HATA: ${mesaj}`)
  process.exitCode = 1
  throw new Error(mesaj)
}

for (const [ad, deger] of Object.entries({ SITE_URL: BASE, SORGU_LOG, SUNUCU_LOG, SEED_ADMIN_EMAIL: EMAIL, SEED_ADMIN_PASSWORD: PASSWORD })) {
  if (!deger) {
    console.error(`HATA: ${ad} ayarlı değil`)
    process.exit(1)
  }
}
if (!existsSync(SUNUCU_LOG)) {
  console.error(`HATA: SUNUCU_LOG bulunamadı: ${SUNUCU_LOG}`)
  process.exit(1)
}

// Betik yönetici bilgisini gönderir ve içerik düzenler: yalnızca yerel sunucuya karşı çalışır.
const SUNUCU_ADI = new URL(BASE).hostname.replace(/^\[|\]$/g, '')
if (!['localhost', '127.0.0.1', '::1'].includes(SUNUCU_ADI)) {
  console.error(`HATA: SITE_URL yerel değil (${SUNUCU_ADI}); betik yalnızca localhost, 127.0.0.1 veya ::1 ile çalışır`)
  process.exit(1)
}

const url = (p) => new URL(p, BASE).toString()
const boyut = (f) => (existsSync(f) ? statSync(f).size : 0)
const okuFrom = (f, ofs) => (existsSync(f) ? readFileSync(f).subarray(ofs).toString('utf8') : '')
const sorgular = (ofs) => okuFrom(SORGU_LOG, ofs).split('\n').filter(Boolean)

async function getHtml(p) {
  const res = await fetch(url(p), { redirect: 'manual' })
  if (res.status !== 200) hata(`${p} → HTTP ${res.status}`)
  return res.text()
}

/** HTML içinde metin (React kaçışlarıyla birlikte) geçiyor mu? */
function icerir(html, metin) {
  const kacisli = metin.replace(/&/g, '&amp;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;')
  return html.includes(metin) || html.includes(kacisli)
}

/** Sorgu günlüğü `sureMs` boyunca büyümeyene kadar bekle (ısıtma bitti). */
async function sessizlikBekle(sureMs = 2000, enFazlaMs = 30000) {
  const bitis = Date.now() + enFazlaMs
  let son = boyut(SORGU_LOG)
  let sabitten = Date.now()
  while (Date.now() < bitis) {
    await sleep(200)
    const b = boyut(SORGU_LOG)
    if (b !== son) {
      son = b
      sabitten = Date.now()
    } else if (Date.now() - sabitten >= sureMs) return
  }
  hata('sorgu günlüğü durulmadı (ısıtma bitmedi)')
}

/** Sunucu günlüğünde ofsetten sonra çıkan [yenile] satırını bekle. */
async function yenileSatiri(ofs, enFazlaMs = 15000) {
  const bitis = Date.now() + enFazlaMs
  while (Date.now() < bitis) {
    const satir = okuFrom(SUNUCU_LOG, ofs)
      .split('\n')
      .find((s) => s.includes('[yenile]'))
    if (satir) return satir.slice(satir.indexOf('[yenile]') + '[yenile]'.length).trim().split(',').filter(Boolean)
    await sleep(200)
  }
  hata('sunucu günlüğünde [yenile] satırı görünmedi')
}

async function girisYap() {
  const res = await fetch(url('/api/users/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!res.ok) hata(`giriş başarısız (HTTP ${res.status}); SEED_ADMIN_* bilgilerini kontrol edin`)
  const { token } = await res.json()
  return token
}

/** Kaydı REST ile değiştir: kancalar çalışan sunucunun içinde tetiklenir. */
async function degistir(token, koleksiyon, id, veri) {
  const res = await fetch(url(`/api/${koleksiyon}/${id}?locale=tr`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(veri),
  })
  if (!res.ok) hata(`PATCH /api/${koleksiyon}/${id} → HTTP ${res.status}: ${await res.text()}`)
}

/** Oturumlu REST okuması (genel okuma kapalı). */
async function oku(token, yol) {
  const res = await fetch(url(yol), { headers: { Authorization: `JWT ${token}` } })
  if (!res.ok) hata(`GET ${yol} → HTTP ${res.status}`)
  return res.json()
}

/** Kaydet → [yenile] satırını doğrula → ısıtmanın bitmesini bekle. */
async function kaydetVeBekle(token, id, baslik, koleksiyon = 'eserler', veri = { baslik }) {
  const ofs = boyut(SUNUCU_LOG)
  await degistir(token, koleksiyon, id, veri)
  const yollar = await yenileSatiri(ofs)
  await sleep(3000)
  await sessizlikBekle()
  return yollar
}

/** Isıtılmış sayfaların ilk ziyarette yeni başlığı sorgusuz verdiğini doğrula. */
async function ilkZiyaret(baslik) {
  for (const p of ILK_ZIYARET) {
    const ofs = boyut(SORGU_LOG)
    const html = await getHtml(p)
    const yeni = sorgular(ofs)
    if (!icerir(html, baslik)) hata(`${p} yeni başlığı ("${baslik}") içermiyor`)
    if (yeni.length) hata(`${p} ilk ziyarette ${yeni.length} sorgu gönderdi:\n${yeni.join('\n')}`)
  }
  for (const p of ILK_ZIYARET_SORGUSUZ) {
    const ofs = boyut(SORGU_LOG)
    await getHtml(p)
    const yeni = sorgular(ofs)
    if (yeni.length) hata(`${p} ilk ziyarette ${yeni.length} sorgu gönderdi:\n${yeni.join('\n')}`)
  }
}

/** İletişim sayfasının sunucu eylemi kimliği (derleme çıktısından). */
function iletisimEylemi() {
  const dosya = '.next/server/server-reference-manifest.json'
  if (!existsSync(dosya)) hata(`${dosya} yok: önce pnpm build`)
  const manifest = JSON.parse(readFileSync(dosya, 'utf8'))
  const id = Object.entries(manifest.node ?? {}).find(
    ([, v]) => v.exportedName === 'sendContact' && v.filename.endsWith('iletisim/actions.ts'),
  )?.[0]
  if (!id) hata('sendContact eylemi derleme çıktısında bulunamadı')
  return id
}

/** Formu tarayıcının yaptığı gibi sunucu eylemiyle gönder; sorgu sayısını ve sonucu doğrula. */
async function formuGonder() {
  const fd = new FormData()
  for (const [k, v] of Object.entries({
    ad: 'Kabul Kontrolü',
    eposta: 'kabul@example.com',
    konu: 'Diğer',
    telefon: '',
    mesaj: 'sorgu-kontrol test gönderimi',
    onay: 'on',
    website: '',
    t: String(Date.now() - 10_000),
    locale: 'tr',
  }))
    fd.set(k, v)
  const govde = await encodeReply([{ status: 'idle' }, fd])
  const ofs = boyut(SORGU_LOG)
  const res = await fetch(url('/iletisim'), {
    method: 'POST',
    headers: { 'Next-Action': iletisimEylemi(), Accept: 'text/x-component' },
    body: govde,
  })
  const metin = await res.text()
  if (res.status !== 200) hata(`form gönderimi → HTTP ${res.status}`)
  const yeni = sorgular(ofs)
  if (yeni.length) hata(`form gönderimi ${yeni.length} sorgu gönderdi:\n${yeni.join('\n')}`)
  if (!metin.includes('"status":"unavailable"')) {
    hata(`form gönderimi "unavailable" dönmedi (sunucu RESEND_API_KEY= ile mi başlatıldı?): ${metin.slice(0, 300)}`)
  }
  console.log('form gönderimi: unavailable, 0 sorgu')
}

async function main() {
  // Genel okuma kapalı: listeleri oturum açarak (JWT) çek. Gezintiden önce: bu istekler sorgu yapar.
  const token = await girisYap()
  const yazi = (await oku(token, '/api/yazilar?where[yayinda][equals]=true&sort=-tarih&limit=1&depth=0')).docs?.[0]
  if (!yazi) hata('yayında yazı yok')
  const yaziSayfalari = Object.entries(YAZILAR).map(([l, y]) => `${onEk(l)}/${y}/${yazi.slug}`)
  await sessizlikBekle()

  // 1) Ziyaretçi gezintisi: sıfır sorgu.
  writeFileSync(SORGU_LOG, '')
  const gezilen = [...SAYFALAR, ...yaziSayfalari, '/llms.txt']
  for (const p of gezilen) for (let i = 0; i < 3; i++) await getHtml(p)
  const gezinti = sorgular(0)
  if (gezinti.length) hata(`gezinti sırasında ${gezinti.length} sorgu:\n${gezinti.join('\n')}`)
  console.log(`0 sorgu: ${gezilen.length} sayfa × 3 (${gezilen.join(' ')})`)

  // 2) İletişim formu: sıfır sorgu.
  await formuGonder()

  // 3) Ana sayfanın ilk eserinin Türkçe başlığını değiştir.
  const liste = await oku(token, '/api/eserler?where[anasayfadaGoster][equals]=true&sort=anasayfaSira&limit=1&depth=0&locale=tr')
  const eser = liste.docs?.[0]
  if (!eser) hata('ana sayfada gösterilen eser yok')
  const eski = eser.baslik
  const yeniBaslik = `${eski} (test)`

  let asilHata
  try {
    const yollar = await kaydetVeBekle(token, eser.id, yeniBaslik)
    const fazla = yollar.filter((y) => !BEKLENEN_YENILEME.includes(y))
    const eksik = BEKLENEN_YENILEME.filter((y) => !yollar.includes(y))
    if (fazla.length || eksik.length) hata(`yenilenen yollar beklenenden farklı: ${yollar.join(', ')}`)
    if (yollar.some((y) => y === '/kitaplar' || y.endsWith('/books'))) hata('Kitaplar yeniden üretildi')
    console.log(`yenilendi: ${yollar.join(', ')}`)

    await ilkZiyaret(yeniBaslik)
    console.log(`ilk ziyarette yeni başlık, 0 sorgu: ${[...ILK_ZIYARET, ...ILK_ZIYARET_SORGUSUZ].join(', ')}`)
  } catch (e) {
    asilHata = e
  }
  // Eski başlığı her durumda geri yükle (yine REST ile, önbellek de tazelensin).
  // Geri yükleme de başarısız olursa asıl hata gizlenmez.
  try {
    await kaydetVeBekle(token, eser.id, eski)
    await ilkZiyaret(eski)
    console.log(`geri yüklendi: "${eski}"`)
  } catch (e) {
    console.error(`UYARI: başlık geri yüklenemedi (eser ${eser.id}, "${eski}"): ${e.message}`)
    process.exitCode = 1
    asilHata ??= e
  }
  if (asilHata) throw asilHata

  // 4) Bir dersin kurumunu değiştir: yalnızca ana sayfa (üç dilde) yenilenir; sonra geri yükle.
  const ders = (await oku(token, '/api/dersler?limit=1&depth=0&locale=tr')).docs?.[0]
  if (!ders) hata('ders yok')
  try {
    const yollar = await kaydetVeBekle(token, ders.id, null, 'dersler', { kurum: `${ders.kurum} (test)` })
    const fazla = yollar.filter((y) => !ANASAYFA.includes(y))
    const eksik = ANASAYFA.filter((y) => !yollar.includes(y))
    if (fazla.length || eksik.length) hata(`ders kaydında yenilenen yollar beklenenden farklı: ${yollar.join(', ')}`)
    console.log(`ders kaydı yeniledi: ${yollar.join(', ')}`)
  } finally {
    await kaydetVeBekle(token, ders.id, null, 'dersler', { kurum: ders.kurum })
    console.log(`ders geri yüklendi: "${ders.kurum}"`)
  }
}

main().then(
  () => process.exit(process.exitCode ?? 0),
  (e) => {
    if (!process.exitCode) console.error(e)
    process.exit(1)
  },
)
