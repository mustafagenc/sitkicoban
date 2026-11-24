import type { MetadataRoute } from 'next'

import { portreUrl } from '@/components/hayati'
import { LOCALES, ROUTES, localizedPath, yaziPath, type Locale, type PageKey } from '@/i18n/config'
import { getEserler, getHayati, getKitaplar, getYazilar } from '@/lib/data'
import { mediaUrl } from '@/lib/media'
import { mutlak } from '@/lib/seo'
import { siteUrl } from '@/lib/site'
import type { Media } from '@/payload-types'

const gorselAdresi = (m: unknown): string | null => {
  const u = mediaUrl(m && typeof m === 'object' ? (m as Media) : null)
  return u ? new URL(mutlak(u)).href : null
}

const tekilGorseller = (liste: (string | null)[]): string[] => [...new Set(liste.filter((x): x is string => Boolean(x)))]

/**
 * Her sayfanın her dildeki adresi, çeviri bağlantıları (hreflang) ve dizine girmesi istenen
 * tam çözünürlüklü görselleri (eserler, kitap kapakları, portre ve yazı kapakları).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [eserler, kitaplar, hayati, yazilarDocs] = await Promise.all([
    getEserler('tr'),
    getKitaplar('tr'),
    getHayati('tr'),
    getYazilar('tr'),
  ])

  const sayfaGorselleri: Partial<Record<PageKey, string[]>> = {
    eserler: tekilGorseller(eserler.map((e) => gorselAdresi(e.gorsel))),
    kitaplar: tekilGorseller(kitaplar.map((k) => gorselAdresi(k.kapak))),
    hayati: tekilGorseller([portreUrl(hayati) ? new URL(mutlak(portreUrl(hayati)!)).href : null]),
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

  const yazilar = yazilarDocs
    .filter((y): y is typeof y & { slug: string } => typeof y.slug === 'string' && y.slug.length > 0)
    .flatMap((y) => entry((l) => yaziPath(y.slug, l), tekilGorseller([gorselAdresi(y.kapak)]), y.updatedAt))

  return [...pages, ...yazilar]
}
