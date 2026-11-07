import type { CollectionConfig } from 'payload'

import { adminWrite, publicRead } from '@/lib/access'

export const EserTurleri: CollectionConfig = {
  slug: 'eser-turleri',
  labels: { singular: 'Eser türü', plural: 'Eser türleri' },
  admin: { useAsTitle: 'ad' },
  access: { ...publicRead, ...adminWrite },
  fields: [{ name: 'ad', label: 'Ad', type: 'text', required: true, localized: true }],
}
