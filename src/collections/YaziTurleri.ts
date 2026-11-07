import type { CollectionConfig } from 'payload'

import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, publicRead } from '@/lib/access'

export const YaziTurleri: CollectionConfig = {
  slug: 'yazi-turleri',
  labels: { singular: 'Yazı türü', plural: 'Yazı türleri' },
  admin: { useAsTitle: 'ad', defaultColumns: ['ad', 'sira'] },
  access: { ...publicRead, ...adminWrite },
  hooks: { afterChange: [revalidateHooks('yazi-turleri').afterChange], afterDelete: [revalidateHooks('yazi-turleri').afterDelete] },
  fields: [
    { name: 'ad', label: 'Ad', type: 'text', required: true, localized: true },
    { name: 'sira', label: 'Sıra', type: 'number', defaultValue: 0 },
  ],
}
