'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { TASARIM_LINKS, type Locale } from '@/i18n/config'
import type { UiMetinleri } from '@/payload-types'

import { type Work } from './works'
import '../app/(frontend)/styles/eser-lb.css'

/** Görüntüleyicinin açılışı: gezilecek eserlerin `works` içindeki sıraları ve açılacak eser. */
export type LightboxOpen = { list: number[]; index: number }

/** Hicrî yıl + karşılık gelen miladî yıllar: 1442 -> "1442 (2020–21)". Sayı değilse olduğu gibi. */
export function tarih(y: string): string {
  if (!/^\d{3,4}$/.test(y)) return y
  const n = +y
  const a = Math.floor((n - 1) * 0.970229 + 622.5)
  return `${n} (${a}–${String(a + 1).slice(2)})`
}

type Z = { s: number; x: number; y: number; w: number; h: number; max: number }

/**
 * Tam sayfa eser görüntüleyici (Eserler sayfası ve ana sayfa kullanır).
 * `open` null ise kapalıdır; oklar yalnızca `open.list` içinde gezer.
 */
export function WorkLightbox({
  works,
  open,
  ui,
  onClose,
}: {
  works: Work[]
  open: LightboxOpen | null
  ui: UiMetinleri
  locale: Locale
  onClose: () => void
}) {
  const [session, setSession] = useState<LightboxOpen | null>(null)
  const [cur, setCur] = useState(0)
  const [pct, setPct] = useState(100)
  const [zoomed, setZoomed] = useState(false)
  const [dragging, setDragging] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const z = useRef<Z>({ s: 1, x: 0, y: 0, w: 0, h: 0, max: 4 })
  const isOpen = open !== null

  // Açılışta oturumu yenile; kapanınca son eser sönerek kalsın diye silme.
  useEffect(() => {
    if (!open) return
    setSession(open)
    setCur(Math.max(0, open.list.indexOf(open.index)))
  }, [open])

  const list = session?.list ?? []
  const work: Work | undefined = list.length ? works[list[Math.min(cur, list.length - 1)]] : undefined

  const render = useCallback((anim?: boolean) => {
    const stage = stageRef.current
    const img = imgRef.current
    if (!stage || !img) return
    const s = z.current
    const W = stage.clientWidth
    const H = stage.clientHeight
    const sw = s.w * s.s
    const sh = s.h * s.s
    s.x = sw <= W ? (W - sw) / 2 : Math.min(0, Math.max(W - sw, s.x))
    s.y = sh <= H ? (H - sh) / 2 : Math.min(0, Math.max(H - sh, s.y))
    img.style.transition = anim ? 'transform .25s ease' : 'none'
    img.style.transform = `translate(${s.x}px, ${s.y}px) scale(${s.s})`
    setZoomed(s.s > 1.01)
    setPct(Math.round(s.s * 100))
  }, [])

  const fit = useCallback(() => {
    const stage = stageRef.current
    const img = imgRef.current
    if (!stage || !img || !img.naturalWidth) return
    const W = stage.clientWidth
    const H = stage.clientHeight
    const mob = innerWidth < 860
    const mx = mob ? 40 : 160
    const my = mob ? 90 : 120
    const r = img.naturalWidth / img.naturalHeight
    let w = W - mx
    let h = w / r
    if (h > H - my) {
      h = H - my
      w = h * r
    }
    Object.assign(z.current, {
      s: 1,
      w,
      h,
      x: (W - w) / 2,
      y: (H - h) / 2 - (mob ? 20 : 10),
      max: Math.max(2, (img.naturalWidth / w) * 1.5),
    })
    img.style.width = `${w}px`
    img.style.height = `${h}px`
    render()
  }, [render])

  // Eser değişince görseli yükle (yüklenene dek saydam)
  useEffect(() => {
    const img = imgRef.current
    if (!img || !work || !isOpen) return
    img.style.opacity = '0'
    img.onload = () => {
      fit()
      img.style.opacity = '1'
    }
    img.src = work.src
  }, [work, isOpen, fit])

  const zoomAt = useCallback(
    (ns: number, px: number, py: number, anim?: boolean) => {
      const s = z.current
      ns = Math.min(s.max, Math.max(1, ns))
      s.x = px - (px - s.x) * (ns / s.s)
      s.y = py - (py - s.y) * (ns / s.s)
      s.s = ns
      render(anim)
    },
    [render],
  )
  const center = (): [number, number] => {
    const st = stageRef.current
    return [(st?.clientWidth ?? 0) / 2, (st?.clientHeight ?? 0) / 2]
  }

  const step = useCallback(
    (d: number) => setCur((c) => (list.length ? (c + d + list.length) % list.length : 0)),
    [list.length],
  )

  // Klavye, kaydırma kilidi, odak
  useEffect(() => {
    if (!isOpen) return
    const prevFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === '+' || e.key === '=') zoomAt(z.current.s * 1.5, ...center(), true)
      else if (e.key === '-') zoomAt(z.current.s / 1.5, ...center(), true)
    }
    const onResize = () => fit()
    addEventListener('keydown', onKey)
    addEventListener('resize', onResize)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('resize', onResize)
      document.body.style.overflow = ''
      prevFocus?.focus?.()
    }
  }, [isOpen, onClose, step, zoomAt, fit])

  // Tekerlek ile yakınlaştırma (passive: false gerekir)
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const b = stage.getBoundingClientRect()
      zoomAt(z.current.s * Math.exp(-e.deltaY * 0.0015), e.clientX - b.left, e.clientY - b.top)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  // Sürükleme ve iki parmakla büyütme
  const pts = useRef(new Map<number, [number, number]>())
  const last = useRef<[number, number] | null>(null)
  const pinch = useRef<{ d: number; s: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    stageRef.current?.setPointerCapture(e.pointerId)
    pts.current.set(e.pointerId, [e.clientX, e.clientY])
    if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()]
      pinch.current = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: z.current.s }
    }
    last.current = [e.clientX, e.clientY]
    setDragging(true)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pts.current.has(e.pointerId)) return
    pts.current.set(e.pointerId, [e.clientX, e.clientY])
    if (pinch.current && pts.current.size === 2) {
      const [a, b] = [...pts.current.values()]
      const r = stageRef.current!.getBoundingClientRect()
      zoomAt(
        (pinch.current.s * Math.hypot(a[0] - b[0], a[1] - b[1])) / pinch.current.d,
        (a[0] + b[0]) / 2 - r.left,
        (a[1] + b[1]) / 2 - r.top,
      )
    } else if (z.current.s > 1.01 && last.current) {
      z.current.x += e.clientX - last.current[0]
      z.current.y += e.clientY - last.current[1]
      render()
    }
    last.current = [e.clientX, e.clientY]
  }
  const onPointerUp = (e: React.PointerEvent) => {
    pts.current.delete(e.pointerId)
    if (pts.current.size < 2) pinch.current = null
    if (!pts.current.size) setDragging(false)
    last.current = pts.current.size ? [...pts.current.values()][0] : null
  }
  const onDouble = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    const b = stageRef.current!.getBoundingClientRect()
    zoomAt(z.current.s > 1.01 ? 1 : 2.5, e.clientX - b.left, e.clientY - b.top, true)
  }

  const bilgi = ui.bilgiGirilecek ?? ''
  const row = (k: string | null | undefined, v: string | null) => (
    <>
      <dt>{k}</dt>
      <dd className={v ? undefined : 'none'}>{v || bilgi}</dd>
    </>
  )
  const tags = work ? [...work.yaziTurleri, work.tur].filter((s): s is string => Boolean(s)) : []
  const single = list.length < 2

  return (
    <div
      className={`lb${isOpen ? ' open' : ''}`}
      id="lb"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lb-title"
      aria-hidden={!isOpen}
    >
      <div
        className={`lb-stage${zoomed ? ' zoomed' : ''}${dragging ? ' dragging' : ''}`}
        id="stage"
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDouble}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} id="lb-img" alt={work?.baslik ?? ''} draggable={false} />
        <div className="lb-hint">{ui.eserIpucu}</div>
        <button
          type="button"
          className="lb-nav prev"
          aria-label={ui.onceki ?? ''}
          hidden={single}
          onClick={() => step(-1)}
        >
          ←
        </button>
        <button
          type="button"
          className="lb-nav next"
          aria-label={ui.sonraki ?? ''}
          hidden={single}
          onClick={() => step(1)}
        >
          →
        </button>
        <div className="lb-ctrl">
          <button
            type="button"
            className="m-nav"
            aria-label={ui.onceki ?? ''}
            hidden={single}
            onClick={() => step(-1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label={ui.uzaklastir ?? ''}
            onClick={() => zoomAt(z.current.s / 1.5, ...center(), true)}
          >
            −
          </button>
          <button type="button" className="pct" tabIndex={-1}>
            {pct}%
          </button>
          <button
            type="button"
            aria-label={ui.yakinlastir ?? ''}
            onClick={() => zoomAt(z.current.s * 1.5, ...center(), true)}
          >
            +
          </button>
          <button
            type="button"
            className="m-nav"
            aria-label={ui.sonraki ?? ''}
            style={{ order: 9 }}
            hidden={single}
            onClick={() => step(1)}
          >
            →
          </button>
          <button type="button" aria-label={ui.sigdir ?? ''} onClick={() => zoomAt(1, ...center(), true)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
            </svg>
          </button>
        </div>
      </div>
      <aside className="lb-side">
        <div className="lb-head">
          <span className="pos">{list.length ? `${Math.min(cur, list.length - 1) + 1} / ${list.length}` : ''}</span>
          <button
            type="button"
            className="lb-close"
            ref={closeRef}
            aria-label={ui.kapat ?? ''}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="lb-body">
          {work && (
            <>
              <h2 id="lb-title">{work.baslik}</h2>
              {tags.length > 0 && (
                <div className="tags">
                  {tags.map((g, i) => (
                    <span className="tag" key={`${i}-${g}`}>
                      {g}
                    </span>
                  ))}
                </div>
              )}
              {work.metin && (
                <div className="ar" lang="ar">
                  {work.metin}
                </div>
              )}
              {work.anlam && <p className="mean">“{work.anlam}”</p>}
              {work.kaynak ? (
                <div className="src">{work.kaynak}</div>
              ) : work.anlam ? (
                <div className="src" />
              ) : null}
              {work.aciklama && <p className="desc">{work.aciklama}</p>}
              <dl>
                {row(ui.eserTarih, work.yil ? tarih(work.yil) : null)}
                {row(ui.olcu, work.olcu)}
                {row(ui.malzeme, work.malzeme)}
                {row(ui.tezhip, work.tezhip)}
                {row(ui.ebru, work.ebru)}
              </dl>
              <a
                className="ask"
                href={`${TASARIM_LINKS.iletisim}?eser=${encodeURIComponent(work.baslik)}`}
              >
                {ui.eserSor}
              </a>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
