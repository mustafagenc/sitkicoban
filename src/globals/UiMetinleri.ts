import type { GlobalConfig } from 'payload'

import { revalidateHooks } from '@/lib/cache/revalidate'
import { adminWrite, publicRead } from '@/lib/access'

/** Anahtar -> yönetici paneli etiketi. Anahtar eklemek için buraya satır ekleyin. */
const LABELS = {
  navEserler: 'Menü: Eserler',
  navYazilar: 'Menü: Yazılar',
  navKitaplar: 'Menü: Kitaplar',
  navVideolar: 'Menü: Videolar',
  navHayati: 'Menü: Hayatı',
  navIletisim: 'Menü: İletişim',
  tumu: 'Tümü',
  tumuOk: 'Tümü (ok ile)',
  bilgiGirilecek: 'Bilgi girilecek',
  satinAl: 'Satın al',
  ilgiliYazilar: 'İlgili yazılar',
  oncekiKitap: 'Önceki kitap',
  sonrakiKitap: 'Sonraki kitap',
  rolYazar: 'Rol: Yazar',
  rolHazirlayan: 'Rol: Hazırlayan',
  rolSadelestiren: 'Rol: Sadeleştiren',
  rolDerleyen: 'Rol: Derleyen',
  olcu: 'Ölçü',
  malzeme: 'Malzeme',
  tezhip: 'Tezhip',
  ebru: 'Ebru',
  kaynak: 'Kaynak',
  yil: 'Yıl',
  yayinevi: 'Yayınevi',
  sayfa: 'Sayfa',
  isbn: 'ISBN',
  gorunumDuvar: 'Görünüm: Duvar',
  gorunumSirali: 'Görünüm: Sıralı',
  gorunumMuze: 'Görünüm: Müze',
  gorunumEtiket: 'Görünüm: Etiket',
  bosSecim: 'Boş seçim',
  menuAc: 'Menüyü aç',
  menuKapat: 'Menüyü kapat',
  temaDegistir: 'Temayı değiştir',
  dilSec: 'Dil seç',
  asagiKaydir: 'Aşağı kaydır',
  kapat: 'Kapat',
  onceki: 'Önceki',
  sonraki: 'Sonraki',
  eserlerBaslik: 'Eserler sayfası başlığı',
  eserlerAciklama: 'Eserler sayfası açıklaması',
  kitaplarBaslik: 'Kitaplar sayfası başlığı',
  kitaplarAciklama: 'Kitaplar sayfası açıklaması',
  footerTelif: 'Alt bilgi: telif',
  footerNot: 'Alt bilgi: not',
} as const

export type UiKey = keyof typeof LABELS
export const UI_KEYS = Object.keys(LABELS) as readonly UiKey[]

export const UiMetinleri: GlobalConfig = {
  slug: 'ui-metinleri',
  label: 'Arayüz metinleri',
  access: { read: publicRead.read, update: adminWrite.update },
  hooks: { afterChange: [revalidateHooks('ui-metinleri').afterChange] },
  fields: UI_KEYS.map((k) => ({ name: k, label: LABELS[k], type: 'text' as const, localized: true })),
}
