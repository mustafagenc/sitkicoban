import { yaziPath, type Locale } from '@/i18n/config'
import { mediaUrl } from '@/lib/media'
import type { Kitaplar, Media, UiMetinleri, YaziKategorileri, Yazilar } from '@/payload-types'

/** Yazı listesi, ana sayfa bölümü ve ayrıntı sayfasının kullandığı düz (serileştirilebilir) yazı verisi. */
export type YaziItem = {
  id: number
  slug: string
  href: string
  baslik: string
  ozet: string
  kategoriId: number | null
  kategori: string | null
  /** "Mart 2025" gibi, dile göre biçimlenmiş. */
  tarih: string | null
  /** "9 dk okuma" gibi, arayüz metninden. */
  okuma: string | null
  kapak: { src: string; alt: string } | null
  /** İlgili kitaplar (?kitap= süzgeci için slug ve ad). */
  kitaplar: { slug: string; baslik: string }[]
}

/** Yazar adı: özel ad, çevrilmez. */
export const YAZAR = 'Sıtkı Çoban'

/** Ay ve yıl, ziyaretçinin diliyle (tarihler UTC gece yarısı saklanır). */
export function formatTarih(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d)
}

/** Okuma süresi metni: arayüz metnindeki {n} dakikayla değişir; süre ya da metin yoksa null. */
export function okumaMetni(ui: UiMetinleri, dakika: number | null | undefined): string | null {
  if (typeof dakika !== 'number' || dakika < 1 || !ui.okumaSuresi) return null
  return ui.okumaSuresi.replace('{n}', String(dakika))
}

const obj = <T extends object>(v: unknown): T | null => (v && typeof v === 'object' ? (v as T) : null)

/** Yazı belgelerinin (depth 1) listesini düz YaziItem listesine çevirir; sıra korunur. */
export function toYazilar(docs: Yazilar[], ui: UiMetinleri, locale: Locale): YaziItem[] {
  return docs.flatMap((d) => {
    if (!d.slug) return []
    const kat = obj<YaziKategorileri>(d.kategori)
    const m = obj<Media>(d.kapak)
    const src = mediaUrl(m)
    const kitaplar = (d.ilgiliKitaplar ?? []).flatMap((k) => {
      const o = obj<Kitaplar>(k)
      return o?.slug ? [{ slug: o.slug, baslik: o.baslik ?? '' }] : []
    })
    return [
      {
        id: d.id,
        slug: d.slug,
        href: yaziPath(d.slug, locale),
        baslik: d.baslik,
        ozet: d.ozet,
        kategoriId: kat?.id ?? null,
        kategori: kat?.ad ?? null,
        tarih: formatTarih(d.tarih, locale),
        okuma: okumaMetni(ui, d.okumaSuresi),
        kapak: src ? { src, alt: m?.alt ?? '' } : null,
        kitaplar,
      },
    ]
  })
}

/** Yayında ilgili yazısı olan kitapların slug'ları (Kitap penceresindeki İlgili yazılar için). */
export const yaziliKitaplar = (yazilar: YaziItem[]): string[] => [
  ...new Set(yazilar.flatMap((y) => y.kitaplar.map((k) => k.slug))),
]
