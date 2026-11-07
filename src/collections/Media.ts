import type { CollectionConfig } from 'payload'

import { isLoggedIn } from '@/lib/access'
import { revalidateHooks } from '@/lib/cache/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Görsel', plural: 'Görseller' },
  admin: { useAsTitle: 'filename' },
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: { afterChange: [revalidateHooks('media').afterChange], afterDelete: [revalidateHooks('media').afterDelete] },
  upload: { staticDir: process.env.MEDIA_DIR || 'public/media', mimeTypes: ['image/*'] },
  fields: [{ name: 'alt', label: 'Alternatif metin', type: 'text', localized: true }],
}
