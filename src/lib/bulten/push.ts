/** Web Push aboneliğinin doğrulaması: sunucu eylemleri ve testler kullanır. Gönderim (web-push) burada yok. */

import { isLocale, type Locale } from '@/i18n/config'

import { KONULAR, isKonu, type BultenKonu } from './form'

/** Push için üç VAPID değişkeni de gerekir; biri eksikse bildirim bölümü gizlenir, eylemler "unavailable" döner. */
export const pushHazir = () =>
  !!process.env.VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY && !!process.env.VAPID_SUBJECT

export const ENDPOINT_MAX = 1000

/**
 * Tarayıcıların push servisleri: Chrome/Edge(Chromium)/Opera/Samsung → FCM, Firefox → Mozilla autopush,
 * eski Edge → WNS, Safari (macOS ve ana ekrana eklenmiş iOS) → Apple. Başka bir adres kabul edilmez:
 * gönderim sırasında sunucunun rastgele adreslere istek atması (SSRF) böylece önlenir.
 */
const TAM_HOSTLAR = ['fcm.googleapis.com', 'android.googleapis.com', 'web.push.apple.com']
const HOST_SONEKLERI = ['.push.services.mozilla.com', '.notify.windows.com', '.push.apple.com']

/** Endpoint bilinen bir push servisine ait, varsayılan bağlantı noktalı, kimlik bilgisi içermeyen bir https adresi mi? */
export function pushHostuGecerli(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== 'string' || endpoint.length > ENDPOINT_MAX) return false
  let u: URL
  try {
    u = new URL(endpoint)
  } catch {
    return false
  }
  if (u.protocol !== 'https:' || u.port !== '' || u.username !== '' || u.password !== '') return false
  const h = u.hostname.toLowerCase()
  return TAM_HOSTLAR.includes(h) || HOST_SONEKLERI.some((s) => h.endsWith(s))
}

const B64URL_RE = /^[A-Za-z0-9_-]+={0,2}$/

/** base64url (dolgulu ya da dolgusuz) dizgeyi çözer; geçersizse null. */
const coz = (s: unknown, maxLen: number): Buffer | null =>
  typeof s === 'string' && s.length <= maxLen && B64URL_RE.test(s) ? Buffer.from(s, 'base64url') : null

export type PushAboneligi = { endpoint: string; p256dh: string; auth: string; dil: Locale; konular: BultenKonu[] }

/**
 * Tarayıcıdan gelen `PushSubscription.toJSON()` + dil + konular. p256dh sıkıştırılmamış bir P-256 noktası
 * (65 bayt, 0x04 ile başlar), auth 16 bayttır. Konular KONULAR sırasıyla, tekrarsız döner. Geçersizse null.
 */
export function validatePush(sub: unknown, dil: unknown, konular: unknown): PushAboneligi | null {
  if (!sub || typeof sub !== 'object') return null
  const { endpoint, keys } = sub as { endpoint?: unknown; keys?: unknown }
  if (!pushHostuGecerli(endpoint) || !keys || typeof keys !== 'object') return null
  const { p256dh, auth } = keys as { p256dh?: unknown; auth?: unknown }
  const p = coz(p256dh, 100)
  const a = coz(auth, 30)
  if (!p || p.length !== 65 || p[0] !== 4 || !a || a.length !== 16) return null
  if (typeof dil !== 'string' || !isLocale(dil)) return null
  if (!Array.isArray(konular) || konular.length === 0 || konular.length > 20 || !konular.every(isKonu)) return null
  return {
    endpoint,
    p256dh: p256dh as string,
    auth: auth as string,
    dil,
    konular: KONULAR.filter((k) => konular.includes(k)),
  }
}

/** Bildirim bölümünün metinleri girilmiş mi (üretimde migration sonrası boş olabilir). Değilse bölüm çizilmez. */
export const pushMetinleriVar = (m: { pushBaslik?: string | null; pushAc?: string | null } | null | undefined) =>
  !!m?.pushBaslik && !!m?.pushAc
