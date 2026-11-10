import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { adminRead, adminWrite } from '@/lib/access'
import { zamanla } from '@/lib/bulten/duyuru'
import { KONULAR, type BultenKonu } from '@/lib/bulten/form'

const KONU_ETIKETI: Record<BultenKonu, string> = {
  yazilar: 'Yazılar abonelerine',
  kitaplar: 'Kitaplar abonelerine',
  eserler: 'Eserler abonelerine',
  videolar: 'Videolar abonelerine',
}

/** Bağlantı seçenekleri: yalnızca sitenin kendi sayfaları (dış bağlantı, satın alma bağlantısı girilemez). */
export const BAGLANTILAR = ['yok', 'home', 'eserler', 'kitaplar', 'yazilar', 'videolar', 'hayati', 'iletisim', 'bulten', 'yazi'] as const
export type Baglanti = (typeof BAGLANTILAR)[number]

const BAGLANTI_ETIKETI: Record<Baglanti, string> = {
  yok: 'Bağlantı yok',
  home: 'Ana sayfa',
  eserler: 'Eserler',
  kitaplar: 'Kitaplar',
  yazilar: 'Yazılar',
  videolar: 'Videolar',
  hayati: 'Hayatı',
  iletisim: 'İletişim',
  bulten: 'Bülten',
  yazi: 'Belirli bir yazı',
}

/** "Kaydedince gönder" işaretliyse ve daha önce gönderilmemişse gönderimi kayıt işlemi bittikten sonraya zamanlar. */
const gonderimHook: CollectionAfterChangeHook = ({ doc, context, req }) => {
  if (context?.duyuruYok || context?.disableRevalidate) return doc
  if (doc.gonder !== true || doc.gonderildi) return doc
  const payload = req.payload
  const id = doc.id as number | string
  zamanla(async () => {
    try {
      const { ozelDuyuruGonder } = await import('@/lib/bulten/ozelDuyuru')
      await ozelDuyuruGonder(payload, id)
    } catch (e) {
      console.error(`[duyuru] duyurular#${id}:`, e instanceof Error ? e.message : e)
    }
  })
  return doc
}

/**
 * Panelden serbest duyuru: başlık, metin, isteğe bağlı görsel ve sitedeki bir sayfaya bağlantı; e-posta
 * (bülten aboneleri) ve/veya tarayıcı bildirimi olarak, herkese ya da bir konunun abonelerine, bir kez gönderilir.
 * Sitede gösterilmez (önbellek kancası yok); yalnızca panelden okunur.
 */
export const Duyurular: CollectionConfig = {
  slug: 'duyurular',
  labels: { singular: 'Duyuru', plural: 'Duyurular' },
  admin: {
    useAsTitle: 'baslik',
    defaultColumns: ['baslik', 'kitle', 'kanallar', 'gonderildi'],
    description:
      'Abonelere serbest duyuru (e-posta ve/veya tarayıcı bildirimi). Metni üç dilde yazabilirsiniz; boş dillerde Türkçesi gider. Satın alma bağlantısı eklenemez.',
  },
  access: { ...adminRead, ...adminWrite },
  hooks: { afterChange: [gonderimHook] },
  fields: [
    { name: 'baslik', label: 'Başlık (e-posta konusu ve bildirim başlığı)', type: 'text', required: true, localized: true, maxLength: 150 },
    {
      name: 'metin',
      label: 'Metin',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: 3000,
      admin: { description: 'Paragrafları boş satırla ayırın. Bildirimde ilk 140 karakteri görünür.' },
    },
    { name: 'gorsel', label: 'Görsel (isteğe bağlı, yalnızca e-postada)', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        {
          name: 'baglanti',
          label: 'Bağlantı',
          type: 'select',
          required: true,
          defaultValue: 'home',
          options: BAGLANTILAR.map((b) => ({ label: BAGLANTI_ETIKETI[b], value: b })),
          admin: { description: 'Okuru sitedeki hangi sayfaya götürsün?' },
        },
        {
          name: 'yazi',
          label: 'Yazı',
          type: 'relationship',
          relationTo: 'yazilar',
          admin: { condition: (data) => data?.baglanti === 'yazi' },
          validate: (v: unknown, { siblingData }: { siblingData: { baglanti?: string } }) =>
            siblingData?.baglanti !== 'yazi' || !!v || 'Bir yazı seçin.',
        },
      ],
    },
    {
      name: 'dugme',
      label: 'Düğme metni (isteğe bağlı)',
      type: 'text',
      localized: true,
      maxLength: 40,
      admin: { description: 'Boşsa "Sitede gör →" yazar.', condition: (data) => data?.baglanti !== 'yok' },
    },
    {
      name: 'kitle',
      label: 'Kime',
      type: 'select',
      required: true,
      defaultValue: 'hepsi',
      options: [{ label: 'Bütün abonelere', value: 'hepsi' }, ...KONULAR.map((k) => ({ label: KONU_ETIKETI[k], value: k }))],
      admin: { position: 'sidebar' },
    },
    {
      name: 'kanallar',
      label: 'Nasıl',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['eposta', 'bildirim'],
      options: [
        { label: 'E-posta', value: 'eposta' },
        { label: 'Tarayıcı bildirimi', value: 'bildirim' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'gonder',
      label: 'Kaydedince gönder — bir kez',
      type: 'checkbox',
      defaultValue: false,
      hooks: { beforeDuplicate: [() => false] },
      admin: {
        position: 'sidebar',
        condition: (data) => !data?.gonderildi,
        description: 'İşaretleyip kaydedince gönderilir. Önce işaretlemeden kaydedip metni gözden geçirebilirsiniz. Aynı duyuruyu yeniden göndermek için kaydı çoğaltın.',
      },
    },
    {
      name: 'gonderildi',
      label: 'Gönderildi',
      type: 'date',
      // Çoğaltılan duyuru gönderilmemiş sayılır.
      hooks: { beforeDuplicate: [() => null] },
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'sonuc',
      label: 'Gönderim sonucu',
      type: 'text',
      hooks: { beforeDuplicate: [() => null] },
      admin: { position: 'sidebar', readOnly: true, condition: (data) => !!data?.gonderildi },
    },
  ],
}
