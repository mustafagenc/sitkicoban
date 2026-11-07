import type { Locale, PageKey } from '@/i18n/config'
import type { SiteAyarlari, UiMetinleri } from '@/payload-types'

/** Ortak düzen bileşenlerinin aldığı veriler (getUi / getSiteAyarlari çıktısı). */
export type LayoutProps = {
  locale: Locale
  ui: UiMetinleri
  ayarlar: SiteAyarlari
  activeKey?: PageKey
}
