import type { CollectionConfig } from 'payload'

import { isLoggedIn } from '@/lib/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Görsel', plural: 'Görseller' },
  admin: { useAsTitle: 'filename' },
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  upload: { staticDir: 'public/media', mimeTypes: ['image/*'] },
  fields: [{ name: 'alt', label: 'Alternatif metin', type: 'text', localized: true }],
}
