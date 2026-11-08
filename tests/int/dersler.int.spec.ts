// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { aktifDersler } from '@/components/dersler'
import config from '@/payload.config'
import { seed } from '@/seed'

const dbName = () => new URL(process.env.DATABASE_URL ?? 'postgres://x/none').pathname.replace(/^\//, '')

describe('aktifDersler', () => {
  it('keeps lessons whose bitis is today or later', () => {
    const list = [{ bitis: '2026-01-01' }, { bitis: '2026-11-07' }]
    expect(aktifDersler(list, '2026-11-07')).toEqual([{ bitis: '2026-11-07' }])
  })

  it('returns [] for empty input', () => {
    expect(aktifDersler([], '2026-11-07')).toEqual([])
  })
})

describe('dersler seed', () => {
  let payload: Payload
  beforeAll(async () => {
    if (!dbName().endsWith('_test')) throw new Error(`Refusing to run on "${dbName()}" (must end with _test)`)
    payload = await getPayload({ config })
  }, 60_000)

  afterAll(async () => {
    if (dbName().endsWith('_test') && payload) {
      for (const collection of ['yazilar', 'yazi-kategorileri', 'dersler', 'eserler', 'kitaplar', 'eser-turleri', 'yazi-turleri', 'media', 'users'] as const) {
        await payload.delete({ collection, where: { id: { exists: true } } })
      }
    }
  }, 60_000)

  it('seeds the two lessons, the İMÜ one with kontenjan and afis', async () => {
    await seed(payload)
    await seed(payload)
    expect((await payload.count({ collection: 'dersler' })).totalDocs).toBe(2)
    const { docs } = await payload.find({ collection: 'dersler', locale: 'tr', depth: 1, sort: 'sira' })
    const imu = docs.find((d) => d.kurum === 'İstanbul Medeniyet Üniversitesi')!
    expect(imu.kontenjan).toBe('25 kişi')
    expect(typeof imu.afis).toBe('object')
    expect(imu.bitis.slice(0, 10)).toBe('2027-01-31')
    const cam = docs.find((d) => d.kurum.startsWith('Çamlıca'))!
    expect(cam.afis).toBeFalsy()
  }, 180_000)
})
