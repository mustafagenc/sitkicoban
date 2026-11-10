/** Bülten abonelik formunun doğrulaması: sunucu eylemi ve testler kullanır; tarayıcıda da aynı sınırlar. */

import { EPOSTA_RE, LIMITS, MIN_FILL_MS } from '@/lib/contact'
import { isLocale, type Locale } from '@/i18n/config'

/** Bildirim konuları; Resend'de aynı adlı Topic'ler (yoksa oluşturulur). */
export const KONULAR = ['yazilar', 'kitaplar', 'eserler', 'videolar'] as const
export type BultenKonu = (typeof KONULAR)[number]

export const isKonu = (s: unknown): s is BultenKonu => (KONULAR as readonly unknown[]).includes(s)

export const epostaGecerli = (s: string) => s.length <= LIMITS.eposta && EPOSTA_RE.test(s)

export type BultenData = { eposta: string; locale: Locale; konular: BultenKonu[] }

export type BultenResult = { ok: true; data: BultenData } | { ok: false; reason: 'spam' | 'invalid' }

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v : '')

/**
 * İletişim formundaki kurallar: bal küpü (`website`) dolu ya da `t` 3 saniyeden yeniyse spam; `t` yoksa
 * (JS yüklenmeden gönderim) ve diğer her kusur "invalid". Konular KONULAR sırasıyla, tekrarsız döner.
 */
export function validateBulten(input: FormData, now: number): BultenResult {
  if (str(input.get('website')) !== '') return { ok: false, reason: 'spam' }
  const t = Number(str(input.get('t')))
  if (!Number.isFinite(t) || t <= 0) return { ok: false, reason: 'invalid' }
  if (now - t < MIN_FILL_MS) return { ok: false, reason: 'spam' }

  const eposta = str(input.get('eposta')).trim().toLowerCase()
  const locale = str(input.get('locale'))
  const secilen = input.getAll('konu').map(str)
  const ok =
    epostaGecerli(eposta) &&
    isLocale(locale) &&
    secilen.length > 0 &&
    secilen.every(isKonu) &&
    str(input.get('onay')) === 'on'
  if (!ok) return { ok: false, reason: 'invalid' }

  return { ok: true, data: { eposta, locale, konular: KONULAR.filter((k) => secilen.includes(k)) } }
}
