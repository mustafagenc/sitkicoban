// @vitest-environment node
import { randomBytes } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const r = vi.hoisted(() => {
  const ok = <T>(data: T) => ({ data, error: null, headers: null })
  return {
    ok,
    broadcastsCreate: vi.fn(),
    segmentsList: vi.fn(),
    segmentsCreate: vi.fn(),
    topicsList: vi.fn(),
    topicsCreate: vi.fn(),
    pushSend: vi.fn(),
  }
})

vi.mock('resend', () => ({
  Resend: class {
    broadcasts = { create: r.broadcastsCreate }
    segments = { list: r.segmentsList, create: r.segmentsCreate }
    topics = { list: r.topicsList, create: r.topicsCreate }
  },
}))

vi.mock('web-push', () => {
  class WebPushError extends Error {
    constructor(
      message: string,
      public statusCode: number,
    ) {
      super(message)
    }
  }
  const api = { sendNotification: r.pushSend, WebPushError }
  return { default: api, ...api }
})

import { _elleCalistir, duyurulariBekle } from '@/lib/bulten/duyuru'
import { duyuruEpostasi, duyuruIcerigi } from '@/lib/bulten/gonder'
import { _onbellegiSifirla } from '@/lib/bulten/resend'
import config from '@/payload.config'

const dbName = () => new URL(process.env.DATABASE_URL ?? 'postgres://x/none').pathname.replace(/^\//, '')
const ENV = { ...process.env }
const SITE = 'https://site.example'

const SEGMENTLER = ['tr', 'en', 'ar'].map((l) => ({ id: `seg-${l}`, name: `sitkicoban-${l}`, created_at: '' }))
const KONULAR = ['yazilar', 'kitaplar', 'eserler', 'videolar'].map((name) => ({
  id: `top-${name}`,
  name,
  default_subscription: 'opt_out',
  created_at: '',
}))

const METIN = {
  tr: { duyuruKonuYazi: 'Yeni yazı: {baslik}', duyuruKonuKitap: 'Yeni kitap: {baslik}', duyuruOku: 'Sitede oku →', duyuruGor: 'Sitede gör →', duyuruAyril: 'Abonelikten çık' },
  en: { duyuruKonuYazi: 'New writing: {baslik}', duyuruKonuKitap: 'New book: {baslik}', duyuruOku: 'Read →', duyuruGor: 'View →', duyuruAyril: 'Unsubscribe' },
  ar: { duyuruKonuYazi: 'مقالة جديدة: {baslik}', duyuruKonuKitap: 'كتاب جديد: {baslik}', duyuruOku: 'اقرؤوا ←', duyuruGor: 'شاهدوا ←', duyuruAyril: 'إلغاء الاشتراك' },
} as const

const govde = (metin: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: null,
        textFormat: 0,
        children: [{ type: 'text', text: metin, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
      },
    ],
  },
})

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
  for (const collection of ['yazilar', 'kitaplar', 'push-abonelikleri'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true, context: { disableRevalidate: true } })
  }
}

beforeAll(async () => {
  if (!dbName().endsWith('_test')) throw new Error(`Refusing to run on "${dbName()}" (must end with _test)`)
  payload = await getPayload({ config })
  // Gönderim işleri kayıt işlemi bittikten sonra, testin kendisi tarafından çalıştırılır.
  _elleCalistir(true)
  for (const locale of ['tr', 'en', 'ar'] as const) {
    await payload.updateGlobal({
      slug: 'bulten',
      locale,
      data: { aciklama: 'Bülten', metinler: METIN[locale] },
      context: { disableRevalidate: true },
    })
  }
}, 60_000)

beforeEach(async () => {
  process.env.RESEND_API_KEY = 're_test'
  process.env.RESEND_FROM = 'Sıtkı Çoban <bulten@example.com>'
  process.env.PAYLOAD_SECRET ||= 'test-secret'
  process.env.SITE_URL = SITE
  process.env.VAPID_PUBLIC_KEY = 'BTest'
  process.env.VAPID_PRIVATE_KEY = 'test-private'
  process.env.VAPID_SUBJECT = 'mailto:bulten@example.com'
  _onbellegiSifirla()
  vi.clearAllMocks()
  // Önbellek ısıtma istekleri (revalidate) dışarı çıkmaz.
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

const yaziOlustur = (o: Record<string, unknown> = {}, context: Record<string, unknown> = {}) =>
  payload.create({
    collection: 'yazilar',
    locale: 'tr',
    data: {
      baslik: 'Zikir & <Fikir>',
      ozet: 'Kısa özet',
      govde: govde('Gövde metni burada.') as never,
      yayinda: true,
      duyur: true,
      ...o,
    },
    context,
  })

describe('duyuru tetikleme', () => {
  it('sends nothing for a draft, an unchecked box, or seed/disableRevalidate/duyuruYok context', async () => {
    await yaziOlustur({ yayinda: false, govde: undefined })
    await yaziOlustur({ duyur: false })
    await yaziOlustur({}, { disableRevalidate: true })
    await yaziOlustur({}, { duyuruYok: true })
    await duyurulariBekle()
    expect(r.broadcastsCreate).not.toHaveBeenCalled()
    expect(r.pushSend).not.toHaveBeenCalled()
  })

  it('published + duyur → one broadcast per locale and push; record reset; saving again sends nothing', async () => {
    await payload.create({ collection: 'push-abonelikleri', data: pushKaydi(['yazilar']) as never, overrideAccess: true })
    const yazi = await yaziOlustur()
    await duyurulariBekle()

    expect(r.broadcastsCreate).toHaveBeenCalledTimes(3)
    const cagrilar = r.broadcastsCreate.mock.calls.map((c) => c[0])
    expect(cagrilar.map((c) => c.segmentId).sort()).toEqual(['seg-ar', 'seg-en', 'seg-tr'])
    for (const c of cagrilar) {
      expect(c.topicId).toBe('top-yazilar')
      expect(c.send).toBe(true)
      expect(c.from).toBe(process.env.RESEND_FROM)
      expect(c.html).toContain('{{{RESEND_UNSUBSCRIBE_URL}}}')
      expect(c.html).toContain(`${SITE}/`)
      expect(typeof c.text).toBe('string')
    }
    const tr = cagrilar.find((c) => c.segmentId === 'seg-tr')
    expect(tr.subject).toBe('Yeni yazı: Zikir & <Fikir>')
    expect(tr.html).toContain(`${SITE}/yazilar/${yazi.slug}`)
    const en = cagrilar.find((c) => c.segmentId === 'seg-en')
    expect(en.html).toContain(`${SITE}/en/writings/${yazi.slug}`)

    expect(r.pushSend).toHaveBeenCalledTimes(1)

    const sonra = await payload.findByID({ collection: 'yazilar', id: yazi.id, depth: 0 })
    expect(sonra.duyur).toBe(false)
    expect(sonra.duyuruldu).toBeTruthy()

    await payload.update({ collection: 'yazilar', id: yazi.id, data: { ozet: 'Düzeltilmiş özet' }, locale: 'tr' })
    await payload.update({ collection: 'yazilar', id: yazi.id, data: { duyur: true }, locale: 'tr' })
    await duyurulariBekle()
    expect(r.broadcastsCreate).toHaveBeenCalledTimes(3)
    expect(r.pushSend).toHaveBeenCalledTimes(1)
  })

  it('a draft that is announced later sends once when it is published', async () => {
    const yazi = await yaziOlustur({ yayinda: false, govde: undefined })
    await duyurulariBekle()
    expect(r.broadcastsCreate).not.toHaveBeenCalled()
    await payload.update({ collection: 'yazilar', id: yazi.id, locale: 'tr', data: { yayinda: true, govde: govde('Artık dolu.') as never } })
    await duyurulariBekle()
    expect(r.broadcastsCreate).toHaveBeenCalledTimes(3)
  })

  it('yenidenDuyur re-announces an already announced record once', async () => {
    const yazi = await yaziOlustur()
    await duyurulariBekle()
    expect(r.broadcastsCreate).toHaveBeenCalledTimes(3)
    await payload.update({ collection: 'yazilar', id: yazi.id, locale: 'tr', data: { yenidenDuyur: true } })
    await duyurulariBekle()
    expect(r.broadcastsCreate).toHaveBeenCalledTimes(6)
    const sonra = await payload.findByID({ collection: 'yazilar', id: yazi.id, depth: 0 })
    expect(sonra.yenidenDuyur).toBe(false)
  })

  it('skips a locale whose subject template is empty and never sends e-mail without Resend', async () => {
    await payload.updateGlobal({ slug: 'bulten', locale: 'ar', data: { metinler: { duyuruKonuYazi: '' } }, context: { disableRevalidate: true } })
    try {
      await yaziOlustur()
      await duyurulariBekle()
      expect(r.broadcastsCreate.mock.calls.map((c) => c[0].segmentId).sort()).toEqual(['seg-en', 'seg-tr'])
    } finally {
      await payload.updateGlobal({ slug: 'bulten', locale: 'ar', data: { metinler: METIN.ar }, context: { disableRevalidate: true } })
    }
    vi.clearAllMocks()
    delete process.env.RESEND_API_KEY
    await yaziOlustur()
    await duyurulariBekle()
    expect(r.broadcastsCreate).not.toHaveBeenCalled()
  })

  it('a Resend error for one locale does not stop the others', async () => {
    r.broadcastsCreate.mockResolvedValueOnce({ data: null, error: { name: 'x', message: 'boom' }, headers: null })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await yaziOlustur()
    await duyurulariBekle()
    expect(r.broadcastsCreate).toHaveBeenCalledTimes(3)
    spy.mockRestore()
  })
})

describe('kitap duyurusu', () => {
  it('never contains the buy link and points to the books page', async () => {
    const SATIN = 'https://magaza.example.com/satin-al/eskimeyen'
    await payload.create({
      collection: 'kitaplar',
      locale: 'tr',
      data: { baslik: 'Eskimeyen', aciklama: 'Bir kitap', satinAlLinki: SATIN, duyur: true },
    })
    await duyurulariBekle()
    expect(r.broadcastsCreate).toHaveBeenCalledTimes(3)
    for (const [c] of r.broadcastsCreate.mock.calls) {
      expect(c.topicId).toBe('top-kitaplar')
      expect(c.html).not.toContain('magaza.example.com')
      expect(c.text).not.toContain('magaza.example.com')
      expect(c.html).not.toContain('satin')
    }
    const tr = r.broadcastsCreate.mock.calls.map((c) => c[0]).find((c) => c.segmentId === 'seg-tr')
    expect(tr.html).toContain(`href="${SITE}/kitaplar"`)
    expect(tr.text).toContain(`${SITE}/kitaplar`)
  })

  it('duyuruIcerigi ignores satinAlLinki', () => {
    const ic = duyuruIcerigi('kitaplar', { baslik: 'K', aciklama: 'A', satinAlLinki: 'https://x.example/buy' }, 'en')
    expect(ic.url).toBe(`${SITE}/en/books`)
    expect(JSON.stringify(ic)).not.toContain('x.example')
  })
})

describe('e-posta şablonu', () => {
  it('escapes user content in the HTML', () => {
    const e = duyuruEpostasi(
      'yazilar',
      { baslik: '<script>alert(1)</script>', ozet: 'a "b" & c', gorsel: null, url: `${SITE}/yazilar/x` },
      METIN.tr,
      'tr',
    )
    expect(e).not.toBeNull()
    expect(e!.html).not.toContain('<script>')
    expect(e!.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(e!.html).toContain('a &quot;b&quot; &amp; c')
    expect(e!.subject).toBe('Yeni yazı: <script>alert(1)</script>')
    expect(e!.text).toContain(`${SITE}/yazilar/x`)
    expect(e!.text).toContain('{{{RESEND_UNSUBSCRIBE_URL}}}')
  })
})

describe('push gönderimi', () => {
  it('sends only to subscribers of the topic, in their language; 410 deletes, 500 keeps', async () => {
    const gone = await payload.create({ collection: 'push-abonelikleri', data: pushKaydi(['yazilar'], 'en') as never, overrideAccess: true })
    const hata = await payload.create({ collection: 'push-abonelikleri', data: pushKaydi(['yazilar', 'kitaplar'], 'tr') as never, overrideAccess: true })
    const baska = await payload.create({ collection: 'push-abonelikleri', data: pushKaydi(['kitaplar'], 'tr') as never, overrideAccess: true })
    const { WebPushError } = (await import('web-push')) as unknown as { WebPushError: new (m: string, s: number) => Error }
    r.pushSend.mockImplementation(async (sub: { endpoint: string }) => {
      if (sub.endpoint === gone.endpoint) throw new WebPushError('Gone', 410)
      if (sub.endpoint === hata.endpoint) throw new WebPushError('Server error', 500)
      return { statusCode: 201, body: '', headers: {} }
    })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const yazi = await yaziOlustur()
    await duyurulariBekle()
    spy.mockRestore()

    const hedefler = r.pushSend.mock.calls.map((c) => c[0].endpoint).sort()
    expect(hedefler).toEqual([gone.endpoint, hata.endpoint].sort())
    expect(hedefler).not.toContain(baska.endpoint)

    const enCagri = r.pushSend.mock.calls.find((c) => c[0].endpoint === gone.endpoint)!
    const govdeEn = JSON.parse(enCagri[1])
    expect(govdeEn.url).toBe(`${SITE}/en/writings/${yazi.slug}`)
    expect(govdeEn.title).toBe('New writing: Zikir & <Fikir>')
    expect(enCagri[2]).toMatchObject({ TTL: expect.any(Number), vapidDetails: { subject: 'mailto:bulten@example.com' } })

    const kalan = (await payload.find({ collection: 'push-abonelikleri', limit: 10, overrideAccess: true })).docs.map((d) => d.id)
    expect(kalan).not.toContain(gone.id)
    expect(kalan).toContain(hata.id)
    expect(kalan).toContain(baska.id)
  })

  it('skips push when VAPID is not configured and endpoints of unknown hosts', async () => {
    // Doğrulamayı atlayan eski/bozuk bir kayıt: gönderilmez.
    await payload.create({
      collection: 'push-abonelikleri',
      data: { ...pushKaydi(['yazilar']), endpoint: 'https://evil.example.com/x' } as never,
      overrideAccess: true,
    })
    await yaziOlustur()
    await duyurulariBekle()
    expect(r.pushSend).not.toHaveBeenCalled()

    delete process.env.VAPID_PRIVATE_KEY
    await payload.create({ collection: 'push-abonelikleri', data: pushKaydi(['yazilar']) as never, overrideAccess: true })
    await yaziOlustur()
    await duyurulariBekle()
    expect(r.pushSend).not.toHaveBeenCalled()
  })

  it('leaves the record marked when neither e-mail nor push is configured', async () => {
    delete process.env.RESEND_API_KEY
    delete process.env.VAPID_PRIVATE_KEY
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const yazi = await yaziOlustur()
    await duyurulariBekle()
    log.mockRestore()
    const sonra = await payload.findByID({ collection: 'yazilar', id: yazi.id, depth: 0 })
    expect(sonra.duyur).toBe(true)
    expect(sonra.duyuruldu).toBeFalsy()
  })
})
