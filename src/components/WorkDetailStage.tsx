'use client'

import { useCallback, useState } from 'react'

import type { Locale } from '@/i18n/config'
import { duyarli } from '@/lib/img'
import type { UiMetinleri } from '@/payload-types'

import { type LightboxOpen, WorkLightbox } from './WorkLightbox'
import { workAlt, type Work } from './works'

/** Eser detay sayfasındaki çerçeveli görsel: tıklayınca tam ekran yakınlaştırmalı görüntüleyici açılır. */
export function WorkDetailStage({
  work,
  works,
  index,
  ui,
  locale,
}: {
  work: Work
  works: Work[]
  index: number
  ui: UiMetinleri
  locale: Locale
}) {
  const [open, setOpen] = useState<LightboxOpen | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const all = works.map((_, i) => i)

  return (
    <>
      <div className="eser-cerceve">
        <button
          type="button"
          className="eser-tetik"
          aria-label={`${work.baslik} — ${ui.yakinlastir ?? ''}`}
          onClick={() => setOpen({ list: all, index })}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            {...duyarli(work.src, '(max-width: 900px) 100vw, 720px')}
            alt={workAlt(work, locale)}
            width={work.width ?? undefined}
            height={work.height ?? undefined}
            fetchPriority="high"
            decoding="async"
          />
        </button>
        {ui.eserIpucu && <div className="eser-ipucu">{ui.eserIpucu}</div>}
      </div>
      <WorkLightbox works={works} open={open} ui={ui} locale={locale} onClose={close} />
    </>
  )
}
