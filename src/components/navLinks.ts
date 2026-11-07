import { localizedPath, TASARIM_LINKS, type Locale, type PageKey } from '@/i18n/config'
import type { UiMetinleri } from '@/payload-types'

export type NavLink = { href: string; label: string; key?: PageKey }

/** Üst menü, mobil menü ve alt bilgideki altı bağlantı (tasarımdaki sırayla). */
export function navLinks(locale: Locale, ui: UiMetinleri): NavLink[] {
  return [
    { key: 'eserler', href: localizedPath('eserler', locale), label: ui.navEserler ?? '' },
    { key: 'yazilar', href: localizedPath('yazilar', locale), label: ui.navYazilar ?? '' },
    { key: 'kitaplar', href: localizedPath('kitaplar', locale), label: ui.navKitaplar ?? '' },
    { key: 'videolar', href: localizedPath('videolar', locale), label: ui.navVideolar ?? '' },
    { key: 'hayati', href: localizedPath('hayati', locale), label: ui.navHayati ?? '' },
    { href: TASARIM_LINKS.iletisim, label: ui.navIletisim ?? '' },
  ]
}
