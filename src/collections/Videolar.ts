import type { CollectionConfig } from 'payload'

import { duyuruAlanlari, duyuruHook } from '@/lib/bulten/duyuru'
import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, adminRead } from '@/lib/access'
import { youtubeId } from '@/lib/youtube'

export const Videolar: CollectionConfig = {
  slug: 'videolar',
  labels: { singular: 'Video', plural: 'Videolar' },
  admin: { useAsTitle: 'baslik', defaultColumns: ['baslik', 'kategori', 'seri', 'tarih', 'sira'] },
  access: { ...adminRead, ...adminWrite },
  hooks: {
    afterChange: [revalidateHooks('videolar').afterChange, duyuruHook('videolar')],
    afterDelete: [revalidateHooks('videolar').afterDelete],
  },
  fields: [
    { name: 'baslik', label: 'Başlık', type: 'text', required: true, localized: true },
    { name: 'altBaslik', label: 'Alt başlık', type: 'text', localized: true, admin: { description: 'Örn. Ramazan Sosyolojisi · 2. Bölüm' } },
    {
      name: 'youtube',
      label: 'YouTube bağlantısı',
      type: 'text',
      required: true,
      admin: { description: 'Video adresi ya da 11 karakterlik video kimliği. Kapak YouTube’dan gelir; isterseniz aşağıdan kendi kapağınızı yükleyin.' },
      validate: (value: string | null | undefined) =>
        youtubeId(value) ? true : 'Geçerli bir YouTube video adresi ya da kimliği girin.',
    },
    { name: 'kategori', label: 'Kategori', type: 'relationship', relationTo: 'video-kategorileri' },
    {
      name: 'seri',
      label: 'Seri',
      type: 'text',
      localized: true,
      admin: { description: 'Aynı seriye yazılan videolar pencerede yan yana listelenir. Örn. Ta’lik meşki' },
    },
    { name: 'bolum', label: 'Ders / bölüm no', type: 'number', min: 1, admin: { description: 'Seri içindeki sırası.' } },
    { name: 'sure', label: 'Süre', type: 'text', admin: { description: 'Örn. 14:32' } },
    { name: 'tarih', label: 'Tarih', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'monthOnly' } } },
    { name: 'kanal', label: 'Kanal', type: 'text', admin: { description: 'Örn. TRT 2' } },
    { name: 'aciklama', label: 'Açıklama', type: 'textarea', localized: true },
    { name: 'kapak', label: 'Kapak', type: 'upload', relationTo: 'media', admin: { description: 'Boşsa YouTube kapağı kullanılır.' } },
    {
      name: 'anasayfada',
      label: 'Ana sayfada göster',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Yalnızca bir video kullanılır: işaretlenenlerden en son güncellenen.' },
    },
    { name: 'sira', label: 'Sıra', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    ...duyuruAlanlari(),
  ],
}
