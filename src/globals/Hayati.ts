import { BlocksFeature, HeadingFeature, LinkFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { GlobalConfig } from 'payload'

import { HocaKartlari } from '@/blocks/HocaKartlari'
import { OneCikanSoz } from '@/blocks/OneCikanSoz'
import { adminRead, adminWrite } from '@/lib/access'
import { revalidateHooks } from '@/lib/cache/revalidate'

/** Bölüm gövdesi: varsayılan araçlar, h3 başlık, düz bağlantı, Öne çıkan söz ve Hoca kartları blokları. */
export const bolumEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => !['relationship', 'upload', 'heading', 'link'].includes(f.key)),
    HeadingFeature({ enabledHeadingSizes: ['h3'] }),
    LinkFeature({ enabledCollections: [] }),
    BlocksFeature({ blocks: [OneCikanSoz, HocaKartlari] }),
  ],
})

/** Bölümün sonundaki "… görün →" bağlantılarının gidebileceği sayfalar. */
export const BAGLANTI_SAYFALARI = [
  { label: 'Eserler', value: 'eserler' },
  { label: 'Kitaplar', value: 'kitaplar' },
  { label: 'Yazılar', value: 'yazilar' },
  { label: 'Videolar', value: 'videolar' },
] as const

export const Hayati: GlobalConfig = {
  slug: 'hayati',
  label: 'Hayatı',
  access: { read: adminRead.read, update: adminWrite.update },
  hooks: { afterChange: [revalidateHooks('hayati').afterChange] },
  fields: [
    { name: 'girisCumlesi', label: 'Giriş cümlesi', type: 'textarea', required: true, localized: true },
    { name: 'portre', label: 'Portre', type: 'upload', relationTo: 'media' },
    {
      name: 'kunye',
      label: 'Künye',
      type: 'array',
      localized: true,
      admin: { description: 'Giriş bölümündeki kısa bilgi kutusu (Doğum, Eğitim…).' },
      fields: [
        { name: 'etiket', label: 'Etiket', type: 'text', required: true },
        { name: 'deger', label: 'Değer', type: 'textarea', required: true, admin: { description: 'Her satır ayrı satır olarak görünür.' } },
      ],
    },
    {
      name: 'bolumler',
      label: 'Bölümler',
      type: 'array',
      localized: true,
      admin: { description: 'Sayfadaki sıra numarası (I, II…) ve "Bu sayfada" listesi başlıklardan üretilir.' },
      fields: [
        { name: 'baslik', label: 'Başlık', type: 'text', required: true },
        { name: 'govde', label: 'Gövde', type: 'richText', required: true, editor: bolumEditor },
        {
          name: 'baglantilar',
          label: 'Bölüm sonu bağlantıları',
          type: 'array',
          fields: [
            { name: 'etiket', label: 'Etiket', type: 'text', required: true },
            { name: 'sayfa', label: 'Sayfa', type: 'select', required: true, options: [...BAGLANTI_SAYFALARI] },
          ],
        },
      ],
    },
    { name: 'kapanis', label: 'Kapanış cümlesi', type: 'textarea', localized: true },
    { name: 'anasayfaOzet', label: 'Ana sayfa özeti', type: 'richText', required: true, localized: true },
    { name: 'anasayfaSoz', label: 'Ana sayfa sözü', type: 'text', localized: true },
  ],
}
