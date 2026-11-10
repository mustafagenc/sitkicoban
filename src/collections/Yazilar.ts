import {
  BlocksFeature,
  HeadingFeature,
  LinkFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { Ayet } from '@/blocks/Ayet'
import { OneCikanSoz } from '@/blocks/OneCikanSoz'
import { duyuruAlanlari, duyuruHook } from '@/lib/bulten/duyuru'
import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, adminRead } from '@/lib/access'
import { readingTime, wordCount } from '@/lib/readingTime'
import { uniqueSlug } from '@/lib/slug'

/** Yazı gövdesi: varsayılan araçlar, h2/h3 başlıklar, yazılara iç bağlantı, Âyet ve Öne çıkan söz blokları. */
export const govdeEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    // İlişki ve görsel düğümleri sitede çizilmez; başlık ve bağlantı aşağıda yeniden ayarlanır.
    ...defaultFeatures.filter((f) => !['relationship', 'upload', 'heading', 'link'].includes(f.key)),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    LinkFeature({ enabledCollections: ['yazilar'] }),
    BlocksFeature({ blocks: [Ayet, OneCikanSoz] }),
  ],
})

/** Okuma süresi Türkçe gövdeden: otomatikse ya da boşsa yeniden hesaplanır (gövde boşsa dokunulmaz). */
const okumaSuresiHook: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const auto = data.okumaSuresiOtomatik ?? originalDoc?.okumaSuresiOtomatik ?? true
  const current = data.okumaSuresi ?? originalDoc?.okumaSuresi
  if (!auto && current) return data

  const isDefaultLocale = !req.locale || req.locale === 'tr'
  let govde = isDefaultLocale ? (data.govde ?? originalDoc?.govde) : undefined
  if (!isDefaultLocale && originalDoc?.id) {
    const doc = await req.payload.findByID({ collection: 'yazilar', id: originalDoc.id, locale: 'tr', depth: 0, req })
    govde = doc.govde
  }
  if (wordCount(govde) > 0) data.okumaSuresi = readingTime(govde)
  return data
}

export const Yazilar: CollectionConfig = {
  slug: 'yazilar',
  labels: { singular: 'Yazı', plural: 'Yazılar' },
  admin: { useAsTitle: 'baslik', defaultColumns: ['baslik', 'kategori', 'tarih', 'yayinda'] },
  access: { ...adminRead, ...adminWrite },
  defaultSort: '-tarih',
  hooks: {
    beforeChange: [okumaSuresiHook],
    afterChange: [revalidateHooks('yazilar').afterChange, duyuruHook('yazilar')],
    afterDelete: [revalidateHooks('yazilar').afterDelete],
  },
  fields: [
    { name: 'baslik', label: 'Başlık', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      label: 'Adres (slug)',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Boş bırakılırsa başlıktan üretilir.' },
      hooks: { beforeValidate: [uniqueSlug('yazilar')] },
    },
    { name: 'kategori', label: 'Kategori', type: 'relationship', relationTo: 'yazi-kategorileri', admin: { position: 'sidebar' } },
    { name: 'ozet', label: 'Özet', type: 'textarea', required: true, localized: true },
    {
      name: 'govde',
      label: 'Gövde',
      type: 'richText',
      localized: true,
      editor: govdeEditor,
      // Taslak yazının gövdesi boş kalabilir; yayına alınacak yazının Türkçe gövdesi dolu olmalı.
      validate: (value, { siblingData, req }) => {
        const isDefaultLocale = !req.locale || req.locale === 'tr'
        if ((siblingData as { yayinda?: boolean } | undefined)?.yayinda && isDefaultLocale && wordCount(value) === 0) {
          return 'Yayındaki yazının gövdesi boş olamaz.'
        }
        return true
      },
    },
    {
      name: 'tarih',
      label: 'Tarih',
      type: 'date',
      index: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'okumaSuresiOtomatik',
      label: 'Okuma süresini otomatik hesapla',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'okumaSuresi',
      label: 'Okuma süresi (dk)',
      type: 'number',
      min: 1,
      admin: {
        position: 'sidebar',
        description: 'Otomatikse Türkçe gövdeden hesaplanır (dakikada 200 kelime).',
      },
    },
    { name: 'kapak', label: 'Kapak', type: 'upload', relationTo: 'media' },
    {
      name: 'kaynaklar',
      label: 'Faydalanılan kaynaklar',
      type: 'array',
      localized: true,
      fields: [{ name: 'metin', label: 'Kaynak', type: 'text', required: true }],
    },
    { name: 'ilgiliKitaplar', label: 'İlgili kitaplar', type: 'relationship', relationTo: 'kitaplar', hasMany: true },
    {
      name: 'yayinda',
      label: 'Yayında',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar', description: 'Kapalıysa yazı sitede görünmez.' },
    },
    ...duyuruAlanlari(),
  ],
}
