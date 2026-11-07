// Kabul kontrolü: çalışan bir üretim sunucusunda (pnpm build && pnpm start)
//  1) ziyaretçi gezintisi veritabanına hiç sorgu göndermiyor mu?
//  2) bir eserin başlığı panelden (REST) değişince Eserler ve ana sayfa (üç dilde) yeniden
//     üretiliyor, Kitaplar üretilmiyor mu; yeni başlık ilk ziyarette sorgusuz geliyor mu?
//
// Gerekli ortam değişkenleri:
//   SORGU_LOG   sunucunun da kullandığı sorgu günlüğü dosyası (payload.config.ts yazar)
//   SUNUCU_LOG  `pnpm start` çıktısının yönlendirildiği dosya ([yenile] satırı buradan okunur)
// .env'den: NEXT_PUBLIC_SITE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
import 'dotenv/config'
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs'

const BASE = process.env.NEXT_PUBLIC_SITE_URL
const SORGU_LOG = process.env.SORGU_LOG
const SUNUCU_LOG = process.env.SUNUCU_LOG
const EMAIL = process.env.SEED_ADMIN_EMAIL
const PASSWORD = process.env.SEED_ADMIN_PASSWORD

const SAYFALAR = ['/', '/eserler', '/kitaplar', '/en', '/en/works', '/en/books', '/ar', '/ar/works', '/ar/books']
const BEKLENEN_YENILEME = ['/eserler', '/', '/en/works', '/en', '/ar/works', '/ar']
const ILK_ZIYARET = ['/eserler', '/en/works', '/']

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function hata(mesaj) {
  console.error(`HATA: ${mesaj}`)
  process.exitCode = 1
  throw new Error(mesaj)
}

for (const [ad, deger] of Object.entries({ NEXT_PUBLIC_SITE_URL: BASE, SORGU_LOG, SUNUCU_LOG, SEED_ADMIN_EMAIL: EMAIL, SEED_ADMIN_PASSWORD: PASSWORD })) {
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
  console.error(`HATA: NEXT_PUBLIC_SITE_URL yerel değil (${SUNUCU_ADI}); betik yalnızca localhost, 127.0.0.1 veya ::1 ile çalışır`)
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

/** Başlığı REST ile değiştir: kancalar çalışan sunucunun içinde tetiklenir. */
async function basligiDegistir(token, id, baslik) {
  const res = await fetch(url(`/api/eserler/${id}?locale=tr`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ baslik }),
  })
  if (!res.ok) hata(`PATCH /api/eserler/${id} → HTTP ${res.status}: ${await res.text()}`)
}

/** Kaydet → [yenile] satırını doğrula → ısıtmanın bitmesini bekle. */
async function kaydetVeBekle(token, id, baslik) {
  const ofs = boyut(SUNUCU_LOG)
  await basligiDegistir(token, id, baslik)
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
}

async function main() {
  // 1) Ziyaretçi gezintisi: sıfır sorgu.
  writeFileSync(SORGU_LOG, '')
  for (const p of SAYFALAR) for (let i = 0; i < 3; i++) await getHtml(p)
  const gezinti = sorgular(0)
  if (gezinti.length) hata(`gezinti sırasında ${gezinti.length} sorgu:\n${gezinti.join('\n')}`)
  console.log('0 sorgu')

  // 2) Ana sayfanın ilk eserinin Türkçe başlığını değiştir.
  // Genel okuma kapalı: listeyi de oturum açarak (JWT) çek.
  const token = await girisYap()
  const liste = await fetch(
    url('/api/eserler?where[anasayfadaGoster][equals]=true&sort=anasayfaSira&limit=1&depth=0&locale=tr'),
    { headers: { Authorization: `JWT ${token}` } },
  ).then((r) => (r.ok ? r.json() : hata(`GET /api/eserler → HTTP ${r.status}`)))
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
    console.log(`ilk ziyarette yeni başlık, 0 sorgu: ${ILK_ZIYARET.join(', ')}`)
  } catch (e) {
    asilHata = e
  }
  // 3) Eski başlığı her durumda geri yükle (yine REST ile, önbellek de tazelensin).
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
}

main().then(
  () => process.exit(process.exitCode ?? 0),
  (e) => {
    if (!process.exitCode) console.error(e)
    process.exit(1)
  },
)
