import type { Locale } from '@/i18n/config'
import { kanonikGorselYolu, mediaUrl } from '@/lib/media'
import type { EserTurleri, Eserler, Media, YaziTurleri } from '@/payload-types'

/** Galeri ve görüntüleyicinin kullandığı düz (serileştirilebilir) eser verisi. */
export type Work = {
  id: number
  slug: string
  baslik: string
  src: string
  /** Kendi alan adımızdaki kanonik görsel yolu (`/media/<dosya>`). */
  kanonikSrc: string
  width: number | null
  height: number | null
  /** en/boy oranı (en ÷ boy) */
  oran: number
  yaziTurleri: string[]
  tur: string | null
  yil: string | null
  metin: string | null
  anlam: string | null
  kaynak: string | null
  aciklama: string | null
  olcu: string | null
  malzeme: string | null
  tezhip: string | null
  ebru: string | null
}

export const HATTAT_ETIKETI: Record<Locale, string> = {
  tr: 'Hattat Sıtkı Çoban',
  en: 'Calligrapher Sıtkı Çoban',
  ar: 'الخطّاط سيتكي تشوبان',
}

const text = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null)

/** Hicrî yıl + karşılık gelen miladî yıllar: 1442 -> "1442 (2020–21)". Sayı değilse olduğu gibi. */
export function tarih(y: string): string {
  if (!/^\d{3,4}$/.test(y)) return y
  const n = +y
  const a = Math.floor((n - 1) * 0.970229 + 622.5)
  return `${n} (${a}–${String(a + 1).slice(2)})`
}

/** Arama motorları ve ekran okuyucular için sanatçı adını ve hat künyesini içeren `alt` metni. */
export function workAlt(
  w: Pick<Work, 'baslik' | 'yaziTurleri' | 'tur' | 'yil'>,
  locale: Locale = 'tr',
): string {
  const detay = [...w.yaziTurleri, w.tur, w.yil]
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join(' · ')
  return `${w.baslik} — ${HATTAT_ETIKETI[locale]}${detay ? ` (${detay})` : ''}`
}

/** Eser detay sayfasının arama açıklaması (`<meta name="description">`). */
export function workAciklama(
  w: Pick<Work, 'baslik' | 'yaziTurleri' | 'tur' | 'yil' | 'anlam' | 'kaynak' | 'aciklama'>,
  locale: Locale,
): string {
  const kunye = [...w.yaziTurleri, w.tur, w.yil].filter(Boolean).join(' · ')
  const govde = [w.aciklama, w.anlam && `“${w.anlam}”`, w.kaynak].filter(Boolean).join(' — ')
  const bas = `${HATTAT_ETIKETI[locale]}: ${w.baslik}${kunye ? ` (${kunye})` : ''}.`
  return govde ? `${bas} ${govde}` : bas
}

/** getEserler çıktısını (depth 1) düz Work listesine çevirir; görseli olmayan eserler atlanır. */
export function toWorks(docs: Eserler[]): Work[] {
  const out: Work[] = []
  for (const d of docs) {
    const g = typeof d.gorsel === 'object' ? (d.gorsel as Media | null) : null
    const src = mediaUrl(g)
    if (!g || !src) continue
    const width = g.width ?? null
    const height = g.height ?? null
    // Dosya değiştirilmişse saklı `oran` eskir; güncel boyutlar varsa onlardan hesapla.
    const oran = width && height ? width / height : d.oran || 1
    out.push({
      id: d.id,
      slug: typeof d.slug === 'string' && d.slug ? d.slug : String(d.id),
      baslik: d.baslik,
      src,
      kanonikSrc: kanonikGorselYolu(src),
      width,
      height,
      oran,
      yaziTurleri: (d.yaziTurleri ?? [])
        .map((y) => (typeof y === 'object' ? (y as YaziTurleri).ad : ''))
        .filter(Boolean),
      tur: typeof d.tur === 'object' && d.tur ? text((d.tur as EserTurleri).ad) : null,
      yil: text(d.yil),
      metin: text(d.metin),
      anlam: text(d.anlam),
      kaynak: text(d.kaynak),
      aciklama: text(d.aciklama),
      olcu: text(d.olcu),
      malzeme: text(d.malzeme),
      tezhip: text(d.tezhip),
      ebru: text(d.ebru),
    })
  }
  return out
}
