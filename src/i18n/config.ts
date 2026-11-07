export const LOCALES = ['tr', 'en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'tr'

export const dir = (l: Locale): 'ltr' | 'rtl' => (l === 'ar' ? 'rtl' : 'ltr')

export type PageKey = 'home' | 'eserler' | 'kitaplar'

export const ROUTES: Record<PageKey, Record<Locale, string>> = {
  home: { tr: '', en: '', ar: '' },
  eserler: { tr: 'eserler', en: 'works', ar: 'works' },
  kitaplar: { tr: 'kitaplar', en: 'books', ar: 'books' },
}

export const TASARIM_LINKS: Record<'yazilar' | 'videolar' | 'hayati' | 'iletisim', string> = {
  yazilar: '/tasarim/yazilar.html',
  videolar: '/tasarim/videolar.html',
  hayati: '/tasarim/hayati.html',
  iletisim: '/tasarim/iletisim.html',
}

const isLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s)

const keyFor = (segment: string, l: Locale): PageKey | null =>
  (Object.keys(ROUTES) as PageKey[]).find((k) => ROUTES[k][l] === segment) ?? null

/** Public URL path for a page in a locale (default locale has no prefix). */
export function localizedPath(key: PageKey, l: Locale): string {
  const seg = ROUTES[key][l]
  const prefix = l === DEFAULT_LOCALE ? '' : `/${l}`
  return `${prefix}/${seg}`.replace(/\/$/, '') || '/'
}

/**
 * Maps a public pathname to its page, a canonical redirect, or null (404).
 * Trailing slashes are ignored.
 */
export function resolvePath(
  pathname: string,
): { locale: Locale; key: PageKey } | { redirect: string } | null {
  const parts = pathname.split('/').filter(Boolean)
  const first = parts[0]

  if (first && isLocale(first)) {
    const rest = parts.slice(1)
    if (rest.length > 1) return null
    const segment = rest[0] ?? ''
    const key = keyFor(segment, first)
    if (!key) return null
    if (first === DEFAULT_LOCALE) return { redirect: localizedPath(key, DEFAULT_LOCALE) }
    return { locale: first, key }
  }

  if (parts.length > 1) return null
  const key = keyFor(parts[0] ?? '', DEFAULT_LOCALE)
  return key ? { locale: DEFAULT_LOCALE, key } : null
}
