import type { Field, GlobalConfig } from 'payload'

import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, adminRead } from '@/lib/access'

const t = (name: string, label: string, type: 'text' | 'textarea' = 'text'): Field =>
  type === 'text'
    ? { name, label, type: 'text', localized: true }
    : { name, label, type: 'textarea', localized: true }

export const Anasayfa: GlobalConfig = {
  slug: 'anasayfa',
  label: 'Ana sayfa',
  access: { read: adminRead.read, update: adminWrite.update },
  hooks: { afterChange: [revalidateHooks('anasayfa').afterChange] },
  fields: [
    t('heroEyebrow', 'Hero üst yazı'),
    t('heroBaslik', 'Hero başlık'),
    t('heroAciklama', 'Hero açıklama', 'textarea'),
    t('eserlerEyebrow', 'Eserler üst yazı'),
    t('eserlerBaslik', 'Eserler başlık'),
    t('eserlerAciklama', 'Eserler açıklama', 'textarea'),
    t('kitaplarEyebrow', 'Kitaplar üst yazı'),
    t('kitaplarBaslik', 'Kitaplar başlık'),
  ],
}
