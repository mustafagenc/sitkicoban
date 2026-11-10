import type { CollectionBeforeChangeHook, CollectionBeforeDeleteHook, CollectionConfig } from 'payload'

import { adminRead, adminWrite } from '@/lib/access'
import { yorumRevalidateHooks } from '@/lib/cache/revalidate'
import { YORUM_LIMITLERI } from '@/lib/yorum'

/** Cevap yazıldığında tarihi kendiliğinden atılır; cevap silinirse tarih de silinir. */
const cevapTarihiHook: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const yeni = String(data.cevap ?? originalDoc?.cevap ?? '').trim()
  const eski = String(originalDoc?.cevap ?? '').trim()
  if (!yeni) data.cevapTarihi = null
  else if (yeni !== eski || !originalDoc?.cevapTarihi) data.cevapTarihi = new Date().toISOString()
  return data
}

/**
 * Yazı silinmeden önce yorumları silinir (yorumun yazısı zorunlu; veritabanı onu boşaltamaz). Kancasız, aynı
 * işlem (transaction) içinde doğrudan silinir: yazının sayfası zaten kalkar ve yazının kendi yenileme kancası
 * etkilenmez (`req.context`e dokunulmaz).
 */
export const yaziYorumlariniSil: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.db.deleteMany({ collection: 'yorumlar', where: { yazi: { equals: id } }, req })
}

/**
 * Yazı yorumları. Ziyaretçi yorumu yazı sayfasındaki form (`yorumGonder`, Local API + overrideAccess) ile
 * "Onay bekliyor" olarak kaydedilir; sitede yalnızca "Onaylandı" yorumlar, üç dilde de görünür. E-posta adresi
 * hiçbir zaman sitede gösterilmez. REST/GraphQL yalnızca giriş yapmış kullanıcıya açıktır.
 */
export const Yorumlar: CollectionConfig = {
  slug: 'yorumlar',
  labels: { singular: 'Yorum', plural: 'Yorumlar' },
  admin: {
    useAsTitle: 'ad',
    defaultColumns: ['ad', 'yazi', 'durum', 'createdAt'],
    description:
      'Ziyaretçilerin yazılara bıraktığı yorumlar. Yeni yorumlar "Onay bekliyor" olarak gelir ve durum "Onaylandı" yapılana kadar sitede görünmez. Onaylı yorumlar yazının üç dildeki sayfasında da görünür; e-posta adresi hiçbir zaman yayınlanmaz.',
    listSearchableFields: ['ad', 'eposta', 'metin'],
  },
  defaultSort: '-createdAt',
  access: { ...adminRead, ...adminWrite },
  hooks: {
    beforeChange: [cevapTarihiHook],
    afterChange: [yorumRevalidateHooks().afterChange],
    afterDelete: [yorumRevalidateHooks().afterDelete],
  },
  fields: [
    { name: 'yazi', label: 'Yazı', type: 'relationship', relationTo: 'yazilar', required: true, index: true },
    {
      name: 'durum',
      label: 'Durum',
      type: 'select',
      required: true,
      defaultValue: 'bekliyor',
      index: true,
      options: [
        { label: 'Onay bekliyor', value: 'bekliyor' },
        { label: 'Onaylandı', value: 'onaylandi' },
        { label: 'Reddedildi', value: 'reddedildi' },
      ],
      admin: { position: 'sidebar', description: 'Yalnızca "Onaylandı" yorumlar sitede görünür.' },
    },
    {
      name: 'dil',
      label: 'Yazıldığı dil',
      type: 'select',
      required: true,
      options: [
        { label: 'Türkçe', value: 'tr' },
        { label: 'English', value: 'en' },
        { label: 'العربية', value: 'ar' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'ad', label: 'Ad', type: 'text', required: true, maxLength: YORUM_LIMITLERI.ad },
    {
      name: 'eposta',
      label: 'E-posta',
      type: 'email',
      required: true,
      admin: { description: 'Sitede hiçbir zaman gösterilmez.' },
    },
    { name: 'metin', label: 'Yorum', type: 'textarea', required: true, maxLength: YORUM_LIMITLERI.metin },
    {
      name: 'cevap',
      label: "Sıtkı Çoban'ın cevabı",
      type: 'textarea',
      admin: { description: 'İsteğe bağlı. Onaylı yorumun altında ayrı bir kutuda gösterilir.' },
    },
    {
      name: 'cevapTarihi',
      label: 'Cevap tarihi',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true, description: 'Cevap yazıldığında kendiliğinden atılır.' },
    },
    {
      name: 'ipOzeti',
      label: 'IP özeti',
      type: 'text',
      index: true,
      admin: { hidden: true },
    },
  ],
}
