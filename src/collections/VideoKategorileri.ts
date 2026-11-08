import type { CollectionConfig } from 'payload'

import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, adminRead } from '@/lib/access'

export const VideoKategorileri: CollectionConfig = {
  slug: 'video-kategorileri',
  labels: { singular: 'Video kategorisi', plural: 'Video kategorileri' },
  admin: { useAsTitle: 'ad', defaultColumns: ['ad', 'sira'] },
  access: { ...adminRead, ...adminWrite },
  hooks: {
    afterChange: [revalidateHooks('video-kategorileri').afterChange],
    afterDelete: [revalidateHooks('video-kategorileri').afterDelete],
  },
  fields: [
    { name: 'ad', label: 'Ad', type: 'text', required: true, localized: true },
    { name: 'sira', label: 'Sıra', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
