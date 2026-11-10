import type { GlobalConfig } from 'payload'

import { adminRead, adminWrite } from '@/lib/access'
import { revalidateHooks } from '@/lib/cache/revalidate'

/**
 * Yazı sayfasının altındaki yorum bölümünün metinleri. `ui-metinleri` Postgres'in 100 argüman sınırına
 * dayandığı için (bkz. Iletisim.ts) ayrı bir globalde tutulur. Anahtar eklemek için buraya satır ekleyin
 * ve seed/yorum-metinleri.ts'ye üç dilde metnini yazın.
 */
const LABELS = {
  baslik: 'Bölüm başlığı (Yorumlar)',
  bos: 'Henüz yorum yokken gösterilen cümle',
  cevapEtiket: "Cevap kutusunun etiketi (Sıtkı Çoban'ın cevabı)",
  formBaslik: 'Form: başlık',
  formAciklama: 'Form: açıklama',
  formAd: 'Form: Ad',
  formAdHata: 'Form: ad hatası',
  formEposta: 'Form: E-posta',
  formEpostaNot: 'Form: e-posta notu (yayınlanmaz)',
  formEpostaHata: 'Form: e-posta hatası',
  formMetin: 'Form: Yorum',
  formMetinHata: 'Form: yorum hatası',
  formSayac: 'Form: karakter sayacı ({n} / {max})',
  formOnay: 'Form: aydınlatma onay kutusu',
  formAydinlatma: 'Form: Aydınlatma metni bağlantısı',
  formOnayHata: 'Form: onay hatası',
  formGonder: 'Form: Gönder düğmesi',
  formGonderiliyor: 'Form: Gönderiliyor',
  formBasariBaslik: 'Form: başarı başlığı',
  formBasariMetin: 'Form: başarı metni',
  formYeniYorum: 'Form: Yeni bir yorum yaz',
  formHata: 'Form: gönderim hatası',
  formSinir: 'Form: çok sık gönderim',
  formKullanilamaz: 'Form: yorumlar kapalı',
} as const

export type YorumMetinKey = keyof typeof LABELS
export const YORUM_METIN_KEYS = Object.keys(LABELS) as readonly YorumMetinKey[]

/** Yorum metinleri. Boşsa (ör. migration sonrası) yazı sayfasında yorum bölümü hiç çizilmez. */
export const YorumMetinleri: GlobalConfig = {
  slug: 'yorum-metinleri',
  label: 'Yorum metinleri',
  access: { read: adminRead.read, update: adminWrite.update },
  hooks: { afterChange: [revalidateHooks('yorum-metinleri').afterChange] },
  fields: [
    {
      name: 'metinler',
      label: 'Arayüz metinleri',
      type: 'group',
      admin: { description: 'Yazı sayfalarının altındaki yorum listesi ve formundaki metinler.' },
      fields: YORUM_METIN_KEYS.map((k) => ({ name: k, label: LABELS[k], type: 'text' as const, localized: true })),
    },
  ],
}
