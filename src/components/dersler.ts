import { mediaUrl } from '@/lib/media'
import type { Dersler as DersDoc, Media } from '@/payload-types'

/** Ana sayfadaki ders kartının düz (serileştirilebilir) verisi. */
export type Ders = {
  id: number
  /** YYYY-MM-DD; bu tarihten sonra kart gizlenir. */
  bitis: string
  kurum: string
  baslik: string
  altBaslik: string | null
  aciklama: string | null
  gun: string
  saat: string | null
  yer: string | null
  kontenjan: string | null
  afis: { src: string; alt: string } | null
}

/** Bitiş tarihi bugünden önce olmayan dersler (bugün: YYYY-MM-DD, ziyaretçinin saat dilimi). */
export const aktifDersler = <T extends { bitis: string }>(list: T[], today: string): T[] =>
  list.filter((d) => d.bitis.slice(0, 10) >= today)

const text = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null)

/** getDersler çıktısını (depth 1) düz Ders listesine çevirir. */
export function toDersler(docs: DersDoc[]): Ders[] {
  return docs.map((d) => {
    const m = typeof d.afis === 'object' ? (d.afis as Media | null) : null
    const src = mediaUrl(m)
    return {
      id: d.id,
      bitis: d.bitis.slice(0, 10),
      kurum: d.kurum,
      baslik: d.baslik,
      altBaslik: text(d.altBaslik),
      aciklama: text(d.aciklama),
      gun: d.gun,
      saat: text(d.saat),
      yer: text(d.yer),
      kontenjan: text(d.kontenjan),
      afis: src ? { src, alt: m?.alt ?? '' } : null,
    }
  })
}
