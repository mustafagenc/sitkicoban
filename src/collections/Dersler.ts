import type { CollectionConfig } from 'payload'

import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, adminRead } from '@/lib/access'

export const Dersler: CollectionConfig = {
  slug: 'dersler',
  labels: { singular: 'Ders', plural: 'Dersler' },
  admin: { useAsTitle: 'baslik', defaultColumns: ['baslik', 'kurum', 'bitis', 'sira'] },
  access: { ...adminRead, ...adminWrite },
  hooks: { afterChange: [revalidateHooks('dersler').afterChange], afterDelete: [revalidateHooks('dersler').afterDelete] },
  fields: [
    { name: 'kurum', label: 'Kurum', type: 'text', required: true, localized: true },
    { name: 'baslik', label: 'Başlık', type: 'text', required: true, localized: true },
    { name: 'altBaslik', label: 'Alt başlık', type: 'text', localized: true },
    { name: 'aciklama', label: 'Açıklama', type: 'textarea', localized: true },
    { name: 'gun', label: 'Gün', type: 'text', required: true, localized: true, admin: { description: 'Örn. Her Perşembe' } },
    { name: 'saat', label: 'Saat', type: 'text', admin: { description: 'Örn. 16.30–18.00' } },
    { name: 'yer', label: 'Yer', type: 'text', localized: true },
    { name: 'kontenjan', label: 'Kontenjan', type: 'text', localized: true, admin: { description: 'Örn. 25 kişi' } },
    { name: 'afis', label: 'Afiş', type: 'upload', relationTo: 'media', admin: { description: 'Boşsa logolu boş kutu görünür.' } },
    {
      name: 'bitis',
      label: 'Bitiş tarihi',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' }, description: 'Bu tarihten sonra ders ana sayfadan kalkar.' },
    },
    { name: 'sira', label: 'Sıra', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
