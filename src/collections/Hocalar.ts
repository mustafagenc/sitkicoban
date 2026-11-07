import type { CollectionConfig } from 'payload'

import { adminWrite, adminRead } from '@/lib/access'
import { revalidateHooks } from '@/lib/cache/revalidate'

export const Hocalar: CollectionConfig = {
  slug: 'hocalar',
  labels: { singular: 'Hoca', plural: 'Hocalar (icazet)' },
  admin: { useAsTitle: 'ad', defaultColumns: ['ad', 'kalemler', 'sira'] },
  access: { ...adminRead, ...adminWrite },
  defaultSort: 'sira',
  hooks: { afterChange: [revalidateHooks('hocalar').afterChange], afterDelete: [revalidateHooks('hocalar').afterDelete] },
  fields: [
    { name: 'ad', label: 'Ad', type: 'text', required: true, localized: true },
    { name: 'kalemler', label: 'Kalemler', type: 'text', required: true, localized: true, admin: { description: "Örn. Rik'a · Ta'lik" } },
    {
      name: 'aciklama',
      label: 'Açıklama (ana sayfa)',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Ana sayfadaki icazet silsilesinde görünür.' },
    },
    {
      name: 'sayfaAciklama',
      label: 'Açıklama (Hayatı sayfası)',
      type: 'textarea',
      localized: true,
      admin: { description: 'Hayatı sayfasındaki karta yazılır; boşsa kartta açıklama görünmez.' },
    },
    {
      name: 'imza',
      label: 'İmza',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Koyu temada otomatik açık renge çevrilir.' },
    },
    { name: 'sira', label: 'Sıra', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
