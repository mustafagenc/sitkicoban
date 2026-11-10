// @vitest-environment node
import { randomBytes } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const r = vi.hoisted(() => {
  const ok = <T>(data: T) => ({ data, error: null, headers: null })
  return { ok, broadcastsCreate: vi.fn(), segmentsList: vi.fn(), segmentsCreate: vi.fn(), topicsList: vi.fn(), topicsCreate: vi.fn(), pushSend: vi.fn() }
})

vi.mock('resend', () => ({
  Resend: class {
    broadcasts = { create: r.broadcastsCreate }
    segments = { list: r.segmentsList, create: r.segmentsCreate }
    topics = { list: r.topicsList, create: r.topicsCreate }
  },
}))

vi.mock('web-push', () => {
  const api = { sendNotification: r.pushSend }
  return { default: api, ...api }
})

import { _elleCalistir, duyurulariBekle } from '@/lib/bulten/duyuru'
import { baglantiAdresi, paragraflar } from '@/lib/bulten/ozelDuyuru'
import { _onbellegiSifirla } from '@/lib/bulten/resend'
import config from '@/payload.config'

const dbName = () => new URL(process.env.DATABASE_URL ?? 'postgres://x/none').pathname.replace(/^\//, '')
const ENV = { ...process.env }
const SITE = 'https://site.example'

const SEGMENTLER = ['tr', 'en', 'ar'].map((l) => ({ id: `seg-${l}`, name: `sitkicoban-${l}`, created_at: '' }))
const KONULAR = ['yazilar', 'kitaplar', 'eserler', 'videolar'].map((name) => ({ id: `top-${name}`, name, default_subscription: 'opt_out', created_at: '' }))

const b64 = (b: Buffer) => b.toString('base64url')
const pushKaydi = (konular: string[], dil = 'tr') => ({
  endpoint: `https://fcm.googleapis.com/fcm/send/${b64(randomBytes(24))}`,
  p256dh: b64(Buffer.concat([Buffer.from([4]), randomBytes(64)])),
  auth: b64(randomBytes(16)),
  dil,
  konular,
})

let payload: Payload

const temizle = async () => {
  for (const collection of ['duyurular', 'push-abonelikleri'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true, context: { disableRevalidate: true } })
  }
}

beforeAll(async () => {
  if (!dbName().endsWith('_test')) throw new Error(`Refusing to run on "${dbName()}" (must end with _test)`)
  payload = await getPayload({ config })
  _elleCalistir(true)
  for (const locale of ['tr', 'en', 'ar'] as const) {
    await payload.updateGlobal({
      slug: 'bulten',
      locale,
      data: { aciklama: 'Bülten', metinler: { duyuruGor: { tr: 'Sitede gör →', en: 'View →', ar: 'شاهدوا ←' }[locale], duyuruAyril: 'Abonelikten çık' } },
      context: { disableRevalidate: true },
    })
  }
}, 60_000)

beforeEach(async () => {
  process.env.RESEND_API_KEY = 're_test'
  process.env.RESEND_FROM = 'Sıtkı Çoban <bulten@example.com>'
  process.env.SITE_URL = SITE
  process.env.VAPID_PUBLIC_KEY = 'BTest'
  process.env.VAPID_PRIVATE_KEY = 'test-private'
  process.env.VAPID_SUBJECT = 'mailto:bulten@example.com'
  _onbellegiSifirla()
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn(async () => new Response('')))
  r.segmentsList.mockResolvedValue(r.ok({ object: 'list', has_more: false, data: SEGMENTLER }))
  r.topicsList.mockResolvedValue(r.ok({ object: 'list', has_more: false, data: KONULAR }))
  r.broadcastsCreate.mockResolvedValue(r.ok({ id: 'bc-1' }))
  r.pushSend.mockResolvedValue({ statusCode: 201, body: '', headers: {} })
  await temizle()
})

afterEach(async () => {
  await duyurulariBekle()
  vi.unstubAllGlobals()
  process.env = { ...ENV }
})

afterAll(async () => {
  _elleCalistir(false)
  if (dbName().endsWith('_test') && payload) await temizle()
}, 60_000)

const duyuru = (o: Record<string, unknown> = {}) =>
  payload.create({
    collection: 'duyurular',
    locale: 'tr',
    data: {
      baslik: 'Sergi <açılışı>',
      metin: 'Birinci paragraf.\n\nİkinci\nparagraf.',
      baglanti: 'eserler',
      kitle: 'hepsi',
      kanallar: ['eposta', 'bildirim'],
      ...o,
    } as never,
    overrideAccess: true,
  })

describe('Duyurular (panelden serbest duyuru)', () => {
  it('does not send while "gönder" is unchecked', async () => {
    await duyuru()
    await duyurulariBekle()
    expect(r.broadcastsCreate).not.toHaveBeenCalled()
    expect(r.pushSend).not.toHaveBeenCalled()
  })

  it('sends once to everyone: a broadcast per locale without topic, push to all subscriptions; records the result', async () => {
    await payload.create({ collection: 'push-abonelikleri', data: pushKaydi(['yazilar']) as never, overrideAccess: true })
    await payload.create({ collection: 'push-abonelikleri', data: pushKaydi(['videolar'], 'en') as never, overrideAccess: true })
    const d = await duyuru({ gonder: true })
    await duyurulariBekle()

    expect(r.broadcastsCreate).toHaveBeenCalledTimes(3)
    for (const [arg] of r.broadcastsCreate.mock.calls) {
      expect(arg.topicId).toBeUndefined()
      expect(arg.subject).toBe('Sergi <açılışı>')
      expect(arg.html).toContain('Sergi &lt;açılışı&gt;')
      expect(arg.html).toContain('<p style="margin:0 0 18px;">İkinci paragraf.</p>')
      expect(arg.html).toContain('{{{RESEND_UNSUBSCRIBE_URL}}}')
    }
    const tr = r.broadcastsCreate.mock.calls.find(([a]) => a.segmentId === 'seg-tr')![0]
    expect(tr.html).toContain(`${SITE}/eserler`)
    expect(r.pushSend).toHaveBeenCalledTimes(2)
    const en = r.pushSend.mock.calls.map(([, g]) => JSON.parse(g)).find((g) => g.url.includes('/en/'))
    expect(en.url).toBe(`${SITE}/en/works`)

    const sonra = await payload.findByID({ collection: 'duyurular', id: d.id, overrideAccess: true })
    expect(sonra.gonder).toBe(false)
    expect(sonra.gonderildi).toBeTruthy()
    expect(sonra.sonuc).toContain('E-posta: 3 dil')
    expect(sonra.sonuc).toContain('Bildirim: 2/2')

    // İkinci kayıt: yeniden gönderilmez.
    vi.clearAllMocks()
    await payload.update({ collection: 'duyurular', id: d.id, data: { gonder: true, baslik: 'Değişti' }, overrideAccess: true })
    await duyurulariBekle()
    expect(r.broadcastsCreate).not.toHaveBeenCalled()
    expect(r.pushSend).not.toHaveBeenCalled()
  })

  it('targets one topic and honours the channel choice', async () => {
    await payload.create({ collection: 'push-abonelikleri', data: pushKaydi(['kitaplar']) as never, overrideAccess: true })
    await payload.create({ collection: 'push-abonelikleri', data: pushKaydi(['videolar']) as never, overrideAccess: true })
    await duyuru({ gonder: true, kitle: 'kitaplar', kanallar: ['bildirim'] })
    await duyurulariBekle()
    expect(r.broadcastsCreate).not.toHaveBeenCalled()
    expect(r.pushSend).toHaveBeenCalledTimes(1)

    vi.clearAllMocks()
    await duyuru({ gonder: true, kitle: 'kitaplar', kanallar: ['eposta'], baglanti: 'yok' })
    await duyurulariBekle()
    expect(r.pushSend).not.toHaveBeenCalled()
    expect(r.broadcastsCreate).toHaveBeenCalledTimes(3)
    const [arg] = r.broadcastsCreate.mock.calls[0]
    expect(arg.topicId).toBe('top-kitaplar')
    expect(arg.html).not.toContain('<a href="https://site.example')
  })

  it('a duplicated announcement is unsent', async () => {
    const d = await duyuru({ gonder: true })
    await duyurulariBekle()
    const kopya = await payload.duplicate({ collection: 'duyurular', id: d.id, overrideAccess: true })
    expect(kopya.gonderildi ?? null).toBeNull()
    expect(kopya.gonder).toBe(false)
    expect(kopya.sonuc ?? null).toBeNull()
  })

  it('links only to site pages', () => {
    expect(baglantiAdresi({ baglanti: 'yok' }, 'tr')).toBeNull()
    expect(baglantiAdresi({ baglanti: 'kitaplar' }, 'ar')).toMatch(/\/ar\/books$/)
    expect(baglantiAdresi({ baglanti: 'yazi', yazi: { slug: 'x', yayinda: true } }, 'en')).toMatch(/\/en\/writings\/x$/)
    expect(baglantiAdresi({ baglanti: 'yazi', yazi: { slug: 'x', yayinda: false } }, 'tr')).toBeNull()
    expect(paragraflar('a\nb\n\n\nc')).toEqual(['a b', 'c'])
  })
})
