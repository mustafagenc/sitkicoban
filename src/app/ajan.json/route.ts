import { toBooks } from '@/components/books'
import { toWorks } from '@/components/works'
import { localizedPath, yaziPath } from '@/i18n/config'
import { getDersler, getEserler, getKitaplar, getSiteAyarlari, getYazilar } from '@/lib/data'
import { mediaUrl } from '@/lib/media'
import { mutlak } from '@/lib/seo'
import { siteUrl } from '@/lib/site'
import type { Kitaplar, Media, YaziKategorileri } from '@/payload-types'

/**
 * WebMCP araçlarının (src/components/WebMcp.tsx) okuduğu, yalnızca herkese açık içerikten oluşan
 * özet. Statik üretilir; veri `unstable_cache` etiketleriyle gelir ve ilgili kayıtta yeniden
 * ısıtılır (AJAN_TAGS, src/lib/cache/revalidate.ts). Ziyaretçi isteği sorgu göndermez.
 */
export const dynamic = 'force-static'

const obj = <T extends object>(v: unknown): T | null => (v && typeof v === 'object' ? (v as T) : null)
const bos = (s: string | null | undefined): string | null => (s && s.trim() ? s.trim() : null)

export async function GET(): Promise<Response> {
  const base = siteUrl()
  const [eserler, kitaplar, yazilar, dersler, ayarlar] = await Promise.all([
    getEserler('tr'),
    getKitaplar('tr'),
    getYazilar('tr'),
    getDersler('tr'),
    getSiteAyarlari('tr'),
  ])

  const veri = {
    site: base,
    dil: 'tr',
    not: 'Content is in Turkish. Pages are also available in English (/en) and Arabic (/ar).',
    eserler: toWorks(eserler).map((w) => ({
      baslik: w.baslik,
      yaziTurleri: w.yaziTurleri,
      tur: w.tur,
      yil: w.yil,
      gorsel: mutlak(w.src),
      sayfa: base + localizedPath('eserler', 'tr'),
    })),
    kitaplar: toBooks(kitaplar).map((b) => ({
      baslik: b.baslik,
      altBaslik: b.altBaslik,
      rol: b.rol,
      asilYazar: b.asilYazar,
      yayinevi: b.yayinevi,
      yil: b.yil,
      isbn: b.isbn,
      satinAl: b.satinAlLinki,
      sayfa: base + localizedPath('kitaplar', 'tr'),
    })),
    yazilar: yazilar.flatMap((y) =>
      typeof y.slug === 'string' && y.slug
        ? [
            {
              baslik: y.baslik,
              ozet: y.ozet,
              kategori: obj<YaziKategorileri>(y.kategori)?.ad ?? null,
              tarih: y.tarih ?? null,
              ilgiliKitaplar: (y.ilgiliKitaplar ?? []).flatMap((k) => obj<Kitaplar>(k)?.baslik ?? []),
              url: base + yaziPath(y.slug, 'tr'),
            },
          ]
        : [],
    ),
    // Bitiş tarihi geçmiş dersler araçta süzülür (statik dosya her gün yeniden üretilmez).
    dersler: dersler.map((d) => ({
      kurum: d.kurum,
      baslik: d.baslik,
      altBaslik: bos(d.altBaslik),
      gun: bos(d.gun),
      saat: bos(d.saat),
      yer: bos(d.yer),
      kontenjan: bos(d.kontenjan),
      bitis: d.bitis,
      afis: (() => {
        const u = mediaUrl(obj<Media>(d.afis))
        return u ? mutlak(u) : null
      })(),
      kayit: `${base}${localizedPath('iletisim', 'tr')}?konu=mesk`,
    })),
    iletisim: {
      eposta: bos(ayarlar.eposta),
      telefon: bos(ayarlar.telefon),
      adres: bos(ayarlar.adres),
      instagram: bos(ayarlar.instagram),
      facebook: bos(ayarlar.facebook),
      youtube: bos(ayarlar.youtube),
      iletisimFormu: base + localizedPath('iletisim', 'tr'),
    },
  }

  return Response.json(veri)
}
