'use client'

import { useCallback, useState } from 'react'

import { localizedPath, type Locale } from '@/i18n/config'
import type { UiMetinleri } from '@/payload-types'

import { VideoModal } from './VideoModal'
import type { VideoItem } from './videolar'

/**
 * Ana sayfadaki Video bölümü: işaretli video büyük kapakta, diğer videolar altındaki listede.
 * Kapağa ya da listeye tıklamak oynatıcı penceresini açar; oynatıcı o zamana dek yüklenmez.
 */
export function HomeVideo({
  video,
  list,
  ui,
  locale,
}: {
  video: VideoItem
  /** Tüm videolar (seri listesi ve alttaki liste için). */
  list: VideoItem[]
  ui: UiMetinleri
  locale: Locale
}) {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const others = list.filter((x) => x.id !== video.id).slice(0, 3)

  return (
    <section id="video">
      <div className="wrap video-wrap">
        <button type="button" className="player" aria-label={ui.videoOynat ?? undefined} onClick={() => setOpen(video.id)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={video.kapak} alt={video.baslik} loading="lazy" />
          <span className="play" aria-hidden="true">
            ▶
          </span>
        </button>
        <div>
          {video.kategori && <div className="eyebrow">{video.kategori}</div>}
          <h3>{video.baslik}</h3>
          {video.aciklama && <p>{video.aciklama}</p>}
          {others.length > 0 && (
            <div className="vlist">
              {others.map((x) => (
                <button key={x.id} type="button" onClick={() => setOpen(x.id)}>
                  <bdi>{[x.seri ?? x.kategori, x.baslik].filter(Boolean).join(' · ')}</bdi>
                  {x.sure && <span>{x.sure}</span>}
                </button>
              ))}
            </div>
          )}
          <a className="btn" style={{ marginTop: 20 }} href={localizedPath('videolar', locale)}>
            {ui.tumVideolarOk}
          </a>
        </div>
      </div>
      {open !== null && <VideoModal list={list} id={open} ui={ui} onClose={close} />}
    </section>
  )
}
