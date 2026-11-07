// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findYazi, findYaziKategorileri, findYaziSluglari, findYazilar } from '@/lib/data'
import config from '@/payload.config'
import { seed } from '@/seed'

const dbName = () => new URL(process.env.DATABASE_URL ?? 'postgres://x/none').pathname.replace(/^\//, '')
const FEATURED = 'ihlasin-ilk-ayeti-ve-uc-mertebe'

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

  it('seeds 7 posts, 3 categories, exactly 1 published', async () => {
    expect((await payload.count({ collection: 'yazilar' })).totalDocs).toBe(7)
    expect((await payload.count({ collection: 'yazi-kategorileri' })).totalDocs).toBe(3)
    expect((await payload.count({ collection: 'yazilar', where: { yayinda: { equals: true } } })).totalDocs).toBe(1)
  })

  it('maps design dates and keeps design minutes for drafts', async () => {
    const { docs } = await payload.find({ collection: 'yazilar', where: { slug: { equals: 'herkes-ona-muhtac' } }, locale: 'tr', depth: 1 })
    expect(docs[0].tarih?.slice(0, 10)).toBe('2025-02-01')
    expect(docs[0].okumaSuresi).toBe(7)
    expect((docs[0].kategori as { ad: string }).ad).toBe('Tefsir')
  })

  it('computes reading time for the published sample body', async () => {
    const { docs } = await payload.find({ collection: 'yazilar', where: { slug: { equals: FEATURED } }, locale: 'tr' })
    expect(docs[0].okumaSuresiOtomatik).toBe(true)
    expect(docs[0].okumaSuresi).toBeGreaterThanOrEqual(1)
    expect(docs[0].kaynaklar?.length).toBe(3)
  })

  it('getters return published posts only', async () => {
    const list = await findYazilar(payload, 'tr')
    expect(list.map((y) => y.slug)).toEqual([FEATURED])
    expect(await findYaziSluglari(payload)).toEqual([FEATURED])
    expect(await findYazi(payload, 'herkes-ona-muhtac', 'tr')).toBeNull()
    expect(await findYazi(payload, 'yok', 'tr')).toBeNull()
    const y = await findYazi(payload, FEATURED, 'en')
    expect(y?.baslik).toBe("İhlâs'ın İlk Âyeti ve Üç Mertebe") // falls back to tr
    expect((await findYaziKategorileri(payload, 'tr')).map((k) => k.ad)).toEqual(['Tefsir', 'Sanat', 'Edebiyat'])
  })

  it('sorts by tarih descending', async () => {
    const { docs } = await payload.find({ collection: 'yazilar', where: { slug: { equals: 'herkes-ona-muhtac' } }, depth: 0 })
    const featured = await payload.find({ collection: 'yazilar', where: { slug: { equals: FEATURED } }, depth: 0, locale: 'tr' })
    const govde = featured.docs[0].govde
    await payload.update({ collection: 'yazilar', id: docs[0].id, data: { yayinda: true, govde }, locale: 'tr', context: { disableRevalidate: true } })
    try {
      expect((await findYazilar(payload, 'tr')).map((y) => y.slug)).toEqual([FEATURED, 'herkes-ona-muhtac'])
    } finally {
      await payload.update({ collection: 'yazilar', id: docs[0].id, data: { yayinda: false, govde: null }, locale: 'tr', context: { disableRevalidate: true } })
    }
  })

  it('requires a body before publishing', async () => {
    const { docs } = await payload.find({ collection: 'yazilar', where: { slug: { equals: 'zikir-fikir-dua' } }, depth: 0 })
    await expect(
      payload.update({ collection: 'yazilar', id: docs[0].id, data: { yayinda: true }, context: { disableRevalidate: true } }),
    ).rejects.toThrow()
  })
})
