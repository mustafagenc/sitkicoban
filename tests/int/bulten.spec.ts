// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const r = vi.hoisted(() => {
  const ok = <T>(data: T) => ({ data, error: null, headers: null })
  return {
    ok,
    send: vi.fn(),
    contactsGet: vi.fn(),
    contactsCreate: vi.fn(),
    contactsUpdate: vi.fn(),
    contactTopicsUpdate: vi.fn(),
    contactSegmentsAdd: vi.fn(),
    contactSegmentsRemove: vi.fn(),
    segmentsList: vi.fn(),
    segmentsCreate: vi.fn(),
    topicsList: vi.fn(),
    topicsCreate: vi.fn(),
    propsList: vi.fn(),
    propsCreate: vi.fn(),
  }
})

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: r.send }
    contacts = {
      get: r.contactsGet,
      create: r.contactsCreate,
      update: r.contactsUpdate,
      topics: { update: r.contactTopicsUpdate },
      segments: { add: r.contactSegmentsAdd, remove: r.contactSegmentsRemove },
    }
    segments = { list: r.segmentsList, create: r.segmentsCreate }
    topics = { list: r.topicsList, create: r.topicsCreate }
    contactProperties = { list: r.propsList, create: r.propsCreate }
  },
}))
vi.mock('@/lib/data', () => ({
  getBulten: vi.fn(async () => ({
    metinler: {
      formGonder: 'Abone ol',
      onayEpostaKonu: 'Bülten aboneliğinizi onaylayın',
      onayEpostaMetin: 'Aboneliği başlatmak için bağlantıya tıklayın.',
      onayEpostaDugme: 'Aboneliği onayla',
      onayEpostaNot: 'Bu isteği siz yapmadıysanız bu e-postayı silebilirsiniz.',
    },
  })),
}))

import { bulteneKatil, bultenOnayla } from '@/app/(frontend)/[locale]/bulten/actions'
import { _onbellegiSifirla, belirteciCoz, onayBelirteci } from '@/lib/bulten/resend'
import { bultenMetinleriVar, validateBulten } from '@/lib/bulten/form'
import { getBulten } from '@/lib/data'

const NOW = 1_800_000_000_000
const DAY = 24 * 60 * 60 * 1000

const SEGMENTLER = [
  { id: 'seg-tr', name: 'sitkicoban-tr', created_at: '' },
  { id: 'seg-en', name: 'sitkicoban-en', created_at: '' },
  { id: 'seg-ar', name: 'sitkicoban-ar', created_at: '' },
]
const KONULAR = ['yazilar', 'kitaplar', 'eserler', 'videolar'].map((name) => ({
  id: `top-${name}`,
  name,
  default_subscription: 'opt_out',
  created_at: '',
}))
const notFound = { data: null, error: { name: 'not_found', message: 'Contact not found', statusCode: 404 }, headers: null }

const form = (o: Record<string, string | string[]> = {}) => {
  const v: Record<string, string | string[]> = {
    eposta: 'okur@example.com',
    konu: ['yazilar', 'kitaplar'],
    onay: 'on',
    website: '',
    t: String(Date.now() - 10_000),
    locale: 'tr',
    ...o,
  }
  const f = new FormData()
  for (const [k, val] of Object.entries(v)) for (const x of Array.isArray(val) ? val : [val]) f.append(k, x)
  return f
}

const ENV = { ...process.env }

beforeEach(() => {
  process.env.RESEND_API_KEY = 're_test'
  process.env.RESEND_FROM = 'Sıtkı Çoban <bulten@example.com>'
  process.env.PAYLOAD_SECRET = 'test-secret'
  process.env.SITE_URL = 'https://ornek.test'
  _onbellegiSifirla()
  for (const f of Object.values(r)) if (typeof f === 'function' && 'mockReset' in f) f.mockReset()
  r.send.mockResolvedValue(r.ok({ id: 'mail-1' }))
  r.contactsGet.mockResolvedValue(notFound)
  r.contactsCreate.mockResolvedValue(r.ok({ id: 'c-1', object: 'contact' }))
  r.contactsUpdate.mockResolvedValue(r.ok({ id: 'c-1', object: 'contact' }))
  r.contactTopicsUpdate.mockResolvedValue(r.ok({ id: 'c-1' }))
  r.contactSegmentsAdd.mockResolvedValue(r.ok({ id: 'seg-tr' }))
  r.contactSegmentsRemove.mockResolvedValue(r.ok({ id: 'seg-en', deleted: true }))
  r.segmentsList.mockResolvedValue(r.ok({ object: 'list', data: SEGMENTLER, has_more: false }))
  r.topicsList.mockResolvedValue(r.ok({ data: KONULAR }))
  r.propsList.mockResolvedValue(
    r.ok({ object: 'list', has_more: false, data: [{ id: 'p-1', key: 'bulten_onay', type: 'number' }] }),
  )
})

afterEach(() => {
  process.env = { ...ENV }
})

const HATA = (name = 'internal_server_error') => ({ data: null, error: { name, message: 'x', statusCode: 500 }, headers: null })

/** Resend'deki bir kişinin taklidi (`contacts.get` yanıtı). */
const kisi = (o: { unsubscribed?: boolean; onay?: number | null } = {}) =>
  r.ok({
    id: 'c-1',
    email: 'okur@example.com',
    unsubscribed: o.unsubscribed ?? true,
    created_at: '',
    properties: o.onay == null ? {} : { bulten_onay: { type: 'number', value: o.onay } },
  })

/** Gönderilen son onay e-postasındaki bağlantı ve belirteç. */
const sonBaglanti = () => {
  const mail = r.send.mock.calls.at(-1)![0]
  const m = /https:\/\/ornek\.test(\/[a-z/]*)#t=([A-Za-z0-9_.-]+)/.exec(mail.html)!
  return { mail, yol: m[1], t: m[2], tam: m[0] }
}

describe('onay belirteci', () => {
  it('round-trips e-mail, locale, topics and the request stamp', () => {
    const t = onayBelirteci('okur@example.com', 'en', ['yazilar', 'eserler'], 123, NOW)
    expect(t).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    expect(belirteciCoz(t, NOW + DAY)).toEqual({ e: 'okur@example.com', l: 'en', k: ['yazilar', 'eserler'], n: 123 })
  })

  it('expires after 7 days', () => {
    const t = onayBelirteci('okur@example.com', 'tr', ['yazilar'], 1, NOW)
    expect(belirteciCoz(t, NOW + 7 * DAY - 1000)).not.toBeNull()
    expect(belirteciCoz(t, NOW + 7 * DAY + 1000)).toBeNull()
  })

  it('rejects a tampered payload or signature, garbage, and another secret', () => {
    const t = onayBelirteci('okur@example.com', 'tr', ['yazilar'], 1, NOW)
    const [p, s] = t.split('.')
    const sahte = Buffer.from(
      JSON.stringify({ e: 'baska@example.com', l: 'tr', k: ['yazilar'], n: 1, exp: NOW + DAY }),
    ).toString('base64url')
    expect(belirteciCoz(`${sahte}.${s}`, NOW)).toBeNull()
    expect(belirteciCoz(`${p}.${s.slice(0, -2)}AA`, NOW)).toBeNull()
    expect(belirteciCoz(`${p}.`, NOW)).toBeNull()
    for (const g of ['', 'abc', 'a.b.c', '...']) expect(belirteciCoz(g, NOW)).toBeNull()
    process.env.PAYLOAD_SECRET = 'baska-secret'
    expect(belirteciCoz(t, NOW)).toBeNull()
  })
})

describe('validateBulten', () => {
  it('accepts an e-mail with topics and normalises it', () => {
    expect(validateBulten(form({ eposta: '  Okur@Example.com ' }), Date.now())).toEqual({
      ok: true,
      data: { eposta: 'okur@example.com', locale: 'tr', konular: ['yazilar', 'kitaplar'] },
    })
  })

  it('treats the honeypot and a fast submit as spam', () => {
    expect(validateBulten(form({ website: 'x' }), Date.now())).toEqual({ ok: false, reason: 'spam' })
    expect(validateBulten(form({ t: String(Date.now() - 500) }), Date.now())).toEqual({ ok: false, reason: 'spam' })
  })

  it('rejects a bad e-mail, no topic, unknown topic, missing consent, missing t or locale', () => {
    const kusurlar: Record<string, string | string[]>[] = [
      { eposta: 'yok' },
      { konu: [] },
      { konu: ['yazilar', 'reklam'] },
      { onay: '' },
      { t: '' },
      { locale: 'fr' },
    ]
    for (const o of kusurlar) {
      expect(validateBulten(form(o), Date.now()), JSON.stringify(o)).toEqual({ ok: false, reason: 'invalid' })
    }
  })

  it('bultenMetinleriVar: empty global (fresh production) hides the form', () => {
    expect(bultenMetinleriVar({})).toBe(false)
    expect(bultenMetinleriVar(null)).toBe(false)
    expect(bultenMetinleriVar({ formGonder: 'Abone ol', onayEpostaKonu: 'Onaylayın' })).toBe(true)
  })
})

describe('bulteneKatil', () => {
  it('spam: silent ok, nothing sent', async () => {
    expect(await bulteneKatil({ status: 'idle' }, form({ website: 'bot' }))).toEqual({ status: 'ok' })
    expect(r.contactsCreate).not.toHaveBeenCalled()
    expect(r.send).not.toHaveBeenCalled()
  })

  it('invalid: error, nothing sent', async () => {
    expect(await bulteneKatil({ status: 'idle' }, form({ eposta: 'x' }))).toEqual({ status: 'error' })
    expect(r.send).not.toHaveBeenCalled()
  })

  it('unavailable without a key, or while the texts are not entered', async () => {
    delete process.env.RESEND_API_KEY
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'unavailable' })
    process.env.RESEND_API_KEY = 're_test'
    vi.mocked(getBulten).mockResolvedValueOnce({ metinler: {} } as never)
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'unavailable' })
    expect(r.contactsCreate).not.toHaveBeenCalled()
    expect(r.send).not.toHaveBeenCalled()
  })

  it('new address: unconfirmed contact in the locale segment with chosen topics, then a confirmation e-mail', async () => {
    expect(await bulteneKatil({ status: 'idle' }, form({ locale: 'en' }))).toEqual({ status: 'ok' })
    expect(r.contactsCreate).toHaveBeenCalledTimes(1)
    const c = r.contactsCreate.mock.calls[0][0]
    expect(c).toMatchObject({
      email: 'okur@example.com',
      unsubscribed: true,
      segments: [{ id: 'seg-en' }],
      topics: [
        { id: 'top-yazilar', subscription: 'opt_in' },
        { id: 'top-kitaplar', subscription: 'opt_in' },
      ],
    })
    const damga = c.properties.bulten_onay
    expect(typeof damga).toBe('number')

    expect(r.send).toHaveBeenCalledTimes(1)
    const { mail, yol, t, tam } = sonBaglanti()
    expect(mail.to).toBe('okur@example.com')
    expect(mail.from).toBe(process.env.RESEND_FROM)
    expect(mail.subject).toBe('Bülten aboneliğinizi onaylayın')
    expect(mail.text).toContain(tam)
    // Belirteç (e-postayı taşır) sorgu dizgesinde değil, parça kısmında: sunucu ve ölçüm araçları görmez.
    expect(yol).toBe('/en/newsletter/confirm')
    expect(mail.html).not.toContain('?t=')
    expect(belirteciCoz(t)).toEqual({ e: 'okur@example.com', l: 'en', k: ['yazilar', 'kitaplar'], n: damga })
    expect(mail.html).not.toMatch(/satın|satin|buy/i)
  })

  it('creates missing segment and topics (topics opt-out by default) and caches the ids', async () => {
    r.segmentsList.mockResolvedValue(r.ok({ object: 'list', data: [], has_more: false }))
    r.segmentsCreate.mockResolvedValue(r.ok({ id: 'seg-yeni', name: 'sitkicoban-tr', object: 'segment' }))
    r.topicsList.mockResolvedValue(r.ok({ data: KONULAR.slice(0, 1) }))
    r.topicsCreate.mockImplementation(async (o: { name: string }) => r.ok({ id: `yeni-${o.name}` }))
    r.propsList.mockResolvedValue(r.ok({ object: 'list', has_more: false, data: [] }))
    r.propsCreate.mockResolvedValue(r.ok({ id: 'p-yeni', object: 'contact_property' }))

    expect(await bulteneKatil({ status: 'idle' }, form({ konu: ['videolar'] }))).toEqual({ status: 'ok' })
    expect(r.segmentsCreate).toHaveBeenCalledWith({ name: 'sitkicoban-tr' })
    expect(r.topicsCreate).toHaveBeenCalledTimes(3)
    for (const [o] of r.topicsCreate.mock.calls) expect(o.defaultSubscription).toBe('opt_out')
    expect(r.propsCreate).toHaveBeenCalledWith(expect.objectContaining({ key: 'bulten_onay', type: 'number' }))
    expect(r.contactsCreate.mock.calls[0][0]).toMatchObject({
      segments: [{ id: 'seg-yeni' }],
      topics: [{ id: 'yeni-videolar', subscription: 'opt_in' }],
    })

    await bulteneKatil({ status: 'idle' }, form({ eposta: 'ikinci@example.com', konu: ['videolar'] }))
    expect(r.segmentsList).toHaveBeenCalledTimes(1)
    expect(r.topicsList).toHaveBeenCalledTimes(1)
    expect(r.propsList).toHaveBeenCalledTimes(1)
  })

  it('existing (confirmed) contact: never unsubscribed again, only the confirmation e-mail goes', async () => {
    r.contactsGet.mockResolvedValue(kisi({ unsubscribed: false }))
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'ok' })
    expect(r.contactsCreate).not.toHaveBeenCalled()
    for (const [o] of r.contactsUpdate.mock.calls) expect(o).not.toHaveProperty('unsubscribed')
    expect(r.send).toHaveBeenCalledTimes(1)
  })

  it('does not send another confirmation to the same address within 10 minutes', async () => {
    const simdi = Math.floor(Date.now() / 1000)
    r.contactsGet.mockResolvedValue(kisi({ onay: simdi - 120 }))
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'ok' })
    expect(r.send).not.toHaveBeenCalled()

    r.contactsGet.mockResolvedValue(kisi({ onay: simdi - 11 * 60 }))
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'ok' })
    expect(r.contactsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'okur@example.com', properties: { bulten_onay: expect.any(Number) } }),
    )
    expect(r.send).toHaveBeenCalledTimes(1)
  })

  it('a failed send resets the stamp, so an immediate retry does send', async () => {
    // Kişinin durumu bir sözlükte tutulur: get/create/update aynı kaydı okur ve yazar.
    let kayit: { unsubscribed: boolean; onay: number | null } | null = null
    r.contactsGet.mockImplementation(async () => (kayit ? kisi(kayit) : notFound))
    r.contactsCreate.mockImplementation(async (o: { unsubscribed: boolean; properties: { bulten_onay: number } }) => {
      kayit = { unsubscribed: o.unsubscribed, onay: o.properties.bulten_onay }
      return r.ok({ id: 'c-1', object: 'contact' })
    })
    r.contactsUpdate.mockImplementation(async (o: { properties?: { bulten_onay: number | null } }) => {
      if (kayit && o.properties) kayit.onay = o.properties.bulten_onay
      return r.ok({ id: 'c-1', object: 'contact' })
    })

    r.send.mockResolvedValueOnce(HATA())
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'error' })
    expect(kayit).toEqual({ unsubscribed: true, onay: null })

    r.send.mockRejectedValueOnce(new Error('ağ'))
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'error' })
    expect(kayit!.onay).toBeNull()

    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'ok' })
    expect(r.send).toHaveBeenCalledTimes(3)
    expect(kayit!.onay).toEqual(expect.any(Number))
  })

  it('every Resend failure is a status, never a throw', async () => {
    const durum = () => bulteneKatil({ status: 'idle' }, form())

    r.propsList.mockResolvedValueOnce(HATA()) // önbellek boşken: kişi özelliği tanımı okunamıyor
    expect(await durum()).toEqual({ status: 'error' })
    r.contactsGet.mockResolvedValueOnce(HATA())
    expect(await durum()).toEqual({ status: 'error' })
    r.contactsGet.mockRejectedValueOnce(new Error('ağ'))
    expect(await durum()).toEqual({ status: 'error' })
    r.contactsCreate.mockResolvedValueOnce(HATA('validation_error'))
    expect(await durum()).toEqual({ status: 'error' })
    r.contactsGet.mockResolvedValueOnce(kisi({ unsubscribed: false }))
    r.contactsUpdate.mockResolvedValueOnce(HATA())
    expect(await durum()).toEqual({ status: 'error' })
    expect(r.send).not.toHaveBeenCalled()

    r.send.mockResolvedValueOnce(HATA('daily_quota_exceeded'))
    expect(await durum()).toEqual({ status: 'error' })
  })
})

describe('bultenOnayla', () => {
  const damga = 1_700_000_000
  const belirtec = (k: ('yazilar' | 'kitaplar' | 'eserler' | 'videolar')[] = ['eserler'], l: 'tr' | 'en' | 'ar' = 'ar') =>
    onayBelirteci('okur@example.com', l, k, damga)

  beforeEach(() => {
    r.contactsGet.mockResolvedValue(kisi({ onay: damga }))
  })

  it('confirms: topics set (others opted out), moved to the locale segment, subscribed and the link consumed', async () => {
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'ok' })
    expect(r.contactTopicsUpdate).toHaveBeenCalledWith({
      email: 'okur@example.com',
      topics: [
        { id: 'top-yazilar', subscription: 'opt_out' },
        { id: 'top-kitaplar', subscription: 'opt_out' },
        { id: 'top-eserler', subscription: 'opt_in' },
        { id: 'top-videolar', subscription: 'opt_out' },
      ],
    })
    expect(r.contactSegmentsAdd).toHaveBeenCalledWith({ email: 'okur@example.com', segmentId: 'seg-ar' })
    const kaldirilan = r.contactSegmentsRemove.mock.calls.map(([o]) => o.segmentId).sort()
    expect(kaldirilan).toEqual(['seg-en', 'seg-tr'])
    expect(r.contactsUpdate).toHaveBeenCalledWith({
      email: 'okur@example.com',
      unsubscribed: false,
      properties: { bulten_onay: null },
    })
  })

  it('only the newest link works: an older link (stamp mismatch) is rejected unless already subscribed', async () => {
    r.contactsGet.mockResolvedValue(kisi({ onay: damga + 900 }))
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'error' })
    // Onaydan sonra çıkmış (unsubscribed) biri kullanılmış bağlantıyla geri yazılamaz.
    r.contactsGet.mockResolvedValue(kisi({ onay: null, unsubscribed: true }))
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'error' })
    // Zaten abone: aynı bağlantıya ikinci tıklama zararsız "ok", hiçbir şey değişmez.
    r.contactsGet.mockResolvedValue(kisi({ onay: null, unsubscribed: false }))
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'ok' })
    expect(r.contactsUpdate).not.toHaveBeenCalled()
    expect(r.contactTopicsUpdate).not.toHaveBeenCalled()
  })

  it('does not recreate a deleted contact', async () => {
    r.contactsGet.mockResolvedValue(notFound)
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'error' })
    expect(r.contactsCreate).not.toHaveBeenCalled()
  })

  it('invalid or expired token: error, Resend untouched', async () => {
    expect(await bultenOnayla('bozuk')).toEqual({ status: 'error' })
    const eski = onayBelirteci('okur@example.com', 'tr', ['yazilar'], damga, Date.now() - 8 * DAY)
    expect(await bultenOnayla(eski)).toEqual({ status: 'error' })
    expect(await bultenOnayla(42 as unknown as string)).toEqual({ status: 'error' })
    expect(r.contactsGet).not.toHaveBeenCalled()
    expect(r.contactsUpdate).not.toHaveBeenCalled()
  })

  it('every Resend failure is a status, never a throw; the link stays usable until the last step', async () => {
    r.contactTopicsUpdate.mockResolvedValueOnce(HATA())
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'error' })
    r.contactSegmentsAdd.mockResolvedValueOnce(HATA())
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'error' })
    r.contactsGet.mockResolvedValueOnce(HATA())
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'error' })
    r.contactsGet.mockRejectedValueOnce(new Error('ağ'))
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'error' })
    expect(r.contactsUpdate).not.toHaveBeenCalled()

    r.contactsUpdate.mockResolvedValueOnce(HATA('rate_limit_exceeded'))
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'error' })

    // Diğer dil segmentlerinden çıkarma en iyi çabadır: reddedilse de onay tamamlanır.
    r.contactSegmentsRemove.mockRejectedValue(new Error('ağ'))
    expect(await bultenOnayla(belirtec())).toEqual({ status: 'ok' })
  })

  it('unavailable without a key', async () => {
    const t = belirtec()
    delete process.env.RESEND_API_KEY
    expect(await bultenOnayla(t)).toEqual({ status: 'unavailable' })
  })
})
