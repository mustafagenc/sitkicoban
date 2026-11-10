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
      onayEpostaKonu: 'Bülten aboneliğinizi onaylayın',
      onayEpostaMetin: 'Aboneliği başlatmak için bağlantıya tıklayın.',
      onayEpostaDugme: 'Aboneliği onayla',
      onayEpostaNot: 'Bu isteği siz yapmadıysanız bu e-postayı silebilirsiniz.',
    },
  })),
}))

import { bulteneKatil, bultenOnayla } from '@/app/(frontend)/[locale]/bulten/actions'
import { _onbellegiSifirla, belirteciCoz, onayBelirteci } from '@/lib/bulten/resend'
import { validateBulten } from '@/lib/bulten/form'

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

describe('onay belirteci', () => {
  it('round-trips e-mail, locale and topics', () => {
    const t = onayBelirteci('okur@example.com', 'en', ['yazilar', 'eserler'], NOW)
    expect(t).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    expect(belirteciCoz(t, NOW + DAY)).toEqual({ e: 'okur@example.com', l: 'en', k: ['yazilar', 'eserler'] })
  })

  it('expires after 7 days', () => {
    const t = onayBelirteci('okur@example.com', 'tr', ['yazilar'], NOW)
    expect(belirteciCoz(t, NOW + 7 * DAY - 1000)).not.toBeNull()
    expect(belirteciCoz(t, NOW + 7 * DAY + 1000)).toBeNull()
  })

  it('rejects a tampered payload or signature, garbage, and another secret', () => {
    const t = onayBelirteci('okur@example.com', 'tr', ['yazilar'], NOW)
    const [p, s] = t.split('.')
    const sahte = Buffer.from(
      JSON.stringify({ e: 'baska@example.com', l: 'tr', k: ['yazilar'], exp: NOW + DAY }),
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

  it('unavailable without a key', async () => {
    delete process.env.RESEND_API_KEY
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'unavailable' })
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
    expect(typeof c.properties.bulten_onay).toBe('number')

    expect(r.send).toHaveBeenCalledTimes(1)
    const mail = r.send.mock.calls[0][0]
    expect(mail.to).toBe('okur@example.com')
    expect(mail.from).toBe(process.env.RESEND_FROM)
    expect(mail.subject).toBe('Bülten aboneliğinizi onaylayın')
    const link = /https:\/\/ornek\.test\/en\/newsletter\/confirm\?t=([A-Za-z0-9_.-]+)/.exec(mail.html)
    expect(link).not.toBeNull()
    expect(mail.text).toContain(link![0])
    expect(belirteciCoz(link![1])).toEqual({ e: 'okur@example.com', l: 'en', k: ['yazilar', 'kitaplar'] })
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
    r.contactsGet.mockResolvedValue(
      r.ok({ id: 'c-1', email: 'okur@example.com', unsubscribed: false, created_at: '', properties: {} }),
    )
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'ok' })
    expect(r.contactsCreate).not.toHaveBeenCalled()
    for (const [o] of r.contactsUpdate.mock.calls) expect(o).not.toHaveProperty('unsubscribed')
    expect(r.send).toHaveBeenCalledTimes(1)
  })

  it('does not send another confirmation to the same address within 10 minutes', async () => {
    const simdi = Math.floor(Date.now() / 1000)
    r.contactsGet.mockResolvedValue(
      r.ok({
        id: 'c-1',
        email: 'okur@example.com',
        unsubscribed: true,
        created_at: '',
        properties: { bulten_onay: { type: 'number', value: simdi - 120 } },
      }),
    )
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'ok' })
    expect(r.send).not.toHaveBeenCalled()

    r.contactsGet.mockResolvedValue(
      r.ok({
        id: 'c-1',
        email: 'okur@example.com',
        unsubscribed: true,
        created_at: '',
        properties: { bulten_onay: { type: 'number', value: simdi - 11 * 60 } },
      }),
    )
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'ok' })
    expect(r.contactsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'okur@example.com', properties: { bulten_onay: expect.any(Number) } }),
    )
    expect(r.send).toHaveBeenCalledTimes(1)
  })

  it('a Resend error is an error, never a throw', async () => {
    r.contactsGet.mockResolvedValue({ data: null, error: { name: 'internal_server_error', message: 'x', statusCode: 500 }, headers: null })
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'error' })
    r.contactsGet.mockRejectedValue(new Error('ağ'))
    expect(await bulteneKatil({ status: 'idle' }, form())).toEqual({ status: 'error' })
    expect(r.send).not.toHaveBeenCalled()
  })
})

describe('bultenOnayla', () => {
  it('confirms: subscribed, topics set (others opted out), moved to the locale segment', async () => {
    const t = onayBelirteci('okur@example.com', 'ar', ['eserler'])
    expect(await bultenOnayla(t)).toEqual({ status: 'ok' })
    expect(r.contactsUpdate).toHaveBeenCalledWith({ email: 'okur@example.com', unsubscribed: false })
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
  })

  it('recreates a contact deleted in the meantime', async () => {
    r.contactsUpdate.mockResolvedValue(notFound)
    const t = onayBelirteci('okur@example.com', 'tr', ['yazilar'])
    expect(await bultenOnayla(t)).toEqual({ status: 'ok' })
    expect(r.contactsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'okur@example.com', unsubscribed: false, segments: [{ id: 'seg-tr' }] }),
    )
  })

  it('invalid or expired token: error, Resend untouched', async () => {
    expect(await bultenOnayla('bozuk')).toEqual({ status: 'error' })
    const eski = onayBelirteci('okur@example.com', 'tr', ['yazilar'], Date.now() - 8 * DAY)
    expect(await bultenOnayla(eski)).toEqual({ status: 'error' })
    expect(await bultenOnayla(42 as unknown as string)).toEqual({ status: 'error' })
    expect(r.contactsUpdate).not.toHaveBeenCalled()
  })

  it('unavailable without a key', async () => {
    const t = onayBelirteci('okur@example.com', 'tr', ['yazilar'])
    delete process.env.RESEND_API_KEY
    expect(await bultenOnayla(t)).toEqual({ status: 'unavailable' })
  })
})
