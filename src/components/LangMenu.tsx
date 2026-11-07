'use client'

import { useEffect, useRef, useState } from 'react'

import { LOCALES, localizedPath, type Locale, type PageKey } from '@/i18n/config'

export const LANGUAGE_NAMES: Record<Locale, string> = { tr: 'Türkçe', en: 'English', ar: 'العربية' }

type Props = { locale: Locale; activeKey: PageKey; label: string }

/** Dil seçici: daire içinde kısa kod; açılan listede aynı sayfanın diğer dillerdeki adresi. */
export function LangMenu({ locale, activeKey, label }: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      btn.current?.focus()
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={open ? 'lang open' : 'lang'} id="lang" ref={root}>
      <button
        ref={btn}
        type="button"
        className="lang-btn"
        id="lbtn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${label} (${LANGUAGE_NAMES[locale]})`}
        onClick={() => setOpen((o) => !o)}
      >
        {locale.toUpperCase()}
      </button>
      <ul className="lang-menu" role="menu">
        {LOCALES.map((l) => (
          <li key={l}>
            <a
              href={localizedPath(activeKey, l)}
              role="menuitem"
              hrefLang={l}
              lang={l}
              aria-current={l === locale ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              {l === 'ar' ? <span className="ar">{LANGUAGE_NAMES[l]}</span> : LANGUAGE_NAMES[l]}{' '}
              <span className="code">{l.toUpperCase()}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
