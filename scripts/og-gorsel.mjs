// Varsayılan paylaşım görselini (public/og.jpg, 1200×630) ve Google arama önizleme
// görselini (public/thumbnail.jpg, 1200×1200 kare imza) üretir.
// Kullanım: node scripts/og-gorsel.mjs
import sharp from 'sharp'

const W = 1200
const H = 630
const KARE = 1200
const ZEMIN = '#f3ead8'
const MUREKKEP = '#2b2118'
const ALTIN = '#a8823a'

const imza = await sharp('public/imza.png').resize({ height: 300 }).png().toBuffer()
const { width: iw } = await sharp(imza).metadata()

const yazi = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${ALTIN}" stroke-opacity=".45" stroke-width="1.5"/>
  <text x="${W / 2}" y="470" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="64" fill="${MUREKKEP}">Sıtkı Çoban</text>
  <text x="${W / 2}" y="530" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="24" letter-spacing="6" fill="${ALTIN}">HATTAT · MÜELLİF · MUALLİM</text>
</svg>`)

await sharp({ create: { width: W, height: H, channels: 3, background: ZEMIN } })
  .composite([
    { input: imza, top: 70, left: Math.round((W - (iw ?? 0)) / 2) },
    { input: yazi, top: 0, left: 0 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile('public/og.jpg')

console.log('public/og.jpg yazıldı')

// Google arama sonuçlarındaki kare (1:1) önizleme alanı için yazısız, ortalı imza görseli.
const kareImza = await sharp('public/imza.png').resize({ width: 820, height: 820, fit: 'inside' }).png().toBuffer()
const { width: kw, height: kh } = await sharp(kareImza).metadata()
const kareCerceve = Buffer.from(`
<svg width="${KARE}" height="${KARE}" xmlns="http://www.w3.org/2000/svg">
  <rect x="36" y="36" width="${KARE - 72}" height="${KARE - 72}" fill="none" stroke="${ALTIN}" stroke-opacity=".45" stroke-width="2"/>
</svg>`)

await sharp({ create: { width: KARE, height: KARE, channels: 3, background: ZEMIN } })
  .composite([
    { input: kareImza, top: Math.round((KARE - (kh ?? 0)) / 2), left: Math.round((KARE - (kw ?? 0)) / 2) },
    { input: kareCerceve, top: 0, left: 0 },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile('public/thumbnail.jpg')

console.log('public/thumbnail.jpg yazıldı')
