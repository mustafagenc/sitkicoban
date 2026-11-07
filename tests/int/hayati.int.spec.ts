// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findHayati, findHocalar } from '@/lib/data'
import { sectionIds } from '@/lib/richtext'
import config from '@/payload.config'
import { seed } from '@/seed'

const dbName = () => new URL(process.env.DATABASE_URL ?? 'postgres://x/none').pathname.replace(/^\//, '')

let payload: Payload

async function wipe() {
  for (const collection of ['hocalar', 'yazilar', 'yazi-kategorileri', 'dersler', 'eserler', 'kitaplar', 'eser-turleri', 'yazi-turleri', 'media', 'users'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }
}

describe('sectionIds', () => {
  it('slugifies titles like headings do, and numbers duplicates', () => {
    expect(sectionIds(['İlim yolculuğu', 'Hat yolculuğu', 'Hat yolculuğu', ''])).toEqual([
      'ilim-yolculugu',
      'hat-yolculugu',
      'hat-yolculugu-2',
      'bolum',
    ])
  })
})

describe('hayati seed', () => {
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

  it('seeds the five sections in design order', async () => {
    const h = await findHayati(payload, 'tr')
    expect(h.bolumler?.map((b) => b.baslik)).toEqual([
      'İlim yolculuğu',
      'Hat yolculuğu',
      'Sanat anlayışı',
      'Kalemden dökülenler',
      'Muallimlik',
    ])
    expect(h.bolumler?.every((b) => b.govde?.root)).toBe(true)
  })

  it('seeds the info box, intro, portrait and home summary', async () => {
    const h = await findHayati(payload, 'tr')
    expect(h.kunye?.map((k) => k.etiket)).toEqual(['Doğum', 'Eğitim', 'İcazet', 'Görev'])
    expect(h.girisCumlesi).toBeTruthy()
    expect(h.anasayfaOzet?.root).toBeTruthy()
    expect(h.portre && typeof h.portre === 'object' && h.portre.filename).toBe('sitki-coban.jpg')
  })

  it('seeds two teachers with signatures, in order', async () => {
    expect((await payload.count({ collection: 'hocalar' })).totalDocs).toBe(2)
    const hocalar = await findHocalar(payload, 'tr')
    expect(hocalar.map((x) => x.ad)).toEqual(['Hasan Çelebi', 'Abdulhadi Erol Dönmez'])
    expect(hocalar.map((x) => typeof x.imza === 'object' && x.imza?.filename)).toEqual([
      'imza-hasan-celebi.png',
      'imza-erol-donmez.png',
    ])
  })

  it('has unique, ASCII table-of-contents ids for the seeded titles', async () => {
    const h = await findHayati(payload, 'tr')
    const ids = sectionIds((h.bolumler ?? []).map((b) => b.baslik))
    expect(new Set(ids).size).toBe(5)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/)
  })

  it('falls back to Turkish content in other locales', async () => {
    const h = await findHayati(payload, 'en')
    expect(h.bolumler?.[0].baslik).toBe('İlim yolculuğu')
  })
})
