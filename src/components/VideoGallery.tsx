'use client'

import { useCallback, useRef, useState } from 'react'

import type { UiMetinleri } from '@/payload-types'

import { PostMeta } from './PostMeta'
import { VideoModal } from './VideoModal'
import type { VideoItem } from './videolar'

const PLAY = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 4.5v15l13-7.5z" />
  </svg>
)

/**
 * Videolar sayfası: kategori çipleri, video sayısı, kartlar ve oynatıcı penceresi.
 * Kartlar YouTube kapağını i.ytimg.com'dan alır; oynatıcı yalnızca kart tıklanınca kurulur.
 */
export function VideoGallery({
  videos,
  kategoriler,
  ui,
}: {
  videos: VideoItem[]
  /** Tüm kategoriler, panel sırasıyla (boş olanlar da çip olur). */
  kategoriler: { id: number; ad: string }[]
  ui: UiMetinleri
}) {
  const [kat, setKat] = useState<number | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const head = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(null), [])

  const gorunur = kat === null ? videos : videos.filter((v) => v.kategoriId === kat)

  const sec = (id: number | null) => {
    setKat(id)
    const top = head.current?.getBoundingClientRect().top
    if (top !== undefined && (top > 80 || top < 0)) head.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <div className="list-head" ref={head}>
        <h2>{ui.videolarListeBaslik}</h2>
        {kategoriler.length > 0 && (
          <div className="cats" role="group" aria-label={ui.videoKategoriGrubu ?? undefined}>
            {[null, ...kategoriler].map((c) => (
              <button
                key={c?.id ?? '__all'}
                type="button"
                className={`chip${(c?.id ?? null) === kat ? ' on' : ''}`}
                aria-pressed={(c?.id ?? null) === kat}
                onClick={() => sec(c?.id ?? null)}
              >
                {c ? c.ad : ui.tumu}
              </button>
            ))}
          </div>
        )}
        <div className="vcount" aria-live="polite">
          {(ui.videoSayisi ?? '').replace('{n}', String(gorunur.length))}
        </div>
      </div>

      <div className="grid">
        {gorunur.map((v) => (
          <button key={`${kat}-${v.id}`} type="button" className="vid" onClick={() => setOpen(v.id)}>
            <div className="thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.kapak} alt="" loading="lazy" />
              <span className="pl">{PLAY}</span>
              {v.sure && <span className="dur">{v.sure}</span>}
            </div>
            {(v.kategori || v.dersNo) && <div className="eyebrow">{[v.kategori, v.dersNo].filter(Boolean).join(' · ')}</div>}
            <h3>{v.baslik}</h3>
            <PostMeta parts={[v.kanal, v.tarih, v.sure]} />
          </button>
        ))}
      </div>
      {gorunur.length === 0 && <p className="bos">{ui.videolarBos}</p>}

      {open !== null && <VideoModal list={videos} id={open} ui={ui} onClose={close} />}
    </>
  )
}
