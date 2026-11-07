import { existsSync } from 'node:fs'
import path from 'node:path'

import { BlobNotFoundError, head } from '@vercel/blob'

/**
 * Bir media kaydının dosyası gerçekten duruyor mu? `BLOB_READ_WRITE_TOKEN` ayarlıysa Blob'a sorulur
 * (kayıttaki `url` her durumda Blob adresine çevrildiği için ona güvenilmez); değilse yerel klasöre bakılır.
 * Blob'un "bulunamadı" dışındaki hataları (ağ vb.) fırlatılır: yeniden yükleme yalnızca dosya yoksa yapılır.
 */
export async function mediaDosyasiVar(doc: { filename?: string | null; prefix?: string | null }, mediaDir: string): Promise<boolean> {
  if (!doc.filename) return false
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return existsSync(path.join(mediaDir, doc.filename))
  try {
    await head(path.posix.join(doc.prefix || '', doc.filename), { token })
    return true
  } catch (e) {
    if (e instanceof BlobNotFoundError) return false
    throw e
  }
}
