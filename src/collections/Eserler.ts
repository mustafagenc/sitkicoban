import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { duyuruAlanlari, duyuruHook } from '@/lib/bulten/duyuru'
import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, adminRead } from '@/lib/access'
import { uniqueSlug } from '@/lib/slug'

const computeOran: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const ref = 'gorsel' in data ? data.gorsel : originalDoc?.gorsel
  if (!ref) {
    data.oran = null
    return data
  }
  let media: { width?: number | null; height?: number | null } | null = null
  if (typeof ref === 'object') media = ref
  if (!media?.width || !media?.height) {
    const id = typeof ref === 'object' ? (ref as { id: number | string }).id : ref
    media = await req.payload.findByID({ collection: 'media', id, depth: 0, req })
  }
  data.oran =
    media?.width && media?.height ? Math.round((media.width / media.height) * 100) / 100 : null
  return data
}

export const Eserler: CollectionConfig = {
  slug: 'eserler',
  labels: { singular: 'Eser', plural: 'Eserler' },
  admin: { useAsTitle: 'baslik', defaultColumns: ['baslik', 'tur', 'yil', 'sira'] },
  access: { ...adminRead, ...adminWrite },
  hooks: { beforeChange: [computeOran], afterChange: [revalidateHooks('eserler').afterChange, duyuruHook('eserler')], afterDelete: [revalidateHooks('eserler').afterDelete] },
  fields: [
    { name: 'baslik', label: 'Başlık', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      label: 'Adres (slug)',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Boş bırakılırsa başlıktan üretilir.' },
      hooks: { beforeValidate: [uniqueSlug('eserler')] },
    },
    { name: 'gorsel', label: 'Görsel', type: 'upload', relationTo: 'media' },
    {
      name: 'oran',
      label: 'En/boy oranı',
      type: 'number',
      admin: { readOnly: true, position: 'sidebar', description: 'Görselden otomatik hesaplanır.' },
    },
    { name: 'yaziTurleri', label: 'Yazı türleri', type: 'relationship', relationTo: 'yazi-turleri', hasMany: true },
    { name: 'tur', label: 'Eser türü', type: 'relationship', relationTo: 'eser-turleri' },
    { name: 'yil', label: 'Yıl', type: 'text' },
    { name: 'metin', label: 'Metin (Arapça)', type: 'textarea' },
    { name: 'anlam', label: 'Anlam', type: 'textarea', localized: true },
    { name: 'kaynak', label: 'Kaynak', type: 'text', localized: true },
    { name: 'aciklama', label: 'Açıklama', type: 'textarea', localized: true },
    { name: 'olcu', label: 'Ölçü', type: 'text' },
    { name: 'malzeme', label: 'Malzeme', type: 'text', localized: true },
    { name: 'tezhip', label: 'Tezhip', type: 'text', localized: true },
    { name: 'ebru', label: 'Ebru', type: 'text', localized: true },
    { name: 'sira', label: 'Sıra', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'anasayfadaGoster', label: 'Ana sayfada göster', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'anasayfaSira',
      label: 'Ana sayfa sırası',
      type: 'number',
      admin: { position: 'sidebar', condition: (d) => Boolean(d?.anasayfadaGoster) },
    },
    ...duyuruAlanlari(),
  ],
}
