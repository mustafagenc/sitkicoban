import type { FieldHook } from 'payload'

const MAP: Record<string, string> = {
  ş: 's', Ş: 's', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', I: 'i', ö: 'o', Ö: 'o',
  ü: 'u', Ü: 'u', ç: 'c', Ç: 'c', â: 'a', Â: 'a', î: 'i', Î: 'i', û: 'u', Û: 'u',
}

export function slugify(s: string): string {
  return s
    .replace(/[ŞşĞğıİIÖöÜüÇçÂâÎîÛû]/g, (c) => MAP[c] ?? c)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’‘`´ʼʿʾ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function titleOf(v: unknown): string | undefined {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && typeof (v as Record<string, unknown>).tr === 'string') {
    return (v as Record<string, string>).tr
  }
  return undefined
}

/** Fills `slug` from the Turkish `baslik` when empty; appends -2, -3… on collision. */
export const uniqueSlug =
  (collection: 'eserler' | 'kitaplar' | 'yazilar'): FieldHook =>
  async ({ value, data, originalDoc, req }) => {
    let base = typeof value === 'string' && value.trim() ? slugify(value) : ''
    if (!base) {
      let title = titleOf(data?.baslik)
      const isDefaultLocale = !req.locale || req.locale === 'tr'
      if ((!title || !isDefaultLocale) && originalDoc?.id) {
        const doc = await req.payload.findByID({
          collection,
          id: originalDoc.id,
          locale: 'tr',
          depth: 0,
          req,
        })
        title = isDefaultLocale ? (title ?? doc.baslik) : doc.baslik
      }
      base = slugify(title ?? '')
    }
    if (!base) return value

    const id = originalDoc?.id
    let candidate = base
    for (let n = 2; ; n++) {
      const { totalDocs } = await req.payload.count({
        collection,
        req,
        where: id
          ? { and: [{ slug: { equals: candidate } }, { id: { not_equals: id } }] }
          : { slug: { equals: candidate } },
      })
      if (totalDocs === 0) return candidate
      candidate = `${base}-${n}`
    }
  }
