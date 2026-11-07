/** İletişim formunun doğrulaması: sunucu eylemi ve testler kullanır; tarayıcıda da aynı sınırlar. */

export const LIMITS = { ad: 100, eposta: 200, konu: 100, telefon: 50, mesaj: 2000 } as const

/** Sayfa çizildikten bu süre geçmeden gelen gönderim otomatik (spam) sayılır. */
export const MIN_FILL_MS = 3000

export const EPOSTA_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ContactData = { ad: string; eposta: string; konu: string; telefon?: string; mesaj: string }

export type ContactResult = { ok: true; data: ContactData } | { ok: false; reason: 'spam' | 'invalid' }

function field(input: FormData | Record<string, string>, name: string): string {
  const v = input instanceof FormData ? input.get(name) : input[name]
  return typeof v === 'string' ? v : ''
}

/**
 * `now`: şimdiki zaman (ms). Bal küpü alanı (`website`) doluysa, `t` (formun çizildiği an)
 * yoksa ya da 3 saniyeden yeniyse spam; diğer her kusur "invalid".
 */
export function validateContact(input: FormData | Record<string, string>, now: number): ContactResult {
  if (field(input, 'website') !== '') return { ok: false, reason: 'spam' }
  const t = Number(field(input, 't'))
  if (!Number.isFinite(t) || t <= 0 || now - t < MIN_FILL_MS) return { ok: false, reason: 'spam' }

  const ad = field(input, 'ad').trim()
  const eposta = field(input, 'eposta').trim()
  const konu = field(input, 'konu').trim()
  const telefon = field(input, 'telefon').trim()
  const mesaj = field(input, 'mesaj').trim()

  const ok =
    ad.length >= 1 &&
    ad.length <= LIMITS.ad &&
    eposta.length <= LIMITS.eposta &&
    EPOSTA_RE.test(eposta) &&
    konu.length >= 1 &&
    konu.length <= LIMITS.konu &&
    telefon.length <= LIMITS.telefon &&
    mesaj.length >= 1 &&
    mesaj.length <= LIMITS.mesaj &&
    field(input, 'onay') === 'on'
  if (!ok) return { ok: false, reason: 'invalid' }

  return { ok: true, data: { ad, eposta, konu, telefon: telefon || undefined, mesaj } }
}
