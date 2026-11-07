import type { CollectionConfig } from 'payload'

import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, publicRead } from '@/lib/access'

export const EserTurleri: CollectionConfig = {
  slug: 'eser-turleri',
  labels: { singular: 'Eser türü', plural: 'Eser türleri' },
  admin: { useAsTitle: 'ad' },
  access: { ...publicRead, ...adminWrite },
  hooks: { afterChange: [revalidateHooks('eser-turleri').afterChange], afterDelete: [revalidateHooks('eser-turleri').afterDelete] },
  fields: [{ name: 'ad', label: 'Ad', type: 'text', required: true, localized: true }],
}
