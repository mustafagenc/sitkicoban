'use client'

import { useCallback, useRef, useState } from 'react'

import { localizedPath } from '@/i18n/config'

import { LangMenu } from './LangMenu'
import { LogoMark } from './LogoMark'
import { MobileNav } from './MobileNav'
import { navLinks } from './navLinks'
import { ThemeToggle } from './ThemeToggle'
import type { LayoutProps } from './types'

/** Üst bilgi: logo, menü, dil seçici, tema düğmesi; dar ekranda mobil menüyü açar. */
export function Header({
  locale,
  ui,
  activeKey = 'home',
  glintOnLoad = true,
  yaziSlug,
}: Omit<LayoutProps, 'ayarlar'> & {
  /** Yazı sayfasında dil menüsü aynı yazıya gider. */
  yaziSlug?: string
  /** Logo açılışta bir kez parlasın mı (ana sayfada kapalı). */
  glintOnLoad?: boolean
}) {
  const [open, setOpen] = useState(false)
  const menuBtn = useRef<HTMLButtonElement>(null)
  const links = navLinks(locale, ui)
  const homeHref = localizedPath('home', locale)

  const close = useCallback(() => {
    setOpen(false)
    menuBtn.current?.focus()
  }, [])

  return (
    <>
      <header>
        <div className="wrap">
          <a className="logo" href={homeHref}>
            <LogoMark alt={ui.logoAlt ?? ''} glintOnLoad={glintOnLoad} />
            <span className="name" lang="tr">
              Sıtkı Çoban
            </span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <nav>
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className={l.key && l.key === activeKey ? 'on' : undefined}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="tools">
              <LangMenu locale={locale} activeKey={activeKey} label={ui.dilSec ?? ''} yaziSlug={yaziSlug} />
              <ThemeToggle label={ui.temaDegistir ?? ''} labelDark={ui.temaGunduz ?? ''} />
              <button
                ref={menuBtn}
                type="button"
                className="circle menu-btn"
                id="mbtn"
                aria-label={ui.menuAc ?? ''}
                aria-expanded={open}
                aria-controls="mnav"
                onClick={() => setOpen(true)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M4 7h16M4 12h16M8 17h12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobileNav
        open={open}
        onClose={close}
        links={links}
        activeKey={activeKey}
        homeHref={homeHref}
        closeLabel={ui.menuKapat ?? ''}
        menuLabel={ui.menu ?? ''}
      />
    </>
  )
}
