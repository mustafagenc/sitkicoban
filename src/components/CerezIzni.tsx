'use client'

import { useCallback, useEffect, useState } from 'react'

/** Ziyaretçinin kararı; yalnızca bu tarayıcıda tutulur. */
const ANAHTAR = 'cerez'
type Karar = 'kabul' | 'red'

type Props = {
  metin: string
  kabul: string
  reddet: string
  aydinlatma: string
  aydinlatmaHref: string
  tercihler: string
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function okuKarar(): Karar | null {
  try {
    const v = localStorage.getItem(ANAHTAR)
    return v === 'kabul' || v === 'red' ? v : null
  } catch {
    return null
  }
}

function yazKarar(k: Karar) {
  try {
    localStorage.setItem(ANAHTAR, k)
  } catch {}
}

/** Google etiketi (GoogleTag) izin modunda zaten yüklü; burada yalnızca analiz izni açılır/kapanır. */
function izinVer(granted: boolean) {
  window.gtag?.('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' })
}

/** İzin geri alınınca daha önce yazılmış GA çerezleri de silinir. */
function gaCerezleriniSil() {
  for (const c of document.cookie.split(';')) {
    const ad = c.split('=')[0].trim()
    if (ad === '_ga' || ad.startsWith('_ga_') || ad === '_gid') {
      const alan = location.hostname.split('.').slice(-2).join('.')
      document.cookie = `${ad}=; Max-Age=0; path=/`
      document.cookie = `${ad}=; Max-Age=0; path=/; domain=.${alan}`
    }
  }
}

/**
 * Çerez bildirimi. Karar verilene kadar Google etiketi çerez yazmaz (izin modu: yalnızca çerezsiz
 * sinyaller); kabul edilirse analiz çerezleri açılır. Alt bilgideki "Çerez tercihleri" bağlantısı
 * bildirimi yeniden açar.
 */
export function CerezIzni({ metin, kabul, reddet, aydinlatma, aydinlatmaHref, tercihler }: Props) {
  const [acik, setAcik] = useState(false)

  useEffect(() => {
    // Varsayılan izin GoogleTag'de kayıtlı karardan kurulur; karar yoksa bildirim gösterilir
    // (ilk boyamadan sonra: sayfa statik kalır).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (okuKarar() === null) setAcik(true)
  }, [])

  const sec = useCallback((k: Karar) => {
    yazKarar(k)
    setAcik(false)
    izinVer(k === 'kabul')
    if (k === 'red') gaCerezleriniSil()
  }, [])

  return (
    <>
      <button type="button" className="cerez-tercih" onClick={() => setAcik(true)}>
        {tercihler}
      </button>
      {acik && (
        <div className="cerez" role="dialog" aria-live="polite" aria-label={tercihler}>
          <p>
            {metin}{' '}
            {aydinlatma && <a href={aydinlatmaHref}>{aydinlatma}</a>}
          </p>
          <div className="cerez-btn">
            <button type="button" className="btn" onClick={() => sec('red')}>
              {reddet}
            </button>
            <button type="button" className="btn primary" onClick={() => sec('kabul')}>
              {kabul}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
