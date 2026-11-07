import type { CollectionConfig } from 'payload'

import { adminRead, adminWrite } from '@/lib/access'
import { revalidateHooks } from '@/lib/cache/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Görsel', plural: 'Görseller' },
  admin: { useAsTitle: 'filename' },
  access: { ...adminRead, ...adminWrite },
  hooks: { afterChange: [revalidateHooks('media').afterChange], afterDelete: [revalidateHooks('media').afterDelete] },
  upload: { staticDir: process.env.MEDIA_DIR || 'public/media', mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] },
  fields: [{ name: 'alt', label: 'Alternatif metin', type: 'text', localized: true }],
}
