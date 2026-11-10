'use client'

import { pushKaydet } from '@/app/(frontend)/[locale]/bulten/push'

import type { BultenKonu } from './form'

/** Tarayıcı Web Push'u destekliyor mu? (iPhone/iPad'de yalnızca ana ekrana eklenmiş sitede.) */
export const pushDestekli = () =>
  'serviceWorker' in navigator && typeof window.PushManager !== 'undefined' && typeof window.Notification !== 'undefined'

/** VAPID açık anahtarı (base64url) → `applicationServerKey`. */
const anahtar = (b64: string) => {
  const s = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

/** Bu tarayıcıdaki mevcut push aboneliği (service worker kayıtlı değilse null). */
export const mevcutAbonelik = (): Promise<PushSubscription | null> =>
  navigator.serviceWorker
    .getRegistration('/')
    .then((reg) => reg?.pushManager.getSubscription() ?? null)
    .catch(() => null)

export type AboneSonuc = { durum: 'ok'; abonelik: PushSubscription } | { durum: 'izin' | 'hata' }

/**
 * İzin ister, service worker'ı (/sw.js) kaydeder, push aboneliği açar ve sunucuya kaydeder. Kullanıcı
 * hareketinin (tıklama) içinde çağrılmalı: izin ilk iş olarak istenir, Safari başka türlü sormaz.
 * Sunucu kaydı başarısızsa tarayıcıdaki abonelik de kaldırılır. Hata fırlatmaz.
 */
export async function pushAboneOl(vapidKey: string, locale: string, konular: BultenKonu[]): Promise<AboneSonuc> {
  try {
    const izin = await Notification.requestPermission()
    if (izin !== 'granted') return { durum: 'izin' }
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
    await navigator.serviceWorker.ready
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: anahtar(vapidKey) }))
    const r = await pushKaydet(sub.toJSON(), locale, konular)
    if (r.status !== 'ok') {
      await sub.unsubscribe().catch(() => false)
      return { durum: 'hata' }
    }
    return { durum: 'ok', abonelik: sub }
  } catch {
    return { durum: 'hata' }
  }
}
