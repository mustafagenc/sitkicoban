import { mediaUrl } from '@/lib/media'
import type { Kitaplar, Media, UiMetinleri } from '@/payload-types'

export type BookRole = 'yazar' | 'hazirlayan' | 'sadelestiren' | 'derleyen'

/** Raf, kapak ve ayrıntı penceresinin kullandığı düz (serileştirilebilir) kitap verisi. */
export type Book = {
  id: number
  /** Adres parçası; İlgili yazılar bağlantısı (?kitap=) için. */
  slug: string | null
  baslik: string
  altBaslik: string | null
  rol: BookRole | null
  asilYazar: string | null
  /** Kapak görseli; yoksa yazı kapak çizilir. */
  src: string | null
  contain: boolean
  yayinevi: string | null
  yil: string | null
  sayfa: string | null
  isbn: string | null
  aciklama: string | null
  satinAlLinki: string | null
}

export const ROLE_ORDER: BookRole[] = ['yazar', 'hazirlayan', 'sadelestiren', 'derleyen']

const ROLE_KEY = {
  yazar: 'rolYazar',
  hazirlayan: 'rolHazirlayan',
  sadelestiren: 'rolSadelestiren',
  derleyen: 'rolDerleyen',
} as const satisfies Record<BookRole, keyof UiMetinleri>

/** Rol değerinin arayüz metni; rol yoksa boş. */
export const roleLabel = (ui: UiMetinleri, rol: BookRole | null): string =>
  rol ? (ui[ROLE_KEY[rol]] ?? '') : ''

const text = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null)

/** getKitaplar çıktısını (depth 1) düz Book listesine çevirir. */
export function toBooks(docs: Kitaplar[]): Book[] {
  return docs.map((d) => {
    const m = typeof d.kapak === 'object' ? (d.kapak as Media | null) : null
    return {
      id: d.id,
      slug: text(d.slug),
      baslik: d.baslik,
      altBaslik: text(d.altBaslik),
      rol: d.rol ?? null,
      asilYazar: text(d.asilYazar),
      src: mediaUrl(m),
      contain: Boolean(d.kapakSigdir),
      yayinevi: text(d.yayinevi),
      yil: text(d.yil),
      sayfa: typeof d.sayfa === 'number' ? String(d.sayfa) : null,
      isbn: text(d.isbn),
      aciklama: text(d.aciklama),
      satinAlLinki: text(d.satinAlLinki),
    }
  })
}

/** Sıtkı Bey'in adı: kapakta ve künyede asıl yazar yoksa görünür (özel ad, çevrilmez). */
export const AUTHOR_FALLBACK = 'Sıtkı Çoban'
