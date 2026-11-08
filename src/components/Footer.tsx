import { localizedPath } from '@/i18n/config'

import { CerezIzni } from './CerezIzni'
import { navLinks } from './navLinks'
import { LOGO_SRC } from './logo'
import type { LayoutProps } from './types'

const CREDIT_NAME = 'Mustafa Genç'
const CREDIT_URL = 'https://mustafagenc.info'

/** "Tasarım ve geliştirme: Mustafa Genç" metnindeki adı bağlantıya çevirir. */
function Credit({ text }: { text: string }) {
  const i = text.indexOf(CREDIT_NAME)
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <a href={CREDIT_URL} target="_blank" rel="noopener" lang="tr">
        {CREDIT_NAME}
      </a>
      {text.slice(i + CREDIT_NAME.length)}
    </>
  )
}

/** Alt bilgi: imza, bağlantılar, sosyal medya, telif ve emeği geçen. */
export function Footer({ locale, ui, ayarlar }: Omit<LayoutProps, 'activeKey'>) {
  return (
    <footer>
      <div className="wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_SRC} alt="" />
        <div className="links">
          {navLinks(locale, ui).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="side">
          <div className="social-ic">
            {ayarlar.instagram && (
              <a href={ayarlar.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
                </svg>
              </a>
            )}
            {ayarlar.facebook && (
              <a href={ayarlar.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 21v-7.5h2.6l.4-3.2h-3V8.4c0-.9.3-1.6 1.6-1.6h1.6V4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.4H8.9v3.2h2.6V21" />
                </svg>
              </a>
            )}
            {ayarlar.youtube && (
              <a href={ayarlar.youtube} target="_blank" rel="noopener" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                  <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
                  <path d="M10.2 9.4v5.2l4.5-2.6z" fill="currentColor" />
                </svg>
              </a>
            )}
          </div>
          <small className="telif">
            {ui.footerTelif}
            {/* Ölçüm kimliği girilmemişse ne bağlantı ne bildirim ne analiz betiği olur. */}
            {ayarlar.gaOlcumKimligi && (
              <>
                {' · '}
                <CerezIzni
                  gaId={ayarlar.gaOlcumKimligi}
                  metin={ayarlar.cerez?.metin ?? ''}
                  kabul={ayarlar.cerez?.kabul ?? ''}
                  reddet={ayarlar.cerez?.reddet ?? ''}
                  aydinlatma={ayarlar.cerez?.aydinlatma ?? ''}
                  aydinlatmaHref={localizedPath('aydinlatma', locale)}
                  tercihler={ayarlar.cerez?.tercihler ?? ''}
                />
              </>
            )}
          </small>
          <small className="credit">
            <Credit text={ui.footerNot ?? ''} />
          </small>
        </div>
      </div>
    </footer>
  )
}
