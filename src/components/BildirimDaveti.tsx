'use client'

import { useEffect, useState } from 'react'

import { KONULAR } from '@/lib/bulten/form'
import { mevcutAbonelik, pushAboneOl, pushDestekli } from '@/lib/bulten/pushIstemci'

/** "Daha sonra" ya da sonuçlanmış davetin zamanı; yalnızca bu tarayıcıda tutulur. */
const ANAHTAR = 'bildirim-daveti'
const TEKRAR_GUN = 30
/** Ziyaretçi sayfayı biraz okuduktan sonra sorulur; tarayıcıların "hemen izin isteyen site" cezasından kaçınır. */
const GECIKME_MS = 15_000

type Props = {
  locale: string
  vapidKey: string
  /** Bülten sayfalarının yolu: orada zaten bildirim bölümü var, davet çıkmaz. */
  bultenYolu: string
  metin: string
  evet: string
  sonra: string
  bekle: string
  acik: string
  hata: string
}

function sonDavet(): number | null {
  try {
    const v = Number(localStorage.getItem(ANAHTAR))
    return Number.isFinite(v) && v > 0 ? v : null
  } catch {
    return null
  }
}

function davetiKaydet() {
  try {
    localStorage.setItem(ANAHTAR, String(Date.now()))
  } catch {}
}

/**
 * Siteye girişte bildirim daveti: sayfada 15 sn kaldıktan sonra (çerez bildirimi açıksa o kapanınca) küçük bir
 * kart "bildirim almak ister misiniz?" diye sorar. "Evet" tüm konularla tarayıcı iznini ister ve aboneliği
 * kaydeder; "Daha sonra" 30 gün boyunca yeniden sormaz. Tarayıcı desteklemiyorsa, izin zaten verilmiş ya da
 * reddedilmişse, abonelik varsa ya da bülten sayfasındaysa hiç çıkmaz. Tarayıcının kendi izin penceresi
 * yalnızca "Evet"e basınca açılır.
 */
export function BildirimDaveti({ locale, vapidKey, bultenYolu, metin, evet, sonra, bekle, acik, hata }: Props) {
  const [goster, setGoster] = useState(false)
  const [durum, setDurum] = useState<'soru' | 'bekle' | 'acik' | 'hata'>('soru')

  useEffect(() => {
    if (!pushDestekli() || Notification.permission !== 'default') return
    if (location.pathname === bultenYolu || location.pathname.startsWith(`${bultenYolu}/`)) return
    const son = sonDavet()
    if (son && Date.now() - son < TEKRAR_GUN * 86_400_000) return

    let iptal = false
    let zaman: ReturnType<typeof setTimeout>
    const dene = () => {
      // Çerez bildirimi ekrandayken ikinci bir kart açılmaz; kapanmasını bekler.
      if (document.querySelector('.cerez')) {
        zaman = setTimeout(dene, 5_000)
        return
      }
      mevcutAbonelik().then((sub) => {
        if (!iptal && !sub) setGoster(true)
      })
    }
    zaman = setTimeout(dene, GECIKME_MS)
    return () => {
      iptal = true
      clearTimeout(zaman)
    }
  }, [bultenYolu])

  if (!goster) return null

  const kapat = () => {
    davetiKaydet()
    setGoster(false)
  }

  const ac = async () => {
    setDurum('bekle')
    const r = await pushAboneOl(vapidKey, locale, [...KONULAR])
    davetiKaydet()
    if (r.durum === 'izin') {
      // Ziyaretçi tarayıcı penceresinde reddetti: tekrar sorulmaz.
      setGoster(false)
      return
    }
    setDurum(r.durum === 'ok' ? 'acik' : 'hata')
    setTimeout(() => setGoster(false), 4_000)
  }

  return (
    <div className="bildirim-davet" role="dialog" aria-live="polite" aria-label={metin}>
      {durum === 'acik' || durum === 'hata' ? (
        <p role="status">{durum === 'acik' ? acik : hata}</p>
      ) : (
        <>
          <p>{metin}</p>
          <div className="cerez-btn">
            <button type="button" className="btn" onClick={kapat} disabled={durum === 'bekle'}>
              {sonra}
            </button>
            <button type="button" className="btn primary" onClick={ac} disabled={durum === 'bekle'}>
              {durum === 'bekle' ? bekle || evet : evet}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
