import type { Metadata } from 'next'

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/config'
import { siteUrl } from '@/lib/site'

export const SITE_NAME = 'Sıtkı Çoban'

/** Paylaşım kartlarında kullanılan varsayılan görsel (public/og.jpg, 1200×630). */
export const OG_DEFAULT: { url: string; width?: number; height?: number; alt?: string } = {
  url: '/og.jpg',
  width: 1200,
  height: 630,
}

/** Google arama sonuçlarındaki kare önizleme alanı için varsayılan imza görseli (public/thumbnail.jpg, 1200×1200). */
export const THUMBNAIL_DEFAULT: { url: string; width: number; height: number } = {
  url: '/thumbnail.jpg',
  width: 1200,
  height: 1200,
}

const OG_LOCALE: Record<Locale, string> = { tr: 'tr_TR', en: 'en_US', ar: 'ar_AR' }

/** Göreli adresleri (ör. /media/x.jpg) site adresine göre tam adrese çevirir. */
export const mutlak = (url: string): string => (/^https?:\/\//.test(url) ? url : siteUrl() + url)

type Secenek = {
  locale: Locale
  /** Bu sayfanın her dildeki yolu (ör. l => localizedPath('eserler', l)). */
  yol: (l: Locale) => string
  /** Sayfa adı; site adı başlık şablonuyla eklenir. Boşsa yalnızca site adı. */
  baslik?: string | null
  aciklama?: string | null
  gorsel?: { url: string; width?: number; height?: number; alt?: string } | null
  /** Yazılar için makale bilgisi. */
  makale?: { yayin?: string | null; guncelleme?: string | null }
}

/**
 * Bir sayfanın arama ve paylaşım bilgileri: kanonik adres, üç dildeki karşılıkları (hreflang),
 * Open Graph ve X (Twitter) kartı.
 */
export function sayfaMeta({ locale, yol, baslik, aciklama, gorsel, makale }: Secenek): Metadata {
  const base = siteUrl()
  const url = base + yol(locale)
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, base + yol(l)]))
  languages['x-default'] = base + yol(DEFAULT_LOCALE)
  const tamBaslik = baslik ? `${baslik} · ${SITE_NAME}` : SITE_NAME
  const g = gorsel ?? OG_DEFAULT
  const onizlemeUrl = mutlak((gorsel ?? THUMBNAIL_DEFAULT).url)
  const birincilGorsel = { ...g, url: mutlak(g.url), alt: g.alt ?? tamBaslik }
  const ogGorseller = gorsel
    ? [birincilGorsel]
    : [birincilGorsel, { ...THUMBNAIL_DEFAULT, url: onizlemeUrl, alt: tamBaslik }]
  return {
    // Boş başlık/açıklama anahtarı hiç verilmez: verilirse yerleşimdeki varsayılanı siler.
    ...(baslik ? { title: baslik } : {}),
    ...(aciklama ? { description: aciklama } : {}),
    alternates: { canonical: url, languages },
    robots: { 'max-image-preview': 'large' },
    other: { thumbnail: onizlemeUrl },
    openGraph: {
      title: tamBaslik,
      description: aciklama || undefined,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: ogGorseller,
      ...(makale
        ? {
            type: 'article' as const,
            publishedTime: makale.yayin ?? undefined,
            modifiedTime: makale.guncelleme ?? undefined,
            authors: [SITE_NAME],
          }
        : { type: 'website' as const }),
    },
    twitter: { card: 'summary_large_image', title: tamBaslik, description: aciklama || undefined, images: [birincilGorsel] },
  }
}
