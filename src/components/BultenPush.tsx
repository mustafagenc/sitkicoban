'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

import { pushKaydet, pushSil } from '@/app/(frontend)/[locale]/bulten/push'
import { KONULAR, type BultenKonu } from '@/lib/bulten/form'
import type { Bulten } from '@/payload-types'

import { KONU_ADI } from './BultenForm'

type M = NonNullable<Bulten['metinler']>
type Durum = 'kontrol' | 'kapali' | 'acik' | 'bekle'
type Hata = 'izin' | 'hata' | null

const noop = () => () => {}

/** Tarayıcı Web Push'u destekliyor mu? Sunucuda bilinmez (null). */
const destekVar = () =>
  'serviceWorker' in navigator && typeof window.PushManager !== 'undefined' && typeof window.Notification !== 'undefined'

/** VAPID açık anahtarı (base64url) → `applicationServerKey`. */
const anahtar = (b64: string) => {
  const s = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

/**
 * Tarayıcı bildirimleri: konu seçimi (varsayılan hepsi), "Bildirimleri aç" → izin, service worker (/sw.js),
 * push aboneliği → `pushKaydet`; açıkken "Bildirimleri kapat" → `pushSil` + `unsubscribe()`. Tarayıcı
 * desteklemiyorsa açıklama (iPhone/iPad: ana ekrana ekleyin). Service worker yalnızca düğmeye basılınca kaydedilir.
 */
export function BultenPush({ m, locale, vapidKey }: { m: M; locale: string; vapidKey: string }) {
  const destek = useSyncExternalStore<boolean | null>(noop, destekVar, () => null)
  const [durum, setDurum] = useState<Durum>('kontrol')
  const [hata, setHata] = useState<Hata>(null)
  const [abonelik, setAbonelik] = useState<PushSubscription | null>(null)
  const [konular, setKonular] = useState<BultenKonu[]>([...KONULAR])

  useEffect(() => {
    if (!destek) return
    let iptal = false
    navigator.serviceWorker
      .getRegistration('/')
      .then((reg) => reg?.pushManager.getSubscription() ?? null)
      .catch(() => null)
      .then((sub) => {
        if (iptal) return
        setAbonelik(sub)
        setDurum(sub ? 'acik' : 'kapali')
        if (!sub && Notification.permission === 'denied') setHata('izin')
      })
    return () => {
      iptal = true
    }
  }, [destek])

  const ac = async () => {
    if (konular.length === 0) return
    setHata(null)
    setDurum('bekle')
    try {
      // İzin, kullanıcı hareketinin içinde ilk iş olarak istenir (Safari başka türlü sormaz).
      const izin = await Notification.requestPermission()
      if (izin !== 'granted') {
        setHata('izin')
        setDurum('kapali')
        return
      }
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
      await navigator.serviceWorker.ready
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: anahtar(vapidKey) }))
      const r = await pushKaydet(sub.toJSON(), locale, konular)
      if (r.status !== 'ok') {
        // Sunucuda kaydı olmayan bir abonelik tarayıcıda açık görünmesin.
        await sub.unsubscribe().catch(() => false)
        setHata('hata')
        setDurum('kapali')
        return
      }
      setAbonelik(sub)
      setDurum('acik')
    } catch {
      setHata('hata')
      setDurum('kapali')
    }
  }

  const kapat = async () => {
    if (!abonelik) return
    setHata(null)
    setDurum('bekle')
    try {
      // Sunucudaki kayıt silinemese de tarayıcıdaki abonelik kalkar: bildirim gelmez, eski kayıt ilk
      // gönderimde (410) temizlenir.
      await pushSil(abonelik.endpoint).catch(() => null)
      await abonelik.unsubscribe()
      setAbonelik(null)
      setDurum('kapali')
    } catch {
      setHata('hata')
      setDurum('acik')
    }
  }

  const toggle = (k: BultenKonu, on: boolean) =>
    setKonular((v) => (on ? KONULAR.filter((x) => x === k || v.includes(x)) : v.filter((x) => x !== k)))

  const bekle = durum === 'bekle'
  const acik = durum === 'acik' || (bekle && abonelik !== null)

  return (
    <section className="card push" aria-labelledby="push-baslik">
      <h2 id="push-baslik">{m.pushBaslik}</h2>
      {m.pushAciklama && <p>{m.pushAciklama}</p>}
      {destek === false && (
        <>
          <p className="durum">{m.pushDesteklenmiyor}</p>
          <p className="not">{m.pushIphone}</p>
        </>
      )}
      {destek && durum !== 'kontrol' && acik && (
        <>
          <p className="durum" role="status">
            {m.pushAcik}
          </p>
          <button className="send" type="button" onClick={kapat} disabled={bekle}>
            {bekle ? m.pushBekle || m.pushKapat : m.pushKapat}
          </button>
        </>
      )}
      {destek && durum !== 'kontrol' && !acik && (
        <>
          <fieldset className="konular" aria-describedby={konular.length === 0 ? 'push-msg-konu' : undefined}>
            <legend>{m.formKonular}</legend>
            <div className="secenekler">
              {KONULAR.map((k) => (
                <label key={k} className="secenek">
                  <input
                    type="checkbox"
                    value={k}
                    checked={konular.includes(k)}
                    disabled={bekle}
                    onChange={(e) => toggle(k, e.target.checked)}
                  />
                  <span>{m[KONU_ADI[k]]}</span>
                </label>
              ))}
            </div>
            {konular.length === 0 && (
              <div className="msg" id="push-msg-konu" role="alert">
                {m.formKonuHata}
              </div>
            )}
          </fieldset>
          <button className="send" type="button" onClick={ac} disabled={bekle || konular.length === 0}>
            {bekle ? m.pushBekle || m.pushAc : m.pushAc}
          </button>
        </>
      )}
      {hata && (
        <p className="status" role="alert">
          {hata === 'izin' ? m.pushIzinYok : m.pushHata}
        </p>
      )}
    </section>
  )
}
