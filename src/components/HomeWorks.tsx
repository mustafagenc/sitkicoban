'use client'

import { useCallback, useState } from 'react'

import type { Locale } from '@/i18n/config'
import type { UiMetinleri } from '@/payload-types'

import { type LightboxOpen, WorkLightbox } from './WorkLightbox'
import type { Work } from './works'

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
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setOpen({ list: all, index: i })
            }}
          >
            <div className="frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={w.src} alt={w.baslik} loading="lazy" decoding="async" />
            </div>
            <div className="meta">
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
            </div>
          </a>
        ))}
      </div>
      <WorkLightbox works={works} open={open} ui={ui} locale={locale} onClose={close} />
    </>
  )
}
