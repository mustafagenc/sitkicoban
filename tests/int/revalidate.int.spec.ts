// @vitest-environment node
import sharp from 'sharp'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import { revalidateTag } from 'next/cache'
import config from '@/payload.config'

let payload: Payload
const fetchMock = vi.fn(async () => new Response('ok'))
const mediaIds: (number | string)[] = []
const eserIds: (number | string)[] = []

async function makeMedia() {
  const buffer = await sharp({
    create: { width: 40, height: 40, channels: 3, background: { r: 1, g: 2, b: 3 } },
  })
    .png()
    .toBuffer()
  const m = await payload.create({
    collection: 'media',
    data: { alt: 'rv' },
    file: { data: buffer, mimetype: 'image/png', name: `rv-${Date.now()}.png`, size: buffer.length },
    context: { disableRevalidate: true },
  })
  mediaIds.push(m.id)
  return m
}

const warmCalls = () =>
  (fetchMock.mock.calls as unknown as [string][]).filter((c) => String(c[0]).startsWith('http://localhost:3999'))
const tagCalls = () => vi.mocked(revalidateTag).mock.calls.map((c) => c[0])

describe('revalidation hooks', () => {
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3999'
    vi.stubGlobal('fetch', fetchMock)
    payload = await getPayload({ config })
  })

  beforeEach(() => {
    vi.mocked(revalidateTag).mockClear()
    fetchMock.mockClear()
  })

  afterAll(async () => {
    for (const id of eserIds) await payload.delete({ collection: 'eserler', id, context: { disableRevalidate: true } }).catch(() => {})
    for (const id of mediaIds) await payload.delete({ collection: 'media', id, context: { disableRevalidate: true } }).catch(() => {})
    vi.unstubAllGlobals()
  })

  it('revalidates and warms on update and delete, not when disabled', async () => {
    const m = await makeMedia()
    const e = await payload.create({
      collection: 'eserler',
      data: { baslik: 'Revalidate Testi', gorsel: m.id },
      context: { disableRevalidate: true },
    })
    eserIds.push(e.id)
    expect(vi.mocked(revalidateTag)).not.toHaveBeenCalled()
    expect(warmCalls()).toHaveLength(0)

    await payload.update({ collection: 'eserler', id: e.id, data: { yil: '2024' } })
    expect(tagCalls()).toEqual(expect.arrayContaining(['eserler', 'anasayfa']))
    expect(warmCalls()).toHaveLength(6)

    vi.mocked(revalidateTag).mockClear()
    fetchMock.mockClear()
    await payload.delete({ collection: 'eserler', id: e.id })
    expect(tagCalls()).toEqual(expect.arrayContaining(['eserler', 'anasayfa']))
    expect(warmCalls()).toHaveLength(6)
  })
})
