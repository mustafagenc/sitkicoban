import type { MetadataRoute } from 'next'

import { portreUrl } from '@/components/hayati'
import { LOCALES, ROUTES, eserPath, localizedPath, yaziPath, type Locale, type PageKey } from '@/i18n/config'
import { getEserler, getHayati, getKitaplar, getYazilar } from '@/lib/data'
import { kanonikGorselYolu, kanonikMediaUrl } from '@/lib/media'
import { mutlak } from '@/lib/seo'
import { siteUrl } from '@/lib/site'
import type { Media } from '@/payload-types'

const gorselAdresi = (m: unknown): string | null => {
  const u = kanonikMediaUrl(m && typeof m === 'object' ? (m as Media) : null)
  return u ? new URL(mutlak(u)).href : null
}

const tekilGorseller = (liste: (string | null)[]): string[] => [...new Set(liste.filter((x): x is string => Boolean(x)))]

/**
 * Her sayfanın, her eserin ve her yazının üç dildeki adresi, çeviri bağlantıları (hreflang) ve
 * kendi alan adımızdan (`/media/...`) sunulan tam çözünürlüklü görselleri.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [eserlerDocs, kitaplar, hayati, yazilarDocs] = await Promise.all([
    getEserler('tr'),
    getKitaplar('tr'),
    getHayati('tr'),
    getYazilar('tr'),
  ])

  const secmeEserler = eserlerDocs
    .filter((e) => e.anasayfadaGoster)
    .sort((a, b) => (a.anasayfaSira ?? 0) - (b.anasayfaSira ?? 0))
  const portre = portreUrl(hayati) ? new URL(mutlak(kanonikGorselYolu(portreUrl(hayati)!))).href : null
  const sayfaGorselleri: Partial<Record<PageKey, string[]>> = {
    home: tekilGorseller([portre, ...secmeEserler.map((e) => gorselAdresi(e.gorsel))]),
    eserler: tekilGorseller(eserlerDocs.map((e) => gorselAdresi(e.gorsel))),
    kitaplar: tekilGorseller(kitaplar.map((k) => gorselAdresi(k.kapak))),
    hayati: tekilGorseller([portre]),
  }

  const entry = (pathFor: (l: Locale) => string, images?: string[], lastModified?: string): MetadataRoute.Sitemap =>
    LOCALES.map((l) => ({
      url: base + pathFor(l),
      alternates: { languages: Object.fromEntries(LOCALES.map((x) => [x, base + pathFor(x)])) },
      ...(lastModified ? { lastModified } : {}),
      ...(images && images.length > 0 ? { images } : {}),
    }))

  // Onay sayfası kişiye özel bağlantıyla açılan bir işlem sayfasıdır: haritada yer almaz.
  const pages = (Object.keys(ROUTES) as PageKey[])
    .filter((key) => key !== 'bultenOnay')
    .flatMap((key) => entry((l) => localizedPath(key, l), sayfaGorselleri[key]))

  const eserler = eserlerDocs
    .filter((e): e is typeof e & { slug: string } => typeof e.slug === 'string' && e.slug.length > 0)
    .flatMap((e) => entry((l) => eserPath(e.slug, l), tekilGorseller([gorselAdresi(e.gorsel)]), e.updatedAt))

  const yazilar = yazilarDocs
    .filter((y): y is typeof y & { slug: string } => typeof y.slug === 'string' && y.slug.length > 0)
    .flatMap((y) => entry((l) => yaziPath(y.slug, l), tekilGorseller([gorselAdresi(y.kapak)]), y.updatedAt))

  return [...pages, ...eserler, ...yazilar]
}
