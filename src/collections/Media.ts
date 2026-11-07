import os from 'node:os'
import path from 'node:path'
import type { CollectionConfig } from 'payload'

import { adminRead, adminWrite } from '@/lib/access'
import { revalidateHooks } from '@/lib/cache/revalidate'

/**
 * Yerel dosyaların klasörü. Blob açıkken dosyalar yerelde tutulmaz; Payload yine de aynı adda yerel dosya
 * varsa adı `-1`, `-2`… diye değiştirir. Yayına alırken seed `public/media` dolu bir makinede çalışsa bile
 * adlar korunsun diye Blob açıkken hiç dosya yazılmayan boş bir klasör gösterilir.
 */
const staticDir = process.env.BLOB_READ_WRITE_TOKEN
  ? path.join(os.tmpdir(), 'sitkicoban-blob-yerel-yok')
  : process.env.MEDIA_DIR || 'public/media'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Görsel', plural: 'Görseller' },
  admin: { useAsTitle: 'filename' },
  access: { ...adminRead, ...adminWrite },
  hooks: { afterChange: [revalidateHooks('media').afterChange], afterDelete: [revalidateHooks('media').afterDelete] },
  upload: { staticDir, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] },
  fields: [{ name: 'alt', label: 'Alternatif metin', type: 'text', localized: true }],
}
