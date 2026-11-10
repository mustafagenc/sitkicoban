import type { MetadataRoute } from 'next'

import { LOCALES, ROUTES, localizedPath, yaziPath, type Locale, type PageKey } from '@/i18n/config'
import { getYaziSluglari } from '@/lib/data'
import { siteUrl } from '@/lib/site'

/** Every page in every locale, each listing its translations so search engines show the right language. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const entry = (pathFor: (l: Locale) => string): MetadataRoute.Sitemap =>
    LOCALES.map((l) => ({
      url: base + pathFor(l),
      alternates: { languages: Object.fromEntries(LOCALES.map((x) => [x, base + pathFor(x)])) },
    }))

  // Onay sayfası kişiye özel bağlantıyla açılan bir işlem sayfasıdır: haritada yer almaz.
  const pages = (Object.keys(ROUTES) as PageKey[])
    .filter((key) => key !== 'bultenOnay')
    .flatMap((key) => entry((l) => localizedPath(key, l)))
  const yazilar = (await getYaziSluglari()).flatMap((slug) => entry((l) => yaziPath(slug, l)))
  return [...pages, ...yazilar]
}
