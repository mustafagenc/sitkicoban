'use client'

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import type { Locale } from '@/i18n/config'
import type { UiMetinleri } from '@/payload-types'

import { type LightboxOpen, WorkLightbox } from './WorkLightbox'
import { workMeta } from './workMeta'
import type { Work } from './works'
import { duyarli } from '@/lib/img'

type Layout = 'a' | 'b' | 'c'

const ICONS: Record<Layout, React.ReactNode> = {
  a: (
    <>
      <rect x="2" y="2" width="4.5" height="9" rx=".6" />
      <rect x="2" y="13" width="4.5" height="5" rx=".6" />
      <rect x="7.75" y="2" width="4.5" height="5" rx=".6" />
      <rect x="7.75" y="9" width="4.5" height="9" rx=".6" />
      <rect x="13.5" y="2" width="4.5" height="7" rx=".6" />
      <rect x="13.5" y="11" width="4.5" height="7" rx=".6" />
    </>
  ),
  b: (
    <>
      <rect x="2" y="3" width="6" height="6" rx=".6" />
      <rect x="10" y="3" width="8" height="6" rx=".6" />
      <rect x="2" y="11" width="10" height="6" rx=".6" />
      <rect x="14" y="11" width="4" height="6" rx=".6" />
    </>
  ),
  c: (
    <>
      <rect x="2" y="2" width="7" height="7" rx=".6" />
      <rect x="11" y="2" width="7" height="7" rx=".6" />
      <rect x="2" y="11" width="7" height="7" rx=".6" />
      <rect x="11" y="11" width="7" height="7" rx=".6" />
    </>
  ),
}

/** Eserler galerisi: yazı türü filtresi, üç görünüm (Duvar/Sıralı/Müze) ve görüntüleyici. */
export function WorksGallery({
  works,
  yaziTurleri,
  ui,
  locale,
}: {
  works: Work[]
  /** Çip sırası; yalnızca verideki türler gösterilir. */
  yaziTurleri: string[]
  ui: UiMetinleri
  locale: Locale
}) {
  const [secili, setSecili] = useState<string | null>(null)
  const [layout, setLayout] = useState<Layout>('a')
  const [away, setAway] = useState(false)
  const [open, setOpen] = useState<LightboxOpen | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const present = new Set(works.flatMap((w) => w.yaziTurleri))
  const chips = [...yaziTurleri.filter((y) => present.has(y)), ...[...present].filter((y) => !yaziTurleri.includes(y))]
  const visible = works.map((w, i) => i).filter((i) => !secili || works[i].yaziTurleri.includes(secili))

  // B · Sıralı: görünen eserleri hedef yükseklikte satırlara dizer, her satırı tam genişliğe ölçekler
  const justify = useCallback(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = [...grid.querySelectorAll<HTMLElement>('.card:not(.hide)')]
    const W = grid.clientWidth
    const gap = 26
    const pad = 20
    const target = innerWidth < 860 ? 150 : 250
    let row: HTMLElement[] = []
    let sum = 0
    const flush = (lastRow: boolean) => {
      const free = W - gap * (row.length - 1) - pad * row.length
      const h = lastRow ? Math.min(target, free / sum) : free / sum
      row.forEach((c) => c.style.setProperty('--w', `${parseFloat(c.dataset.r ?? '1') * h + pad}px`))
      row = []
      sum = 0
    }
    cards.forEach((c) => {
      row.push(c)
      sum += parseFloat(c.dataset.r ?? '1')
      if (sum * target + (gap + pad) * row.length > W) flush(false)
    })
    if (row.length) flush(true)
  }, [])

  useLayoutEffect(() => {
    justify()
  }, [justify, secili, layout, works])
  useEffect(() => {
    addEventListener('resize', justify)
    return () => removeEventListener('resize', justify)
  }, [justify])

  // Kayıtlı görünüm
  useEffect(() => {
    try {
      const l = localStorage.getItem('galeri')
      // localStorage yalnızca tarayıcıda okunur (sayfa statik); mount sonrası uygulanır.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (l === 'a' || l === 'b' || l === 'c') setLayout(l)
    } catch {}
  }, [])
  const pick = (l: Layout) => {
    setLayout(l)
    try {
      localStorage.setItem('galeri', l)
    } catch {}
  }

  // Alt bilgiye gelince seçici kaybolur
  useEffect(() => {
    const foot = document.querySelector('footer')
    if (!foot) return
    const check = () => setAway(foot.getBoundingClientRect().top < innerHeight - 10)
    check()
    addEventListener('scroll', check, { passive: true })
    addEventListener('resize', check)
    return () => {
      removeEventListener('scroll', check)
      removeEventListener('resize', check)
    }
  }, [])

  const close = useCallback(() => setOpen(null), [])
  const labels: Record<Layout, string> = {
    a: ui.gorunumDuvar ?? '',
    b: ui.gorunumSirali ?? '',
    c: ui.gorunumMuze ?? '',
  }

  return (
    <div data-layout={layout}>
      <div className="wrap">
        <div className="fgroup" id="yazi">
          {[null, ...chips].map((c) => (
            <button
              key={c ?? '__all'}
              type="button"
              className={`chip${secili === c ? ' on' : ''}`}
              onClick={() => setSecili(c)}
            >
              {c ?? ui.tumu}
            </button>
          ))}
        </div>
      </div>

      <main className="gallery">
        <div className="wrap">
          <div className="grid" id="grid" ref={gridRef}>
            {works.map((w, i) => {
              const meta = workMeta(w)
              return (
                <a
                  key={w.id}
                  className={`card${visible.includes(i) ? '' : ' hide'}`}
                  href="#"
                  data-r={w.oran}
                  style={{ '--r': w.oran } as React.CSSProperties}
                  onClick={(e) => {
                    e.preventDefault()
                    setOpen({ list: visible, index: i })
                  }}
                >
                  <div className="mat">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      {...duyarli(w.src, '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 400px')}
                      alt={w.baslik}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="cap">
                    <h3>{w.baslik}</h3>
                    {meta.length > 0 && (
                      <div className="meta">
                        {meta.map((m, k) => (
                          <Fragment key={k}>
                            {k > 0 && <span className="dot">❖</span>}
                            {m}
                          </Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
          <p
            id="empty"
            hidden={visible.length > 0}
            style={{
              textAlign: 'center',
              color: 'var(--ink-soft)',
              fontStyle: 'italic',
              padding: '40px 0',
            }}
          >
            {ui.bosSecim}
          </p>
        </div>
      </main>

      <div className={`switch${away ? ' away' : ''}`} role="group" aria-label={ui.gorunumEtiket ?? ''}>
        {(['a', 'b', 'c'] as const).map((l) => (
          <button
            key={l}
            type="button"
            className={layout === l ? 'on' : undefined}
            data-tip={labels[l]}
            aria-label={labels[l]}
            aria-pressed={layout === l}
            onClick={() => pick(l)}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
              {ICONS[l]}
            </svg>
          </button>
        ))}
      </div>

      <WorkLightbox works={works} open={open} ui={ui} locale={locale} onClose={close} />
    </div>
  )
}
