// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findYazi, findYaziKategorileri, findYaziSluglari, findYazilar } from '@/lib/data'
import config from '@/payload.config'
import { seed } from '@/seed'

const dbName = () => new URL(process.env.DATABASE_URL ?? 'postgres://x/none').pathname.replace(/^\//, '')
const SLUGS = [
  'zikir-fikir-dua',
  'ihlasin-ilk-ayeti-ve-uc-mertebe',
  'herkes-ona-muhtac',
  'soyleyip-de-yapmayanlar',
  'inciten-kirip-doken-var-ya',
]
const FEATURED = SLUGS[0]

let payload: Payload

async function wipe() {
  for (const collection of ['yazilar', 'yazi-kategorileri', 'dersler', 'eserler', 'kitaplar', 'eser-turleri', 'yazi-turleri', 'media', 'users'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }
}

describe('yazilar', () => {
  beforeAll(async () => {
    if (!dbName().endsWith('_test')) throw new Error(`Refusing to run on "${dbName()}" (must end with _test)`)
    payload = await getPayload({ config })
    await wipe()
    await seed(payload)
    await seed(payload) // idempotent
  }, 240_000)

  afterAll(async () => {
    if (dbName().endsWith('_test') && payload) await wipe()
  }, 60_000)

  it('seeds 5 posts, 3 categories, all 5 published', async () => {
    expect((await payload.count({ collection: 'yazilar' })).totalDocs).toBe(5)
    expect((await payload.count({ collection: 'yazi-kategorileri' })).totalDocs).toBe(3)
    expect((await payload.count({ collection: 'yazilar', where: { yayinda: { equals: true } } })).totalDocs).toBe(5)
  })

  it('maps dates, categories, cover images and computes reading time from body', async () => {
    const { docs } = await payload.find({ collection: 'yazilar', where: { slug: { equals: FEATURED } }, locale: 'tr', depth: 1 })
    expect(docs[0].tarih?.slice(0, 10)).toBe('2025-03-01')
    expect(docs[0].okumaSuresiOtomatik).toBe(true)
    expect(docs[0].okumaSuresi).toBeGreaterThanOrEqual(5)
    expect((docs[0].kategori as { ad: string }).ad).toBe('Tefsir')
    expect((docs[0].kapak as { filename: string }).filename).toBe('yazi-zikir-fikir-dua.jpg')
    expect(docs[0].kaynaklar?.length).toBeGreaterThan(5)
  })

  it('getters return published posts sorted by tarih descending', async () => {
    const list = await findYazilar(payload, 'tr')
    expect(list.map((y) => y.slug)).toEqual(SLUGS)
    expect(await findYaziSluglari(payload)).toEqual(SLUGS)
    expect(await findYazi(payload, 'yok', 'tr')).toBeNull()
    const y = await findYazi(payload, FEATURED, 'en')
    expect(y?.baslik).toBe('Zikir, Fikir, Dua') // falls back to tr
    expect((await findYaziKategorileri(payload, 'tr')).map((k) => k.ad)).toEqual(['Tefsir', 'Sanat', 'Edebiyat'])
  })

  it('hides unpublished posts from getters', async () => {
    const { docs } = await payload.find({ collection: 'yazilar', where: { slug: { equals: 'herkes-ona-muhtac' } }, depth: 0 })
    await payload.update({ collection: 'yazilar', id: docs[0].id, data: { yayinda: false }, locale: 'tr', context: { disableRevalidate: true } })
    try {
      expect(await findYazi(payload, 'herkes-ona-muhtac', 'tr')).toBeNull()
      expect((await findYazilar(payload, 'tr')).map((y) => y.slug)).toEqual(SLUGS.filter((s) => s !== 'herkes-ona-muhtac'))
    } finally {
      await payload.update({ collection: 'yazilar', id: docs[0].id, data: { yayinda: true }, locale: 'tr', context: { disableRevalidate: true } })
    }
  })

  it('requires a body before publishing', async () => {
    const { docs } = await payload.find({ collection: 'yazilar', where: { slug: { equals: 'zikir-fikir-dua' } }, depth: 0 })
    await expect(
      payload.update({ collection: 'yazilar', id: docs[0].id, data: { yayinda: true, govde: null }, locale: 'tr', context: { disableRevalidate: true } }),
    ).rejects.toThrow()
  })
})
