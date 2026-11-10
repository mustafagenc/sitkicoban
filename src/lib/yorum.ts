/** Yazı yorum formunun doğrulaması: sunucu eylemi ve testler kullanır; tarayıcıda da aynı sınırlar. */

import { isLocale, type Locale } from '@/i18n/config'
import { EPOSTA_RE, LIMITS, MIN_FILL_MS } from '@/lib/contact'

/** Alan sınırları; `onDakikada`: aynı e-posta ya da aynı IP'den 10 dakikada en fazla bu kadar yorum. */
export const YORUM_LIMITLERI = { ad: 80, eposta: LIMITS.eposta, metin: 2000, onDakikada: 3 } as const

/** Yorum metinleri girilmiş mi (üretimde migration sonrası global boştur). Girilmemişse bölüm çizilmez. */
export const yorumMetinleriVar = (m: { baslik?: string | null; formGonder?: string | null } | null | undefined) =>
  !!m?.baslik && !!m?.formGonder

export type YorumData = { yazi: string; dil: Locale; ad: string; eposta: string; metin: string }

export type YorumResult = { ok: true; data: YorumData } | { ok: false; reason: 'spam' | 'invalid' }

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v : '')

/**
 * İletişim formundaki kurallar: bal küpü (`website`) dolu ya da `t` 3 saniyeden yeniyse spam; `t` yoksa
 * (JS yüklenmeden gönderim) ve diğer her kusur "invalid". `yazi` yazının adresidir (slug).
 */
export function validateYorum(input: FormData, now: number): YorumResult {
  if (str(input.get('website')) !== '') return { ok: false, reason: 'spam' }
  const t = Number(str(input.get('t')))
  if (!Number.isFinite(t) || t <= 0) return { ok: false, reason: 'invalid' }
  if (now - t < MIN_FILL_MS) return { ok: false, reason: 'spam' }

  const yazi = str(input.get('yazi')).trim()
  const dil = str(input.get('locale'))
  const ad = str(input.get('ad')).trim()
  const eposta = str(input.get('eposta')).trim().toLowerCase()
  const metin = str(input.get('metin')).replace(/\r\n?/g, '\n').trim()

  const ok =
    /^[a-z0-9-]{1,200}$/.test(yazi) &&
    isLocale(dil) &&
    ad.length >= 1 &&
    ad.length <= YORUM_LIMITLERI.ad &&
    eposta.length <= YORUM_LIMITLERI.eposta &&
    EPOSTA_RE.test(eposta) &&
    metin.length >= 1 &&
    metin.length <= YORUM_LIMITLERI.metin &&
    str(input.get('onay')) === 'on'
  if (!ok || !isLocale(dil)) return { ok: false, reason: 'invalid' }

  return { ok: true, data: { yazi, dil, ad, eposta, metin } }
}
