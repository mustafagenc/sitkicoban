/**
 * Bülten için Resend erişimi ve onay belirteci. Aboneler Resend Contacts'ta tutulur (veritabanımızda
 * kişisel veri yok): dil = Segment (`sitkicoban-tr|en|ar`), konular = Topic (`yazilar|kitaplar|eserler|videolar`,
 * varsayılan `opt_out`: abone yalnızca seçtiği konuları alır). Onaysız abone `unsubscribed: true` durur.
 * Segment, konu ve kişi özelliği adla bulunur, yoksa oluşturulur; id'ler süreç boyunca önbellekte kalır.
 * Yalnızca sunucuda kullanılır.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

import { Resend } from 'resend'

import { isLocale, type Locale } from '@/i18n/config'

import { KONULAR, epostaGecerli, isKonu, type BultenKonu } from './form'

/** Onay isteğinin son gönderildiği an (Unix saniye); aynı adrese 10 dk içinde yeni onay gitmez. */
export const ONAY_OZELLIGI = 'bulten_onay'
export const ONAY_ARALIGI_SN = 10 * 60
export const BELIRTEC_OMRU_MS = 7 * 24 * 60 * 60 * 1000

export const segmentAdi = (l: Locale) => `sitkicoban-${l}`

/** Resend anahtarı, gönderen adresi ve belirteç anahtarı varsa bülten açıktır. */
export const bultenHazir = (): boolean =>
  !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM && !!process.env.PAYLOAD_SECRET

let istemci: { key: string; resend: Resend } | null = null

export function resendIstemcisi(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY ayarlı değil')
  if (istemci?.key !== key) istemci = { key, resend: new Resend(key) }
  return istemci.resend
}

type Hata = { message: string; name?: string } | null
type Yanit<T> = { data: T | null; error: Hata }

/** Resend yanıtındaki veriyi döner; hata varsa fırlatır (çağıran eylem yakalar). */
function veri<T>(res: Yanit<T>, ne: string): T {
  if (res.error || res.data === null) throw new Error(`Resend ${ne}: ${res.error?.message ?? 'boş yanıt'}`)
  return res.data
}

// Başarısız arama önbellekte kalmaz: bir sonraki istek yeniden dener.
const onbellek = new Map<string, Promise<unknown>>()
function bellekte<T>(anahtar: string, fn: () => Promise<T>): Promise<T> {
  let p = onbellek.get(anahtar) as Promise<T> | undefined
  if (!p) {
    p = fn()
    onbellek.set(anahtar, p)
    p.catch(() => onbellek.delete(anahtar))
  }
  return p
}

/** Testler için: önbelleğe alınmış id'leri ve istemciyi siler. */
export function _onbellegiSifirla(): void {
  onbellek.clear()
  istemci = null
}

async function tumSegmentler(resend: Resend) {
  const hepsi: { id: string; name: string }[] = []
  let after: string | undefined
  for (let i = 0; i < 20; i++) {
    const sayfa = veri(await resend.segments.list(after ? { limit: 100, after } : { limit: 100 }), 'segments.list')
    hepsi.push(...sayfa.data)
    if (!sayfa.has_more || sayfa.data.length === 0) break
    after = sayfa.data[sayfa.data.length - 1].id
  }
  return hepsi
}

/** Dilin segmenti (yoksa oluşturulur). */
export function segmentId(locale: Locale): Promise<string> {
  return bellekte(`segment:${locale}`, async () => {
    const resend = resendIstemcisi()
    const ad = segmentAdi(locale)
    const var_ = (await tumSegmentler(resend)).find((s) => s.name === ad)
    if (var_) return var_.id
    return veri(await resend.segments.create({ name: ad }), 'segments.create').id
  })
}

/** Dört konunun id'leri (eksik olan `opt_out` varsayılanıyla oluşturulur). */
export function topicIds(): Promise<Record<BultenKonu, string>> {
  return bellekte('topics', async () => {
    const resend = resendIstemcisi()
    const liste = veri(await resend.topics.list(), 'topics.list').data
    const sonuc = {} as Record<BultenKonu, string>
    for (const k of KONULAR) {
      const var_ = liste.find((t) => t.name === k)
      sonuc[k] = var_
        ? var_.id
        : veri(
            await resend.topics.create({
              name: k,
              description: `sitkicoban.com: yeni ${k}`,
              defaultSubscription: 'opt_out',
            }),
            'topics.create',
          ).id
    }
    return sonuc
  })
}

/** Onay zamanını tutan kişi özelliği (yoksa oluşturulur); kişiye yazılmadan önce tanımlı olmalı. */
export function onayOzelligiHazir(): Promise<void> {
  return bellekte('ozellik', async () => {
    const resend = resendIstemcisi()
    const liste = veri(await resend.contactProperties.list({ limit: 100 }), 'contactProperties.list').data
    if (liste.some((p) => p.key === ONAY_OZELLIGI)) return
    veri(
      await resend.contactProperties.create({ key: ONAY_OZELLIGI, type: 'number', fallbackValue: null }),
      'contactProperties.create',
    )
  })
}

// --- Onay belirteci -------------------------------------------------------------------------------

export type Belirtec = { e: string; l: Locale; k: BultenKonu[] }

const anahtar = () => createHash('sha256').update(`bulten:${process.env.PAYLOAD_SECRET ?? ''}`).digest()
const imza = (govde: string) => createHmac('sha256', anahtar()).update(govde).digest()

/** `base64url(JSON {e,l,k,exp}).base64url(HMAC-SHA256)`; 7 gün geçerli. */
export function onayBelirteci(email: string, locale: Locale, konular: BultenKonu[], now = Date.now()): string {
  const govde = Buffer.from(JSON.stringify({ e: email, l: locale, k: konular, exp: now + BELIRTEC_OMRU_MS })).toString(
    'base64url',
  )
  return `${govde}.${imza(govde).toString('base64url')}`
}

/** Geçerli, oynanmamış ve süresi dolmamış belirtecin içeriği; değilse null. Hiçbir zaman fırlatmaz. */
export function belirteciCoz(t: unknown, now = Date.now()): Belirtec | null {
  try {
    if (typeof t !== 'string' || t.length > 2000) return null
    const parcalar = t.split('.')
    if (parcalar.length !== 2) return null
    const [govde, s] = parcalar
    if (!govde || !s || !process.env.PAYLOAD_SECRET) return null
    const beklenen = imza(govde)
    const gelen = Buffer.from(s, 'base64url')
    if (gelen.length !== beklenen.length || !timingSafeEqual(gelen, beklenen)) return null
    const v: unknown = JSON.parse(Buffer.from(govde, 'base64url').toString('utf8'))
    if (!v || typeof v !== 'object') return null
    const { e, l, k, exp } = v as Record<string, unknown>
    if (typeof exp !== 'number' || exp < now) return null
    if (typeof e !== 'string' || !epostaGecerli(e)) return null
    if (typeof l !== 'string' || !isLocale(l)) return null
    if (!Array.isArray(k) || k.length === 0 || !k.every(isKonu)) return null
    return { e, l, k }
  } catch {
    return null
  }
}
