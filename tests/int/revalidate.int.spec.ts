// @vitest-environment node
import sharp from 'sharp'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const afterCallbacks: Array<() => void> = []
vi.mock('next/server', () => ({ after: (fn: () => void) => void afterCallbacks.push(fn) }))
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import { revalidateTag } from 'next/cache'
import config from '@/payload.config'
import { revalidateHooks } from '@/lib/cache/revalidate'

let payload: Payload
const prevSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
const runAfter = () => {
  while (afterCallbacks.length) afterCallbacks.shift()!()
}
const fetchMock = vi.fn(async () => new Response('ok'))
const mediaIds: (number | string)[] = []
const eserIds: (number | string)[] = []
const yaziIds: (number | string)[] = []
const kategoriIds: (number | string)[] = []
const kitapIds: (number | string)[] = []

const BODY = {
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        children: [{ type: 'text', version: 1, text: 'Gövde', format: 0, detail: 0, mode: 'normal', style: '' }],
      },
    ],
  },
} as never

async function makeYazi(slug: string, yayinda: boolean) {
  const y = await payload.create({
    collection: 'yazilar',
    data: { baslik: `Yazı ${slug}`, slug, ozet: 'Özet', govde: BODY, yayinda },
    context: { disableRevalidate: true },
  })
  yaziIds.push(y.id)
  return y
}
const detailUrls = (slug: string) =>
  [`/yazilar/${slug}`, `/en/writings/${slug}`, `/ar/writings/${slug}`].map((p) => `http://localhost:3999${p}`)

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
  (fetchMock.mock.calls as unknown as [string][])
    .map((c) => String(c[0]))
    .filter((u) => u.startsWith('http://localhost:3999'))
const EXPECTED_URLS = ['/', '/en', '/ar', '/eserler', '/en/works', '/ar/works', '/hayati', '/en/biography', '/ar/biography']
  .map((p) => `http://localhost:3999${p === '/' ? '/' : p}`)
  .sort()
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
    afterCallbacks.length = 0
  })

  afterAll(async () => {
    for (const id of yaziIds) await payload.delete({ collection: 'yazilar', id, context: { disableRevalidate: true } }).catch(() => {})
    for (const id of kategoriIds) await payload.delete({ collection: 'yazi-kategorileri', id, context: { disableRevalidate: true } }).catch(() => {})
    for (const id of kitapIds) await payload.delete({ collection: 'kitaplar', id, context: { disableRevalidate: true } }).catch(() => {})
    for (const id of eserIds) await payload.delete({ collection: 'eserler', id, context: { disableRevalidate: true } }).catch(() => {})
    for (const id of mediaIds) await payload.delete({ collection: 'media', id, context: { disableRevalidate: true } }).catch(() => {})
    vi.unstubAllGlobals()
    if (prevSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = prevSiteUrl
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
    expect(tagCalls().sort()).toEqual(['anasayfa', 'eserler'])
    expect(tagCalls()).not.toContain('kitaplar')
    expect(warmCalls()).toHaveLength(0) // deferred until after the response
    runAfter()
    expect(warmCalls().sort()).toEqual(EXPECTED_URLS)

    vi.mocked(revalidateTag).mockClear()
    fetchMock.mockClear()
    await payload.delete({ collection: 'eserler', id: e.id })
    expect(tagCalls().sort()).toEqual(['anasayfa', 'eserler'])
    expect(tagCalls()).not.toContain('kitaplar')
    expect(warmCalls()).toHaveLength(0) // deferred until after the response
    runAfter()
    expect(warmCalls().sort()).toEqual(EXPECTED_URLS)
  })

  // The yazilar collection arrives in a later task; exercise its hook directly.
  it('warms yazi detail paths for old and new slug on a slug change', async () => {
    const hooks = revalidateHooks('yazilar')
    await hooks.afterChange({
      doc: { slug: 'b' },
      previousDoc: { slug: 'a' },
      context: {},
    } as unknown as Parameters<typeof hooks.afterChange>[0])
    runAfter()
    const urls = warmCalls()
    for (const p of ['/yazilar/a', '/yazilar/b', '/en/writings/b', '/ar/writings/a'])
      expect(urls).toContain(`http://localhost:3999${p}`)
    expect(tagCalls()).toEqual(['yazilar'])
  })

  it('warms published yazi detail pages on media and yazi-kategorileri saves', async () => {
    await makeYazi('rv-yayinda', true)
    await makeYazi('rv-taslak', false)
    const m = await makeMedia()
    const k = await payload.create({ collection: 'yazi-kategorileri', data: { ad: 'RV' }, context: { disableRevalidate: true } })
    kategoriIds.push(k.id)

    for (const save of [
      () => payload.update({ collection: 'media', id: m.id, data: { alt: 'rv2' } }),
      () => payload.update({ collection: 'yazi-kategorileri', id: k.id, data: { ad: 'RV2' } }),
    ]) {
      fetchMock.mockClear()
      afterCallbacks.length = 0
      await save()
      runAfter()
      const urls = warmCalls()
      for (const u of detailUrls('rv-yayinda')) expect(urls).toContain(u)
      for (const u of detailUrls('rv-taslak')) expect(urls).not.toContain(u)
    }
  })

  it('warms published yazi detail pages on kitaplar saves (related books are rendered)', async () => {
    await makeYazi('rv-kitapli', true)
    await makeYazi('rv-kitapsiz-taslak', false)
    const k = await payload.create({
      collection: 'kitaplar',
      data: { baslik: 'RV Kitap' },
      context: { disableRevalidate: true },
    })
    kitapIds.push(k.id)
    await payload.update({ collection: 'kitaplar', id: k.id, data: { yil: '2025' } })
    expect(tagCalls().sort()).toEqual(['anasayfa', 'kitaplar'])
    runAfter()
    const urls = warmCalls()
    for (const u of detailUrls('rv-kitapli')) expect(urls).toContain(u)
    for (const u of detailUrls('rv-kitapsiz-taslak')) expect(urls).not.toContain(u)
    for (const p of ['/kitaplar', '/yazilar']) expect(urls).toContain(`http://localhost:3999${p}`)
  })

  it('does not warm yazi detail pages for unrelated sources', async () => {
    await makeYazi('rv-ilgisiz', true)
    const e = await payload.create({ collection: 'eserler', data: { baslik: 'RV ilgisiz', gorsel: (await makeMedia()).id }, context: { disableRevalidate: true } })
    eserIds.push(e.id)
    await payload.update({ collection: 'eserler', id: e.id, data: { yil: '2025' } })
    runAfter()
    expect(warmCalls().sort()).toEqual(EXPECTED_URLS)
  })

  it('warms a deleted yazi detail paths', async () => {
    const y = await makeYazi('rv-silinen', true)
    await payload.delete({ collection: 'yazilar', id: y.id })
    expect(tagCalls()).toEqual(['yazilar'])
    runAfter()
    const urls = warmCalls()
    for (const u of detailUrls('rv-silinen')) expect(urls).toContain(u)
    for (const p of ['/yazilar', '/en/writings', '/']) expect(urls).toContain(`http://localhost:3999${p}`)
  })
})
