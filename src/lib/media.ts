import type { Media } from '@/payload-types'

/** Public URL for a media doc: blob URL when Blob storage is on, local /media/<file> otherwise. */
export function mediaUrl(m: Pick<Media, 'filename' | 'url'> | null | undefined): string | null {
  if (!m) return null
  if (process.env.BLOB_READ_WRITE_TOKEN && m.url) return m.url
  return m.filename ? `/media/${encodeURIComponent(m.filename)}` : (m.url ?? null)
}
