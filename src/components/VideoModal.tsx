'use client'

import { useEffect, useRef, useState } from 'react'

import { youtubeEmbed, youtubeWatch } from '@/lib/youtube'
import type { UiMetinleri } from '@/payload-types'

import { PostMeta } from './PostMeta'
import { bolumAdi, seriVideolari, type VideoItem } from './videolar'
import '../app/(frontend)/styles/videolar.css'

/**
 * Oynatıcı penceresi. Bağlandığında açılır ve gömülü oynatıcı (youtube-nocookie) ancak o zaman kurulur;
 * seri bölümleri yandaki listeden seçilir. Esc ve dış alana tıklama kapatır, odak açan öğeye döner.
 */
export function VideoModal({
  list,
  id,
  ui,
  onClose,
}: {
  /** Seri listesi için tüm videolar. */
  list: VideoItem[]
  /** Açılışta oynatılacak videonun kimliği. */
  id: number
  ui: UiMetinleri
  onClose: () => void
}) {
  const [cur, setCur] = useState(id)
  const [shown, setShown] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const v = list.find((x) => x.id === cur) ?? list.find((x) => x.id === id)
  const seri = v ? seriVideolari(list, v) : []

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

  // Kapatma düğmesi görünür olunca odaklanır (geçiş başında hâlâ visibility:hidden).
  useEffect(() => {
    if (!shown) return
    const t = setTimeout(() => closeRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [shown])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Tab' && sheetRef.current) {
        // Odak pencerenin içinde döner.
        const f = [...sheetRef.current.querySelectorAll<HTMLElement>('button, a[href], iframe')]
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        const a = document.activeElement
        if (e.shiftKey && (a === first || !sheetRef.current.contains(a))) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && a === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [onClose])

  if (!v) return null

  return (
    <div
      className={`vmodal${shown ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="v-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="sheet" ref={sheetRef}>
        <button type="button" className="x" ref={closeRef} aria-label={ui.kapat ?? ''} onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="player">
          <iframe
            key={v.youtubeId}
            src={youtubeEmbed(v.youtubeId)}
            title={v.baslik}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <div className="info">
          {v.kategori && <div className="eyebrow">{v.kategori}</div>}
          <h2 id="v-title">{v.baslik}</h2>
          {v.altBaslik && <div className="meta sub">{v.altBaslik}</div>}
          {v.aciklama && <p>{v.aciklama}</p>}
          <PostMeta parts={[v.kanal, v.tarih, v.sure]} />
          <a className="meta yt" href={youtubeWatch(v.youtubeId)} target="_blank" rel="noopener noreferrer">
            {ui.youtubedaAc}
          </a>
          {seri.length > 1 && (
            <div className="series">
              <div className="lbl">
                {(ui.videoSeriBaslik ?? '').replace('{seri}', v.seri ?? '').replace('{n}', String(seri.length))}
              </div>
              {seri.map((x) => (
                <button key={x.id} type="button" className={x.id === v.id ? 'on' : undefined} onClick={() => setCur(x.id)}>
                  {x.bolum !== null ? `${x.bolum}. ` : ''}
                  {bolumAdi(x)}
                  {x.sure && <span>{x.sure}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
