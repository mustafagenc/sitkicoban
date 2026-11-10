export const LOCALES = ['tr', 'en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'tr'

export const dir = (l: Locale): 'ltr' | 'rtl' => (l === 'ar' ? 'rtl' : 'ltr')

export type PageKey =
  | 'home'
  | 'eserler'
  | 'kitaplar'
  | 'yazilar'
  | 'videolar'
  | 'hayati'
  | 'iletisim'
  | 'aydinlatma'
  | 'bulten'
  | 'bultenOnay'

export const ROUTES: Record<PageKey, Record<Locale, string>> = {
  home: { tr: '', en: '', ar: '' },
  eserler: { tr: 'eserler', en: 'works', ar: 'works' },
  kitaplar: { tr: 'kitaplar', en: 'books', ar: 'books' },
  yazilar: { tr: 'yazilar', en: 'writings', ar: 'writings' },
  videolar: { tr: 'videolar', en: 'videos', ar: 'videos' },
  hayati: { tr: 'hayati', en: 'biography', ar: 'biography' },
  iletisim: { tr: 'iletisim', en: 'contact', ar: 'contact' },
  aydinlatma: { tr: 'iletisim/aydinlatma', en: 'contact/privacy', ar: 'contact/privacy' },
  bulten: { tr: 'bulten', en: 'newsletter', ar: 'newsletter' },
  bultenOnay: { tr: 'bulten/onay', en: 'newsletter/confirm', ar: 'newsletter/confirm' },
}

const SLUG_RE = /^[a-z0-9-]+$/

export const isLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s)

const keyFor = (segment: string, l: Locale): PageKey | null =>
  (Object.keys(ROUTES) as PageKey[]).find((k) => ROUTES[k][l] === segment) ?? null

/** Public URL path for a page in a locale (default locale has no prefix). */
export function localizedPath(key: PageKey, l: Locale): string {
  const seg = ROUTES[key][l]
  const prefix = l === DEFAULT_LOCALE ? '' : `/${l}`
  return `${prefix}/${seg}`.replace(/\/$/, '') || '/'
}

/** Public URL path of a single writing. */
export function yaziPath(slug: string, l: Locale): string {
  return `${localizedPath('yazilar', l)}/${slug}`
}

export type Resolved =
  | { locale: Locale; key: PageKey }
  | { locale: Locale; key: 'yazi'; slug: string }
  | { redirect: string }

/**
 * Matches the segments against pages and the writing detail route. A default-locale
 * prefix (`/tr/...`) is only valid as a redirect to the bare canonical path.
 */
function match(segments: string[], l: Locale, prefixed: boolean): Resolved | null {
  const joined = segments.join('/')
  const key = keyFor(joined, l)
  const slug =
    segments.length === 2 && segments[0] === ROUTES.yazilar[l] && SLUG_RE.test(segments[1])
      ? segments[1]
      : null
  if (!key && slug === null) return null
  if (prefixed && l === DEFAULT_LOCALE) {
    return { redirect: key ? localizedPath(key, l) : yaziPath(slug!, l) }
  }
  return key ? { locale: l, key } : { locale: l, key: 'yazi', slug: slug! }
}

/**
 * Maps a public pathname to its page, a canonical redirect, or null (404).
 * Trailing slashes are ignored.
 */
export function resolvePath(pathname: string): Resolved | null {
  const parts = pathname.split('/').filter(Boolean)
  const first = parts[0]
  if (first && isLocale(first)) return match(parts.slice(1), first, true)
  return match(parts, DEFAULT_LOCALE, false)
}

/** Internal (rewrite target) route of a resolved page. */
export function internalPath(r: { locale: Locale; key: PageKey | 'yazi'; slug?: string }): string {
  if (r.key === 'yazi') return `/${r.locale}/yazilar/${r.slug}`
  if (r.key === 'home') return `/${r.locale}`
  if (r.key === 'aydinlatma') return `/${r.locale}/iletisim/aydinlatma`
  if (r.key === 'bultenOnay') return `/${r.locale}/bulten/onay`
  return `/${r.locale}/${r.key}`
}
