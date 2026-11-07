import { HeadingFeature, LinkFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { GlobalConfig } from 'payload'

import { adminRead, adminWrite } from '@/lib/access'
import { revalidateHooks } from '@/lib/cache/revalidate'

/** Aydınlatma metni: varsayılan araçlar, h2/h3 başlık ve düz bağlantı. */
const aydinlatmaEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => !['relationship', 'upload', 'heading', 'link'].includes(f.key)),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    LinkFeature({ enabledCollections: [] }),
  ],
})

/**
 * Sayfanın arayüz metinleri (form etiketleri, hata iletileri…). `ui-metinleri` yerine burada tutulur:
 * Postgres bir fonksiyona en çok 100 argüman verilmesine izin verir ve Payload yerelleştirilmiş sütunları
 * tek `json_build_array` ile okur; `ui-metinleri` bu sınıra dayandı.
 * Anahtar eklemek için buraya satır ekleyin ve seed/iletisim.ts'ye üç dilde metnini yazın.
 */
const LABELS = {
  iletisimNeIcin: 'Yan başlık: Ne için yazabilirsiniz?',
  iletisimNot: 'Yan metin',
  iletisimEposta: 'E-posta bağlantısı etiketi',
  formBaslik: 'Form: başlık',
  formAciklama: 'Form: açıklama',
  formAd: 'Form: Adınız',
  formEposta: 'Form: E-posta',
  formKonu: 'Form: Konu',
  formKonuSec: 'Form: Konu seçin',
  formTelefon: 'Form: Telefon',
  formIstegeBagli: 'Form: isteğe bağlı',
  formMesaj: 'Form: Mesajınız',
  formAdHata: 'Form: ad hatası',
  formEpostaHata: 'Form: e-posta hatası',
  formKonuHata: 'Form: konu hatası',
  formMesajHata: 'Form: mesaj hatası',
  formOnayHata: 'Form: onay hatası',
  formSayac: 'Form: karakter sayacı ({n} yazılan, {max} sınır yerine geçer)',
  formOnay: 'Form: onay kutusu',
  formAydinlatma: 'Form: Aydınlatma metni bağlantısı',
  formGonder: 'Form: Gönder',
  formGonderiliyor: 'Form: Gönderiliyor',
  formBasariBaslik: 'Form: başarı başlığı',
  formBasariMetin: 'Form: başarı metni ({ad} ad, {eposta} e-posta yerine geçer)',
  formYeniMesaj: 'Form: Yeni mesaj yaz',
  formHata: 'Form: gönderim hatası',
  formKullanilamaz: 'Form: gönderim kapalı',
  eserHakkinda: 'Eser sorusu hazır metni ({eser} eser adı yerine geçer)',
  aydinlatmaBaslik: 'Aydınlatma sayfası: başlık',
  iletisimeDon: 'Aydınlatma sayfası: İletişim sayfasına dön',
} as const

export type MetinKey = keyof typeof LABELS
export const METIN_KEYS = Object.keys(LABELS) as readonly MetinKey[]

/**
 * İletişim sayfası. E-posta ve sosyal bağlantılar `site-ayarlari`nda kalır; form mesajları
 * kaydedilmez, yalnızca `site-ayarlari.formHedefEposta` adresine e-posta olarak gider.
 */
export const Iletisim: GlobalConfig = {
  slug: 'iletisim',
  label: 'İletişim',
  access: { read: adminRead.read, update: adminWrite.update },
  hooks: { afterChange: [revalidateHooks('iletisim').afterChange] },
  fields: [
    {
      name: 'aciklama',
      label: 'Sayfa açıklaması',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Sayfa başlığının altındaki cümle.' },
    },
    {
      name: 'maddeler',
      label: 'Ne için yazabilirsiniz?',
      type: 'array',
      localized: true,
      fields: [
        { name: 'baslik', label: 'Başlık', type: 'text', required: true },
        { name: 'metin', label: 'Açıklama', type: 'textarea', required: true },
      ],
    },
    {
      name: 'konular',
      label: 'Form konuları',
      type: 'array',
      localized: true,
      admin: {
        description:
          'Formdaki "Konu" listesi. İlk konu, bir eserden gelen ziyaretçide (Eser hakkında sor) seçili gelir; ?konu=Ad bağlantısı adı eşleşen konuyu seçer.',
      },
      fields: [{ name: 'ad', label: 'Konu', type: 'text', required: true }],
    },
    {
      name: 'metinler',
      label: 'Arayüz metinleri',
      type: 'group',
      admin: { description: 'Formdaki etiketler, hata iletileri ve düğme metinleri.' },
      fields: METIN_KEYS.map((k) => ({ name: k, label: LABELS[k], type: 'text' as const, localized: true })),
    },
    {
      name: 'aydinlatmaMetni',
      label: 'Aydınlatma metni',
      type: 'richText',
      required: true,
      localized: true,
      editor: aydinlatmaEditor,
    },
  ],
}
