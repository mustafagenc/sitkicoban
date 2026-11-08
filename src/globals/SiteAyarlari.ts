import type { GlobalConfig } from 'payload'

import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, adminRead } from '@/lib/access'

export const SiteAyarlari: GlobalConfig = {
  slug: 'site-ayarlari',
  label: 'Site ayarları',
  access: { read: adminRead.read, update: adminWrite.update },
  hooks: { afterChange: [revalidateHooks('site-ayarlari').afterChange] },
  fields: [
    { name: 'eposta', label: 'E-posta', type: 'text' },
    { name: 'telefon', label: 'Telefon', type: 'text' },
    { name: 'adres', label: 'Adres', type: 'textarea', localized: true },
    { name: 'instagram', label: 'Instagram', type: 'text' },
    { name: 'facebook', label: 'Facebook', type: 'text' },
    { name: 'youtube', label: 'YouTube', type: 'text' },
    { name: 'formHedefEposta', label: 'İletişim formu hedef e-postası', type: 'text' },
    {
      name: 'gaOlcumKimligi',
      label: 'Google Analytics ölçüm kimliği',
      type: 'text',
      admin: { description: 'G-XXXXXXXXXX biçiminde. Boş bırakılırsa ölçüm yapılmaz ve çerez bildirimi gösterilmez.' },
      validate: (v: unknown) =>
        !v || (typeof v === 'string' && /^G-[A-Z0-9]{4,}$/.test(v)) || 'G-XXXXXXXXXX biçiminde olmalı',
    },
    {
      name: 'cerez',
      label: 'Çerez bildirimi',
      type: 'group',
      admin: { description: 'Ziyaretçi analiz çerezlerine izin vermeden Google Analytics yüklenmez (KVKK).' },
      fields: [
        { name: 'metin', label: 'Bildirim metni', type: 'textarea', localized: true },
        { name: 'kabul', label: 'Kabul düğmesi', type: 'text', localized: true },
        { name: 'reddet', label: 'Reddet düğmesi', type: 'text', localized: true },
        { name: 'aydinlatma', label: 'Aydınlatma metni bağlantısı', type: 'text', localized: true },
        { name: 'tercihler', label: 'Alt bilgideki "Çerez tercihleri" bağlantısı', type: 'text', localized: true },
      ],
    },
  ],
}
