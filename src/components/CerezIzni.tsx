'use client'

import { useCallback, useEffect, useState } from 'react'

/** Ziyaretçinin kararı; yalnızca bu tarayıcıda tutulur. */
const ANAHTAR = 'cerez'
type Karar = 'kabul' | 'red'

type Props = {
  gaId: string
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

/** Google Analytics yalnızca izin verildikten sonra, bir kez yüklenir. */
function gaYukle(id: string) {
  if (window.gtag) return
  window.dataLayer = window.dataLayer || []
  // gtag, `arguments` nesnesinin kendisini bekler (dizi değil).
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { anonymize_ip: true })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(s)
}

/** İzin geri alınınca GA çerezleri silinir; yüklenmiş betik ancak sayfa yenilenince gider. */
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
 * Çerez bildirimi ve izinli Google Analytics. Karar verilene kadar hiçbir analiz isteği gitmez;
 * alt bilgideki "Çerez tercihleri" bağlantısı bildirimi yeniden açar.
 */
export function CerezIzni({ gaId, metin, kabul, reddet, aydinlatma, aydinlatmaHref, tercihler }: Props) {
  const [acik, setAcik] = useState(false)

  useEffect(() => {
    const k = okuKarar()
    if (k === 'kabul') gaYukle(gaId)
    // Karar verilmemişse bildirim gösterilir (ilk boyamadan sonra: sayfa statik kalır).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (k === null) setAcik(true)
  }, [gaId])

  const sec = useCallback(
    (k: Karar) => {
      const onceki = okuKarar()
      yazKarar(k)
      setAcik(false)
      if (k === 'kabul') gaYukle(gaId)
      else if (onceki === 'kabul') {
        gaCerezleriniSil()
        location.reload()
      }
    },
    [gaId],
  )

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
