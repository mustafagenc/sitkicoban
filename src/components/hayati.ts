import { localizedPath, TASARIM_LINKS, type Locale } from '@/i18n/config'
import { mediaUrl } from '@/lib/media'
import type { Hayati, Hocalar } from '@/payload-types'

export type Hoca = {
  id: number | string
  ad: string
  kalemler: string
  aciklama: string
  sayfaAciklama: string | null
  imza: { src: string; alt: string } | null
}

export function toHocalar(docs: Hocalar[]): Hoca[] {
  return docs.map((d) => {
    const m = d.imza && typeof d.imza === 'object' ? d.imza : null
    const src = mediaUrl(m)
    return {
      id: d.id,
      ad: d.ad,
      kalemler: d.kalemler,
      aciklama: d.aciklama,
      sayfaAciklama: d.sayfaAciklama || null,
      imza: m && src ? { src, alt: m.alt ?? '' } : null,
    }
  })
}

/** Portre: yüklenmiş görselin adresi (yoksa null). */
export function portreUrl(h: Pick<Hayati, 'portre'>): string | null {
  return h.portre && typeof h.portre === 'object' ? mediaUrl(h.portre) : null
}

/** Bölüm sonu bağlantısının adresi. Videolar sayfası Next'e taşınana dek tasarım sayfasına gider. */
export function sayfaHref(sayfa: 'eserler' | 'kitaplar' | 'yazilar' | 'videolar', locale: Locale): string {
  return sayfa === 'videolar' ? TASARIM_LINKS.videolar : localizedPath(sayfa, locale)
}
