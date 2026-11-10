// @vitest-environment node
import { randomBytes } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { pushKaydet, pushSil } from '@/app/(frontend)/[locale]/bulten/push'
import { pushHazir, pushHostuGecerli } from '@/lib/bulten/push'
import config from '@/payload.config'

const dbName = () => new URL(process.env.DATABASE_URL ?? 'postgres://x/none').pathname.replace(/^\//, '')

const b64 = (b: Buffer) => b.toString('base64url')
/** Tarayıcının `PushSubscription.toJSON()` çıktısının taklidi: P-256 açık anahtarı (65 bayt) ve 16 baytlık auth. */
const abonelik = (endpoint = `https://fcm.googleapis.com/fcm/send/${b64(randomBytes(24))}`) => ({
  endpoint,
  keys: { p256dh: b64(Buffer.concat([Buffer.from([4]), randomBytes(64)])), auth: b64(randomBytes(16)) },
})

const ENV = { ...process.env }

let payload: Payload
const kayitlar = async () =>
  (await payload.find({ collection: 'push-abonelikleri', limit: 100, overrideAccess: true, sort: 'createdAt' })).docs

beforeAll(async () => {
  if (!dbName().endsWith('_test')) throw new Error(`Refusing to run on "${dbName()}" (must end with _test)`)
  payload = await getPayload({ config })
}, 60_000)

beforeEach(async () => {
  process.env.VAPID_PUBLIC_KEY = 'BTest'
  process.env.VAPID_PRIVATE_KEY = 'test-private'
  process.env.VAPID_SUBJECT = 'mailto:bulten@example.com'
  await payload.delete({ collection: 'push-abonelikleri', where: { id: { exists: true } }, overrideAccess: true })
})

afterEach(() => {
  process.env = { ...ENV }
})

afterAll(async () => {
  if (dbName().endsWith('_test') && payload) {
    await payload.delete({ collection: 'push-abonelikleri', where: { id: { exists: true } }, overrideAccess: true })
  }
}, 60_000)

describe('push servis adresleri', () => {
  it('accepts the known push services over https only', () => {
    for (const u of [
      'https://fcm.googleapis.com/fcm/send/abc',
      'https://updates.push.services.mozilla.com/wpush/v2/abc',
      'https://wns2-par02p.notify.windows.com/w/?token=abc',
      'https://web.push.apple.com/QGx',
    ]) {
      expect(pushHostuGecerli(u), u).toBe(true)
    }
    for (const u of [
      'http://fcm.googleapis.com/fcm/send/abc',
      'https://evil.example.com/fcm.googleapis.com',
      'https://fcm.googleapis.com.evil.example.com/x',
      'https://notify.windows.com.evil.example/x',
      'https://user:pw@fcm.googleapis.com/x',
      'https://fcm.googleapis.com:8443/x',
      'javascript:alert(1)',
      'bozuk',
      `https://fcm.googleapis.com/${'a'.repeat(1100)}`,
    ]) {
      expect(pushHostuGecerli(u), u).toBe(false)
    }
  })

  it('pushHazir needs all three VAPID variables', () => {
    expect(pushHazir()).toBe(true)
    delete process.env.VAPID_SUBJECT
    expect(pushHazir()).toBe(false)
  })
})

describe('pushKaydet', () => {
  it('stores a subscription and upserts by endpoint (no duplicate, topics and locale updated)', async () => {
    const s = abonelik()
    expect(await pushKaydet(s, 'tr', ['yazilar', 'kitaplar'])).toEqual({ status: 'ok' })
    let docs = await kayitlar()
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({ endpoint: s.endpoint, p256dh: s.keys.p256dh, auth: s.keys.auth, dil: 'tr' })
    expect(docs[0].konular).toEqual(['yazilar', 'kitaplar'])

    const yeni = { ...s, keys: abonelik().keys }
    expect(await pushKaydet(yeni, 'ar', ['videolar', 'eserler', 'videolar'])).toEqual({ status: 'ok' })
    docs = await kayitlar()
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({ endpoint: s.endpoint, p256dh: yeni.keys.p256dh, auth: yeni.keys.auth, dil: 'ar' })
    expect(docs[0].konular).toEqual(['eserler', 'videolar'])

    expect(await pushKaydet(abonelik('https://updates.push.services.mozilla.com/wpush/v2/x'), 'en', ['yazilar'])).toEqual({
      status: 'ok',
    })
    expect(await kayitlar()).toHaveLength(2)
  })

  it('rejects bad endpoints, keys, locale and topics without touching the database', async () => {
    const s = abonelik()
    const kotu: [unknown, unknown, unknown][] = [
      [{ ...s, endpoint: 'http://fcm.googleapis.com/fcm/send/x' }, 'tr', ['yazilar']],
      [{ ...s, endpoint: 'https://evil.example.com/push' }, 'tr', ['yazilar']],
      [{ ...s, keys: { ...s.keys, p256dh: 'kisa' } }, 'tr', ['yazilar']],
      [{ ...s, keys: { ...s.keys, p256dh: b64(Buffer.concat([Buffer.from([2]), randomBytes(64)])) } }, 'tr', ['yazilar']],
      [{ ...s, keys: { ...s.keys, auth: b64(randomBytes(32)) } }, 'tr', ['yazilar']],
      [{ ...s, keys: { ...s.keys, auth: 'ab$cd' } }, 'tr', ['yazilar']],
      [{ endpoint: s.endpoint }, 'tr', ['yazilar']],
      [s, 'fr', ['yazilar']],
      [s, 'tr', []],
      [s, 'tr', ['yazilar', 'reklam']],
      [s, 'tr', 'yazilar'],
      [null, 'tr', ['yazilar']],
      ['metin', 'tr', ['yazilar']],
    ]
    for (const [sub, dil, konular] of kotu) {
      expect(await pushKaydet(sub as never, dil as never, konular as never), JSON.stringify([sub, dil, konular])).toEqual({
        status: 'error',
      })
    }
    expect(await kayitlar()).toHaveLength(0)
  })

  it('unavailable without VAPID keys', async () => {
    delete process.env.VAPID_PRIVATE_KEY
    expect(await pushKaydet(abonelik(), 'tr', ['yazilar'])).toEqual({ status: 'unavailable' })
    expect(await kayitlar()).toHaveLength(0)
  })
})

describe('pushSil', () => {
  it('deletes only the given endpoint; an unknown endpoint is still ok', async () => {
    const a = abonelik()
    const b = abonelik()
    await pushKaydet(a, 'tr', ['yazilar'])
    await pushKaydet(b, 'en', ['kitaplar'])
    expect(await pushSil(a.endpoint)).toEqual({ status: 'ok' })
    const docs = await kayitlar()
    expect(docs.map((d) => d.endpoint)).toEqual([b.endpoint])
    expect(await pushSil(a.endpoint)).toEqual({ status: 'ok' })
  })

  it('rejects an invalid endpoint and is unavailable without VAPID keys', async () => {
    const a = abonelik()
    await pushKaydet(a, 'tr', ['yazilar'])
    expect(await pushSil('https://evil.example.com/x')).toEqual({ status: 'error' })
    expect(await pushSil(42 as never)).toEqual({ status: 'error' })
    delete process.env.VAPID_PUBLIC_KEY
    expect(await pushSil(a.endpoint)).toEqual({ status: 'unavailable' })
    expect(await kayitlar()).toHaveLength(1)
  })
})

describe('push-abonelikleri erişimi', () => {
  it('is closed to anonymous API access', async () => {
    await pushKaydet(abonelik(), 'tr', ['yazilar'])
    await expect(payload.find({ collection: 'push-abonelikleri', overrideAccess: false })).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'push-abonelikleri',
        overrideAccess: false,
        data: { endpoint: 'https://fcm.googleapis.com/x', p256dh: 'a', auth: 'b', dil: 'tr', konular: ['yazilar'] },
      }),
    ).rejects.toThrow()
  })
})
