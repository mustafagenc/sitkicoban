import type { CollectionConfig } from 'payload'

import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, adminRead } from '@/lib/access'

export const YaziKategorileri: CollectionConfig = {
  slug: 'yazi-kategorileri',
  labels: { singular: 'Yazı kategorisi', plural: 'Yazı kategorileri' },
  admin: { useAsTitle: 'ad', defaultColumns: ['ad', 'sira'] },
  access: { ...adminRead, ...adminWrite },
  hooks: {
    afterChange: [revalidateHooks('yazi-kategorileri').afterChange],
    afterDelete: [revalidateHooks('yazi-kategorileri').afterDelete],
  },
  fields: [
    { name: 'ad', label: 'Ad', type: 'text', required: true, localized: true },
    { name: 'sira', label: 'Sıra', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
