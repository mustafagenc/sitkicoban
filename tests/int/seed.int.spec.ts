// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { readDesign } from '@/seed/read-design'
import { seed } from '@/seed'
import { SEED_DERSLER } from '@/seed/dersler'

let payload: Payload

const dbName = () => new URL(process.env.DATABASE_URL ?? 'postgres://x/none').pathname.replace(/^\//, '')

async function wipe() {
  for (const collection of ['yazilar', 'yazi-kategorileri', 'dersler', 'eserler', 'kitaplar', 'eser-turleri', 'yazi-turleri', 'media', 'users'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }
}

describe('readDesign', () => {
  it('reads the 13 works', () => {
    const { eserler } = readDesign()
    expect(eserler.length).toBe(13)
    expect(eserler[0].t).toBe('Hilye-i Şerif')
    expect(eserler[0].yazi).toEqual(['Sülüs', 'Nesih'])
  })

  it('reads the books', () => {
    const { kitaplar } = readDesign()
    const b = kitaplar.find((k) => k.t === "Mesnevî'de Geçen Hikâyeler")
    expect(b?.img).toBe('kitap-mesnevi.jpg')
  })
})

describe('seed', () => {
  beforeAll(async () => {
    // Safety: this suite wipes content tables, so it only ever runs on a *_test database.
    if (!dbName().endsWith('_test')) {
      throw new Error(`Refusing to run seed test against database "${dbName()}" (name must end with _test)`)
    }
    payload = await getPayload({ config })
    await wipe()
  }, 60_000)

  afterAll(async () => {
    if (dbName().endsWith('_test') && payload) await wipe()
  }, 60_000)

  it('is idempotent and fills the model', async () => {
    const design = readDesign()
    const first = await seed(payload)
    const second = await seed(payload)
    expect(first).toEqual({ eserler: 13, kitaplar: design.kitaplar.length })
    expect(second).toEqual(first)
    expect((await payload.count({ collection: 'eserler' })).totalDocs).toBe(13)
    expect((await payload.count({ collection: 'kitaplar' })).totalDocs).toBe(design.kitaplar.length)
    expect((await payload.count({ collection: 'users' })).totalDocs).toBe(1)
    // works, covers and lesson posters share images: one media doc per distinct file.
    const files = new Set([...design.eserler.map((e) => e.f), ...design.kitaplar.filter((k) => k.img).map((k) => k.img), ...SEED_DERSLER.flatMap((d) => (d.afis ? [d.afis.file] : []))])
    expect((await payload.count({ collection: 'media' })).totalDocs).toBe(files.size)
  }, 120_000)

  it('keeps counts when a work is edited and seed re-runs', async () => {
    const { docs } = await payload.find({ collection: 'eserler', where: { slug: { equals: 'subhanellah' } }, locale: 'tr' })
    expect(docs.length).toBe(1)
    await payload.update({
      collection: 'eserler',
      id: docs[0].id,
      data: { aciklama: 'Elle değiştirildi' },
      locale: 'tr',
      context: { disableRevalidate: true },
    })
    await seed(payload)
    expect((await payload.count({ collection: 'eserler' })).totalDocs).toBe(13)
  }, 120_000)

  it('maps fields: yil and tur', async () => {
    const { docs } = await payload.find({
      collection: 'eserler',
      where: { slug: { equals: 'subhanellah' } },
      depth: 1,
      locale: 'tr',
    })
    expect(docs[0].yil).toBe('1442')
    const tur = docs[0].tur as { ad: string }
    expect(tur.ad).toBe('Levha')
  })

  it('writes Arabic UI strings, not Turkish', async () => {
    const ar = await payload.findGlobal({ slug: 'ui-metinleri', locale: 'ar', fallbackLocale: false })
    const tr = await payload.findGlobal({ slug: 'ui-metinleri', locale: 'tr' })
    expect(tr.navEserler).toBe('Eserler')
    expect(ar.navEserler).toBe('الأعمال')
    expect(ar.navEserler).not.toBe(tr.navEserler)
  })
})
