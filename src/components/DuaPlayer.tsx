'use client'

import { useEffect } from 'react'

import { useDua } from './DuaProvider'

/**
 * Üst bilgideki dua düğmesi. Sesin kendisi düzendeki DuaProvider'da çalar; bu düğme sayfa
 * değişince yeniden çizilse de ses sürer. `autoStart` (ana sayfa) oturumda bir kez çalmayı dener;
 * tarayıcı engellerse düğme nabız atar ve kullanıcının sayfadaki ilk dokunuşunda başlar.
 */
export function DuaPlayer({
  autoStart = false,
  label,
  labelPause,
  description,
}: {
  autoStart?: boolean
  label: string
  labelPause: string
  description: string
}) {
  const dua = useDua()
  const otomatikBaslat = dua?.otomatikBaslat

  useEffect(() => {
    if (autoStart && otomatikBaslat) return otomatikBaslat()
  }, [autoStart, otomatikBaslat])

  if (!dua) return null
  const { playing, waiting, progress, toggle, dugme } = dua
  const text = playing ? labelPause : label
  const title = description ? `${text} · ${description}` : text

  return (
    <button
      ref={dugme}
      type="button"
      className={`circle dua-btn${playing ? ' on' : ''}${waiting ? ' bekliyor' : ''}`}
      aria-label={title}
      aria-pressed={playing}
      title={title}
      onClick={toggle}
    >
      {progress > 0 && (
        <svg className="dua-halka" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="19" pathLength={100} strokeDasharray={`${progress} 100`} />
        </svg>
      )}
      {playing ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="7" y="5.5" width="3.2" height="13" rx="1" />
          <rect x="13.8" y="5.5" width="3.2" height="13" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.7-6.2a.8.8 0 0 0 0-1.4L9.7 5.1a.8.8 0 0 0-1.2.7z" />
        </svg>
      )}
    </button>
  )
}
