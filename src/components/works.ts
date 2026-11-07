import { mediaUrl } from '@/lib/media'
import type { EserTurleri, Eserler, Media, YaziTurleri } from '@/payload-types'

/** Galeri ve görüntüleyicinin kullandığı düz (serileştirilebilir) eser verisi. */
export type Work = {
  id: number
  baslik: string
  src: string
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

const text = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null)

/** getEserler çıktısını (depth 1) düz Work listesine çevirir; görseli olmayan eserler atlanır. */
export function toWorks(docs: Eserler[]): Work[] {
  const out: Work[] = []
  for (const d of docs) {
    const g = typeof d.gorsel === 'object' ? (d.gorsel as Media | null) : null
    const src = mediaUrl(g)
    if (!g || !src) continue
    const width = g.width ?? null
    const height = g.height ?? null
    const oran = d.oran || (width && height ? width / height : 1)
    out.push({
      id: d.id,
      baslik: d.baslik,
      src,
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
