import type { Media } from '@/payload-types'

/**
 * Public URL for a media doc: the Blob URL for files stored on Blob, local /media/<file> otherwise.
 * Decided by the stored URL, not the token: docs uploaded before Blob was enabled keep a
 * /api/media/file/* URL, which needs login and wakes the DB, so they are served from disk.
 */
export function mediaUrl(m: Pick<Media, 'filename' | 'url'> | null | undefined): string | null {
  if (!m) return null
  if (m.url && /^https?:\/\//.test(m.url)) return m.url
  return m.filename ? `/media/${encodeURIComponent(m.filename)}` : null
}

/** Blob adresini kendi alan adımızdaki kanonik `/media/<dosya>` yoluna çevirir (sitemap, OG ve JSON-LD için). */
export function kanonikGorselYolu(src: string): string {
  const m = /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\/(.+)$/.exec(src)
  return m ? `/media/${m[1]}` : src
}

/** Bir medya kaydının kendi alan adımızdaki kanonik yolu (`/media/<dosya>`). */
export function kanonikMediaUrl(m: Pick<Media, 'filename' | 'url'> | null | undefined): string | null {
  if (!m) return null
  if (m.filename) return `/media/${encodeURIComponent(m.filename)}`
  const u = mediaUrl(m)
  return u ? kanonikGorselYolu(u) : null
}
