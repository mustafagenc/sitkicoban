'use client'

import { useEffect, useRef } from 'react'

import type { NavLink } from './navLinks'
import { LOGO_SRC } from './logo'

type Props = {
  open: boolean
  onClose: () => void
  links: NavLink[]
  activeKey?: string
  homeHref: string
  closeLabel: string
  menuLabel: string
}

/** Tam ekran mobil menü (tasarımdaki .mnav); Esc ile de kapanır. */
export function MobileNav({
  open,
  onClose,
  links,
  activeKey,
  homeHref,
  closeLabel,
  menuLabel,
}: Props) {
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    // visibility geçişi başladıktan sonra odaklanabilir; bir an bekle.
    const focusTimer = setTimeout(() => closeBtn.current?.focus(), 50)
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(focusTimer)
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div
      className={open ? 'mnav open' : 'mnav'}
      id="mnav"
      role="dialog"
      aria-modal="true"
      aria-label={menuLabel}
      inert={!open}
    >
      <div className="top">
        <a className="logo" href={homeHref}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="" />
          <span className="name" lang="tr">
            Sıtkı Çoban
          </span>
        </a>
        <button
          ref={closeBtn}
          type="button"
          className="circle"
          id="mclose"
          aria-label={closeLabel}
          onClick={onClose}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <nav className="links" id="mlinks">
        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className={l.key && l.key === activeKey ? 'on' : undefined}
            style={{ transitionDelay: `${0.05 + i * 0.05}s` }}
          >
            {l.label}
          </a>
        ))}
      </nav>
      <div className="foot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="sig" src={LOGO_SRC} alt="" />
      </div>
    </div>
  )
}
