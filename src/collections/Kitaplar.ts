import type { CollectionConfig } from 'payload'

import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, adminRead } from '@/lib/access'
import { uniqueSlug } from '@/lib/slug'

export const Kitaplar: CollectionConfig = {
  slug: 'kitaplar',
  labels: { singular: 'Kitap', plural: 'Kitaplar' },
  admin: { useAsTitle: 'baslik', defaultColumns: ['baslik', 'rol', 'yayinevi', 'yil', 'sira'] },
  access: { ...adminRead, ...adminWrite },
  hooks: { afterChange: [revalidateHooks('kitaplar').afterChange], afterDelete: [revalidateHooks('kitaplar').afterDelete] },
  fields: [
    { name: 'baslik', label: 'Başlık', type: 'text', required: true, localized: true },
    { name: 'altBaslik', label: 'Alt başlık', type: 'text', localized: true },
    {
      name: 'slug',
      label: 'Adres (slug)',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Boş bırakılırsa başlıktan üretilir.' },
      hooks: { beforeValidate: [uniqueSlug('kitaplar')] },
    },
    {
      name: 'rol',
      label: 'Rol',
      type: 'select',
      options: [
        { label: 'Yazar', value: 'yazar' },
        { label: 'Hazırlayan', value: 'hazirlayan' },
        { label: 'Sadeleştiren', value: 'sadelestiren' },
        { label: 'Derleyen', value: 'derleyen' },
      ],
    },
    { name: 'asilYazar', label: 'Asıl yazar', type: 'text' },
    { name: 'kapak', label: 'Kapak', type: 'upload', relationTo: 'media', admin: { description: 'Boşsa yazı kapak kullanılır.' } },
    { name: 'kapakSigdir', label: 'Kapağı sığdır (contain)', type: 'checkbox', defaultValue: false },
    { name: 'yayinevi', label: 'Yayınevi', type: 'text' },
    { name: 'yil', label: 'Yıl', type: 'text' },
    { name: 'sayfa', label: 'Sayfa', type: 'number' },
    { name: 'isbn', label: 'ISBN', type: 'text' },
    { name: 'aciklama', label: 'Açıklama', type: 'textarea', localized: true },
    { name: 'satinAlLinki', label: 'Satın alma linki', type: 'text' },
    { name: 'sira', label: 'Sıra', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'anasayfadaGoster', label: 'Ana sayfada göster', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'anasayfaSira',
      label: 'Ana sayfa sırası',
      type: 'number',
      admin: { position: 'sidebar', condition: (d) => Boolean(d?.anasayfadaGoster) },
    },
  ],
}
