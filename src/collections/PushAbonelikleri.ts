import type { CollectionConfig } from 'payload'

import { adminRead, adminWrite } from '@/lib/access'
import { KONULAR, type BultenKonu } from '@/lib/bulten/form'

const KONU_ETIKETI: Record<BultenKonu, string> = { yazilar: 'Yazılar', kitaplar: 'Kitaplar', eserler: 'Eserler', videolar: 'Videolar' }

/**
 * Tarayıcı bildirimi (Web Push) abonelikleri. Kayıtları ziyaretçinin "Bildirimleri aç" eylemi
 * (`pushKaydet`, Local API + overrideAccess) yazar; REST/GraphQL'de yalnızca giriş yapmış kullanıcıya açıktır.
 * Hiçbir ziyaretçi sayfası bu koleksiyonu okumaz: önbellek yenileme kancası yoktur.
 */
export const PushAbonelikleri: CollectionConfig = {
  slug: 'push-abonelikleri',
  labels: { singular: 'Bildirim aboneliği', plural: 'Bildirim abonelikleri' },
  admin: {
    useAsTitle: 'endpoint',
    defaultColumns: ['dil', 'konular', 'createdAt'],
    description: 'Tarayıcı bildirimlerini açan ziyaretçiler (kişisel veri yok; ziyaretçi bildirimleri kapatınca silinir).',
  },
  access: { ...adminRead, ...adminWrite },
  fields: [
    { name: 'endpoint', label: 'Push servisi adresi', type: 'text', required: true, unique: true, index: true },
    { name: 'p256dh', label: 'Anahtar (p256dh)', type: 'text', required: true },
    { name: 'auth', label: 'Anahtar (auth)', type: 'text', required: true },
    {
      name: 'dil',
      label: 'Dil',
      type: 'select',
      required: true,
      options: [
        { label: 'Türkçe', value: 'tr' },
        { label: 'English', value: 'en' },
        { label: 'العربية', value: 'ar' },
      ],
    },
    {
      name: 'konular',
      label: 'Konular',
      type: 'select',
      hasMany: true,
      required: true,
      options: KONULAR.map((k) => ({ label: KONU_ETIKETI[k], value: k })),
    },
  ],
}
