'use client'

import { useCallback, useState } from 'react'

import { eserPath, type Locale } from '@/i18n/config'
import type { UiMetinleri } from '@/payload-types'

import { type LightboxOpen, WorkLightbox } from './WorkLightbox'
import { workAlt, type Work } from './works'
import { duyarli } from '@/lib/img'

/** Seçme eserler: ilki büyük; tıklanan eser görüntüleyicide açılır, oklar bu eserler arasında gezer. */
export function HomeWorks({ works, ui, locale }: { works: Work[]; ui: UiMetinleri; locale: Locale }) {
  const [open, setOpen] = useState<LightboxOpen | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const all = works.map((_, i) => i)

  return (
    <>
      <div className="works">
        {works.map((w, i) => (
          <a
            key={w.id}
            className={`work${i === 0 ? ' big' : ''}`}
            href={eserPath(w.slug, locale)}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
              e.preventDefault()
              setOpen({ list: all, index: i })
            }}
          >
            <figure style={{ display: 'contents', margin: 0 }}>
              <div className="frame">
                {/* İlk (büyük) eser mobilde sayfanın en büyük öğesi: tembel yüklenmez, öncelikle istenir. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  {...duyarli(w.src, i === 0 ? '(max-width: 860px) 100vw, 640px' : '(max-width: 860px) 50vw, 320px')}
                  alt={workAlt(w, locale)}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              </div>
              <figcaption className="meta">
                <span className="no">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{w.baslik}</h3>
                  <div className="tags">
                    {[...w.yaziTurleri, ...(w.tur ? [w.tur] : [])].map((t) => (
                      <span key={t} className="tag-chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </figcaption>
            </figure>
          </a>
        ))}
      </div>
      <WorkLightbox works={works} open={open} ui={ui} locale={locale} onClose={close} syncUrl />
    </>
  )
}
