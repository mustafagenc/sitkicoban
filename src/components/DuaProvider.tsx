'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const SRC = '/ses/giris-dua.mp3'
const GECIKME_MS = 1500
/** Kullanıcı duayı bir kez durdurursa otomatik başlatma bir daha denenmez. */
const KAPALI_ANAHTAR = 'dua-kapali'
/** Aynı oturumda ana sayfaya her dönüşte yeniden başlamasın. */
const CALINDI_ANAHTAR = 'dua-calindi'

function oku(depo: () => Storage, anahtar: string) {
  try {
    return depo().getItem(anahtar)
  } catch {
    return null
  }
}

function yaz(depo: () => Storage, anahtar: string, deger: string) {
  try {
    depo().setItem(anahtar, deger)
  } catch {}
}

type Dua = {
  playing: boolean
  /** Tarayıcı otomatik oynatmayı engelledi; ilk dokunuş bekleniyor. */
  waiting: boolean
  /** 0–100 */
  progress: number
  toggle: () => void
  /** Oturumda bir kez, kısa bir gecikmeyle çalmayı dener (ana sayfa). */
  otomatikBaslat: () => () => void
  /** Düğmenin kendisi; ilk dokunuş beklenirken ona basılırsa çalma onClick'e bırakılır. */
  dugme: React.RefObject<HTMLButtonElement | null>
}

const DuaContext = createContext<Dua | null>(null)

/**
 * Giriş duasının (Elmalılı Hamdi Yazır tefsirinin başındaki dua, Sıtkı Çoban'ın sesinden) çalıcısı.
 * Düzende (layout) bir kez kurulur: sayfalar arasında `next/link` ile geçerken ses kesilmez.
 * Düğme (DuaPlayer) her sayfanın üst bilgisinde yeniden çizilir ama bu çalıcıyı kullanır.
 */
export function DuaProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null)
  const dugme = useRef<HTMLButtonElement>(null)
  const [playing, setPlaying] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [progress, setProgress] = useState(0)

  const toggle = useCallback(() => {
    const a = audio.current
    if (!a) return
    setWaiting(false)
    if (a.paused) {
      a.play().catch(() => {})
    } else {
      a.pause()
      yaz(() => localStorage, KAPALI_ANAHTAR, '1')
    }
  }, [])

  // İlk dokunuş dinleyicisi sayfa değişse de (düğme yeniden çizilse de) yaşamalı; bu yüzden burada tutulur.
  const dinleyici = useRef<((e: Event) => void) | null>(null)
  const dinlemeyiBirak = useCallback(() => {
    if (!dinleyici.current) return
    document.removeEventListener('pointerdown', dinleyici.current, true)
    document.removeEventListener('keydown', dinleyici.current, true)
    dinleyici.current = null
  }, [])
  useEffect(() => dinlemeyiBirak, [dinlemeyiBirak])

  const otomatikBaslat = useCallback(() => {
    const a = audio.current
    if (!a) return () => {}
    if (oku(() => localStorage, KAPALI_ANAHTAR) || oku(() => sessionStorage, CALINDI_ANAHTAR)) return () => {}
    const t = window.setTimeout(() => {
      // "Çalındı" işareti onPlay'de konur: engellenen deneme, yenilemede yeniden denensin.
      a.play().catch(() => {
        setWaiting(true)
        const ilkDokunus = (e: Event) => {
          dinlemeyiBirak()
          setWaiting(false)
          // Düğmenin kendisine basıldıysa onClick zaten çalar.
          if (dugme.current?.contains(e.target as Node)) return
          a.play().catch(() => {})
        }
        dinleyici.current = ilkDokunus
        document.addEventListener('pointerdown', ilkDokunus, true)
        document.addEventListener('keydown', ilkDokunus, true)
      })
    }, GECIKME_MS)
    // Gecikme dolmadan sayfadan çıkılırsa denenmez (bir sonraki ana sayfa ziyaretine kalır).
    return () => window.clearTimeout(t)
  }, [dinlemeyiBirak])

  const value = useMemo(
    () => ({ playing, waiting, progress, toggle, otomatikBaslat, dugme }),
    [playing, waiting, progress, toggle, otomatikBaslat],
  )

  return (
    <DuaContext.Provider value={value}>
      {children}
      <audio
        ref={audio}
        src={SRC}
        preload="none"
        onPlay={() => {
          setPlaying(true)
          yaz(() => sessionStorage, CALINDI_ANAHTAR, '1')
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setProgress(0)
        }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget
          setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0)
        }}
      />
    </DuaContext.Provider>
  )
}

export function useDua() {
  return useContext(DuaContext)
}
