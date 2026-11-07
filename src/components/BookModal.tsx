'use client'

import { useEffect, useRef, useState } from 'react'

import { TASARIM_LINKS } from '@/i18n/config'
import type { UiMetinleri } from '@/payload-types'

import { AUTHOR_FALLBACK, type Book, roleLabel } from './books'
import { BookCover } from './BookCover'
import '../app/(frontend)/styles/kitap-lb.css'

/**
 * Kitap ayrıntı penceresi (Kitaplar sayfası ve ana sayfa kullanır).
 * Bağlandığında açılır; `list` içinde gezer, tek kitapta oklar gizlenir.
 */
export function BookModal({
  list,
  index,
  ui,
  onClose,
}: {
  list: Book[]
  /** Açılışta gösterilecek kitabın `list` içindeki sırası. */
  index: number
  ui: UiMetinleri
  onClose: () => void
}) {
  const [cur, setCur] = useState(Math.min(Math.max(0, index), Math.max(0, list.length - 1)))
  const [shown, setShown] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const n = list.length
  const b = list[Math.min(cur, n - 1)]
  const single = n < 2

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    const raf = requestAnimationFrame(() => setShown(true))
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = ''
      prevFocus?.focus?.()
    }
  }, [])

  // Kapatma düğmesi görünür olunca odaklanır: geçiş başında hâlâ visibility:hidden olduğundan kısa gecikme gerekir
  useEffect(() => {
    if (!shown) return
    const t = setTimeout(() => closeRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [shown])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (n > 1 && e.key === 'ArrowRight') setCur((c) => (c + 1) % n)
      else if (n > 1 && e.key === 'ArrowLeft') setCur((c) => (c - 1 + n) % n)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [n, onClose])

  if (!b) return null
  const role = roleLabel(ui, b.rol)
  const bilgi = ui.bilgiGirilecek ?? ''
  const row = (k: string | null | undefined, v: string | null) => (
    <>
      <dt>{k}</dt>
      <dd className={v ? undefined : 'none'}>{v || bilgi}</dd>
    </>
  )

  return (
    <div
      className={`modal${shown ? ' open' : ''}`}
      id="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="m-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="sheet">
        <button
          type="button"
          className="circle x"
          id="m-close"
          ref={closeRef}
          aria-label={ui.kapat ?? ''}
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="left">
          <div className="cover" id="m-cover">
            <BookCover kitap={b} />
          </div>
        </div>
        <div className="right" id="m-body">
          {role && <div className="eyebrow">{role}</div>}
          <h2 id="m-title">{b.baslik}</h2>
          <div className="by">
            {b.altBaslik && (
              <>
                {b.altBaslik}
                <br />
              </>
            )}
            {b.asilYazar
              ? `${b.asilYazar}${role ? ` · ${role.toLowerCase()}: ${AUTHOR_FALLBACK}` : ''}`
              : AUTHOR_FALLBACK}
          </div>
          {b.aciklama && <p className="desc">{b.aciklama}</p>}
          <dl>
            {row(ui.yayinevi, b.yayinevi)}
            {row(ui.yil, b.yil)}
            {row(ui.sayfa, b.sayfa)}
            {row(ui.isbn, b.isbn)}
          </dl>
          {b.satinAlLinki && (
            <a className="btn primary" href={b.satinAlLinki} target="_blank" rel="noopener noreferrer">
              {ui.satinAl}
            </a>
          )}
          <a className="btn" href={TASARIM_LINKS.yazilar}>
            {ui.ilgiliYazilar}
          </a>
          {!single && (
            <div className="sheet-nav">
              <button type="button" id="m-prev" onClick={() => setCur((c) => (c - 1 + n) % n)}>
                {ui.oncekiKitap}
              </button>
              <button type="button" id="m-next" onClick={() => setCur((c) => (c + 1) % n)}>
                {ui.sonrakiKitap}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
