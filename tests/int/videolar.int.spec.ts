// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { anasayfaVideosu, bolumAdi, seriVideolari, toVideolar, type VideoItem } from '@/components/videolar'
import config from '@/payload.config'
import { seed } from '@/seed'
import type { UiMetinleri } from '@/payload-types'

const dbName = () => new URL(process.env.DATABASE_URL ?? 'postgres://x/none').pathname.replace(/^\//, '')

const item = (o: Partial<VideoItem>): VideoItem => ({
  id: 1,
  baslik: 'B',
  altBaslik: null,
  youtubeId: 'aLry4uypqxs',
  kategoriId: null,
  kategori: null,
  seri: null,
  bolum: null,
  dersNo: null,
  sure: null,
  tarih: null,
  kanal: null,
  aciklama: null,
  kapak: 'x',
  guncellendi: '2026-01-01T00:00:00.000Z',
  anasayfada: false,
  ...o,
})

describe('video helpers', () => {
  it('picks the most recently updated homepage video', () => {
    const list = [
      item({ id: 1, anasayfada: true, guncellendi: '2026-01-01T00:00:00.000Z' }),
      item({ id: 2, anasayfada: true, guncellendi: '2026-03-01T00:00:00.000Z' }),
      item({ id: 3, guncellendi: '2026-05-01T00:00:00.000Z' }),
    ]
    expect(anasayfaVideosu(list)?.id).toBe(2)
    expect(anasayfaVideosu([item({})])).toBeNull()
  })

  it('lists series episodes by lesson number, only when there are two or more', () => {
    const a = item({ id: 1, seri: 'Ta’lik meşki', bolum: 2, baslik: 'Ta’lik meşki · Elif ve Be' })
    const b = item({ id: 2, seri: 'Ta’lik meşki', bolum: 1 })
    const c = item({ id: 3, seri: 'Sülüs meşki', bolum: 1 })
    expect(seriVideolari([a, b, c], a).map((x) => x.id)).toEqual([2, 1])
    expect(seriVideolari([a, b, c], c)).toEqual([])
    expect(bolumAdi(a)).toBe('Elif ve Be')
  })

  it('maps docs to plain items, skipping invalid ids and formatting the date and lesson number', () => {
    const ui = { dersNo: '{n}. ders' } as UiMetinleri
    const base = { updatedAt: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z' }
    const out = toVideolar(
      [
        { id: 1, baslik: 'A', youtube: 'https://youtu.be/aLry4uypqxs', seri: 'S', bolum: 3, tarih: '2025-10-01T00:00:00.000Z', ...base },
        { id: 2, baslik: 'Bad', youtube: 'nope', ...base },
      ],
      ui,
      'tr',
    )
    expect(out).toHaveLength(1)
    expect(out[0].dersNo).toBe('3. ders')
    expect(out[0].tarih).toBe('Ekim 2025')
    expect(out[0].kapak).toBe('https://i.ytimg.com/vi/aLry4uypqxs/hqdefault.jpg')
  })
})

describe('videolar seed', () => {
  let payload: Payload
  beforeAll(async () => {
    if (!dbName().endsWith('_test')) throw new Error(`Refusing to run on "${dbName()}" (must end with _test)`)
    payload = await getPayload({ config })
  }, 60_000)

  afterAll(async () => {
    if (dbName().endsWith('_test') && payload) {
      for (const collection of ['videolar', 'video-kategorileri', 'yazilar', 'yazi-kategorileri', 'dersler', 'eserler', 'kitaplar', 'eser-turleri', 'yazi-turleri', 'media', 'users'] as const) {
        await payload.delete({ collection, where: { id: { exists: true } } })
      }
    }
  }, 60_000)

  it('seeds three categories and the real videos, idempotently', async () => {
    await seed(payload)
    await seed(payload)
    expect((await payload.count({ collection: 'video-kategorileri' })).totalDocs).toBe(3)
    const { docs } = await payload.find({ collection: 'videolar', locale: 'tr', depth: 1, sort: 'createdAt' })
    expect(docs).toHaveLength(3)
    expect(docs[0]).toMatchObject({ baslik: 'Affetmenin Hafifliği', youtube: 'aLry4uypqxs', kanal: 'TRT 2', sure: '25:29', anasayfada: true })
    expect((docs[0].kategori as { ad: string }).ad).toBe('Program')
    // Panelde değiştirilen kapak seed'de de var; kapaksız video YouTube kapağını kullanır.
    expect((docs[0].kapak as { filename: string }).filename).toBe('Affetmenin Hafifliği.png'.normalize('NFD'))
    expect(docs.find((d) => d.youtube === 'LzfHw8Da_D8')?.kapak ?? null).toBeNull()
    expect(docs.filter((d) => d.anasayfada)).toHaveLength(1)
  }, 180_000)

  it('rejects an invalid YouTube link', async () => {
    await expect(
      payload.create({ collection: 'videolar', data: { baslik: 'X', youtube: 'https://example.com' }, locale: 'tr' }),
    ).rejects.toThrow()
  })
})
