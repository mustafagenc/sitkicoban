// @vitest-environment node
import sharp from 'sharp'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { mediaUrl } from '@/lib/media'

let payload: Payload

async function makeMedia(width: number, height: number, name: string) {
  const buffer = await sharp({
    create: { width, height, channels: 3, background: { r: 120, g: 80, b: 40 } },
  })
    .png()
    .toBuffer()
  return payload.create({
    collection: 'media',
    data: { alt: name },
    file: { data: buffer, mimetype: 'image/png', name: `${name}-${Date.now()}.png`, size: buffer.length },
  })
}

describe('content model', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
    // Schema is pushed on boot; start each run from empty content tables.
    for (const collection of ['eserler', 'media'] as const) {
      await payload.delete({ collection, where: { id: { exists: true } } })
    }
  })

  afterAll(async () => {
    for (const collection of ['eserler', 'media'] as const) {
      await payload.delete({ collection, where: { id: { exists: true } } })
    }
  })

  it('gives colliding titles unique slugs', async () => {
    const a = await payload.create({ collection: 'eserler', data: { baslik: 'Besmele' } })
    const b = await payload.create({ collection: 'eserler', data: { baslik: 'Besmele' } })
    expect(a.slug).toBe('besmele')
    expect(b.slug).toBe('besmele-2')
  })

  it('computes oran from the image', async () => {
    const m = await makeMedia(300, 400, 'oran')
    const e = await payload.create({
      collection: 'eserler',
      data: { baslik: 'Oran Testi', gorsel: m.id },
    })
    expect(e.oran).toBe(0.75)
  })

  it('falls back to Turkish title for other locales', async () => {
    const e = await payload.create({
      collection: 'eserler',
      locale: 'tr',
      data: { baslik: 'Sadece Türkçe' },
    })
    const en = await payload.findByID({ collection: 'eserler', id: e.id, locale: 'en' })
    expect(en.baslik).toBe('Sadece Türkçe')
  })

  it('mediaUrl uses /media/<filename> without a Blob token', () => {
    const saved = process.env.BLOB_READ_WRITE_TOKEN
    delete process.env.BLOB_READ_WRITE_TOKEN
    try {
      expect(mediaUrl({ filename: 'a.jpg' } as never)).toBe('/media/a.jpg')
      expect(mediaUrl(null)).toBeNull()
    } finally {
      if (saved) process.env.BLOB_READ_WRITE_TOKEN = saved
    }
  })

  it('mediaUrl never returns the access-controlled /api/media/file route, even with a Blob token', () => {
    const saved = process.env.BLOB_READ_WRITE_TOKEN
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_test_x'
    try {
      // Blob açıkken yerelde kalmış eski kayıt: diskteki dosyaya gider
      expect(mediaUrl({ filename: 'a.jpg', url: '/api/media/file/a.jpg' } as never)).toBe('/media/a.jpg')
      // Blob'a yüklenmiş kayıt: doğrudan Blob adresi
      const blob = 'https://abc.public.blob.vercel-storage.com/a.jpg'
      expect(mediaUrl({ filename: 'a.jpg', url: blob } as never)).toBe(blob)
    } finally {
      if (saved) process.env.BLOB_READ_WRITE_TOKEN = saved
      else delete process.env.BLOB_READ_WRITE_TOKEN
    }
  })
})
