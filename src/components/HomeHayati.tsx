import { localizedPath, type Locale } from '@/i18n/config'
import { RichText } from '@/lib/richtext'
import type { Hayati, UiMetinleri } from '@/payload-types'

import { portreUrl } from './hayati'

/* Ana sayfadaki Hayatı bölümü (panelden); "Devamını oku" Hayatı sayfasına gider. */
export function HomeHayati({
  hayati,
  ui,
  locale,
  eyebrow,
}: {
  hayati: Hayati
  ui: UiMetinleri
  locale: Locale
  eyebrow: string
}) {
  const portre = portreUrl(hayati)
  return (
    <section id="hayati">
      <div className="wrap about">
        {portre ? (
          <div
            className="photo has-img"
            role="img"
            aria-label={ui.hayatiPortreAlt ?? undefined}
            style={{ backgroundImage: `url("${portre}")` }}
          />
        ) : (
          <div className="photo" />
        )}
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          {ui.anasayfaHayatiBaslik && <h2>{ui.anasayfaHayatiBaslik}</h2>}
          <RichText data={hayati.anasayfaOzet} locale={locale} />
          {hayati.anasayfaSoz && <div className="quote">{hayati.anasayfaSoz}</div>}
          {ui.devaminiOku && (
            <a className="btn" href={localizedPath('hayati', locale)}>
              {ui.devaminiOku}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
