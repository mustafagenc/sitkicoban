import type { GlobalConfig } from 'payload'

import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, publicRead } from '@/lib/access'

export const SiteAyarlari: GlobalConfig = {
  slug: 'site-ayarlari',
  label: 'Site ayarları',
  access: { read: publicRead.read, update: adminWrite.update },
  hooks: { afterChange: [revalidateHooks('site-ayarlari').afterChange] },
  fields: [
    { name: 'eposta', label: 'E-posta', type: 'text' },
    { name: 'telefon', label: 'Telefon', type: 'text' },
    { name: 'adres', label: 'Adres', type: 'textarea', localized: true },
    { name: 'instagram', label: 'Instagram', type: 'text' },
    { name: 'facebook', label: 'Facebook', type: 'text' },
    { name: 'youtube', label: 'YouTube', type: 'text' },
    { name: 'formHedefEposta', label: 'İletişim formu hedef e-postası', type: 'text' },
  ],
}
