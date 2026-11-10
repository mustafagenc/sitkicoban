// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  ip: '203.0.113.7',
  send: vi.fn(),
  after: [] as Array<() => void>,
}))

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': `${h.ip}, 10.0.0.1` }),
}))
vi.mock('next/server', () => ({ after: (fn: () => void) => void h.after.push(fn) }))
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))
// Yorum geldiğinde e-posta gönderilmez: Resend hiç çağrılmamalı.
vi.mock('resend', () => ({ Resend: class { emails = { send: h.send } } }))

import { revalidateTag } from 'next/cache'
import { yorumGonder } from '@/app/(frontend)/[locale]/yazilar/[slug]/actions'
import { YORUM_METIN_KEYS } from '@/globals/YorumMetinleri'
import { PAGES_BY_TAG, YAZI_DETAIL_TAGS, pathsForChange } from '@/lib/cache/revalidate'
import { TAGS_BY_SOURCE } from '@/lib/cache/tags'
import { findYorumlar, getYorumlar, getYorumMetinleri } from '@/lib/data'
import { YORUM_LIMITLERI, validateYorum, yorumMetinleriVar } from '@/lib/yorum'
import config from '@/payload.config'
import { YORUM_METINLERI } from '@/seed/yorum-metinleri'

let payload: Payload
const yaziIds: number[] = []
const ctx = { disableRevalidate: true }
const fetchMock = vi.fn(async () => new Response('ok'))
const prevSiteUrl = process.env.SITE_URL

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
    context: ctx,
  })
  yaziIds.push(y.id)
  return y
}

let seq = 0
const form = (o: Record<string, string> = {}) => {
  seq += 1
  const v: Record<string, string> = {
    yazi: 'yorum-yayinda',
    ad: 'Ayşe Okur',
    eposta: `okur${seq}@example.com`,
    metin: 'Güzel bir yazı.\nTeşekkürler, https://ornek.test',
    onay: 'on',
    website: '',
    t: String(Date.now() - 10_000),
    locale: 'tr',
    ...o,
  }
  const f = new FormData()
  for (const [k, val] of Object.entries(v)) f.append(k, val)
  return f
}

const yorumlar = async (yaziId: number) =>
  (await payload.find({ collection: 'yorumlar', where: { yazi: { equals: yaziId } }, depth: 0, pagination: false, sort: 'createdAt' })).docs

const warmCalls = () => (fetchMock.mock.calls as unknown as [string][]).map((c) => String(c[0]))
const runAfter = () => {
  while (h.after.length) h.after.shift()!()
}
const IDLE = { status: 'idle' } as const

describe('yorumlar', () => {
  let yayinda: { id: number; slug?: string | null }
  let taslak: { id: number }

  beforeAll(async () => {
    process.env.SITE_URL = 'http://localhost:3999'
    process.env.RESEND_API_KEY = 're_test'
    process.env.RESEND_FROM = 'Site <site@example.com>'
    vi.stubGlobal('fetch', fetchMock)
    payload = await getPayload({ config })
    await payload.delete({ collection: 'yorumlar', where: { id: { exists: true } }, context: ctx })
    for (const slug of ['yorum-yayinda', 'yorum-taslak']) {
      await payload.delete({ collection: 'yazilar', where: { slug: { equals: slug } }, context: ctx })
    }
    yayinda = await makeYazi('yorum-yayinda', true)
    taslak = await makeYazi('yorum-taslak', false)
    await payload.updateGlobal({ slug: 'yorum-metinleri', data: { metinler: { baslik: 'Yorumlar', formGonder: 'Gönder' } }, locale: 'tr', context: ctx })
  })

  beforeEach(async () => {
    h.send.mockReset()
    h.ip = `203.0.113.${Math.floor(Math.random() * 200) + 1}`
    vi.mocked(revalidateTag).mockClear()
    fetchMock.mockClear()
    h.after.length = 0
  })

  afterAll(async () => {
    await payload.delete({ collection: 'yorumlar', where: { id: { exists: true } }, context: ctx }).catch(() => {})
    for (const id of yaziIds) await payload.delete({ collection: 'yazilar', id, context: ctx }).catch(() => {})
    vi.unstubAllGlobals()
    if (prevSiteUrl === undefined) delete process.env.SITE_URL
    else process.env.SITE_URL = prevSiteUrl
  })

  describe('validateYorum', () => {
    const now = Date.now()
    it('treats honeypot and too-fast submissions as spam, missing time as invalid', () => {
      expect(validateYorum(form({ website: 'x' }), now)).toEqual({ ok: false, reason: 'spam' })
      expect(validateYorum(form({ t: String(now - 500) }), now)).toEqual({ ok: false, reason: 'spam' })
      expect(validateYorum(form({ t: '' }), now)).toEqual({ ok: false, reason: 'invalid' })
    })

    it('rejects bad fields', () => {
      for (const o of [
        { ad: '' } as Record<string, string>,
        { ad: 'a'.repeat(YORUM_LIMITLERI.ad + 1) },
        { eposta: 'gecersiz' },
        { metin: '   ' },
        { metin: 'a'.repeat(YORUM_LIMITLERI.metin + 1) },
        { onay: '' },
        { locale: 'de' },
        { yazi: '' },
      ]) {
        expect(validateYorum(form(o), now), JSON.stringify(o)).toEqual({ ok: false, reason: 'invalid' })
      }
    })

    it('trims and normalises valid input', () => {
      const r = validateYorum(form({ ad: '  Ali  ', eposta: ' ALI@Example.com ', locale: 'ar' }), now)
      expect(r.ok && r.data).toMatchObject({ ad: 'Ali', eposta: 'ali@example.com', dil: 'ar', yazi: 'yorum-yayinda' })
    })
  })

  describe('yorumGonder', () => {
    it('answers spam silently with ok and stores nothing', async () => {
      expect(await yorumGonder(IDLE, form({ website: 'http://spam' }))).toEqual({ status: 'ok' })
      expect(await yorumGonder(IDLE, form({ t: String(Date.now()) }))).toEqual({ status: 'ok' })
      expect(await yorumlar(yayinda.id)).toHaveLength(0)
    })

    it('returns error for invalid fields', async () => {
      expect(await yorumGonder(IDLE, form({ eposta: 'yok' }))).toEqual({ status: 'error' })
      expect(await yorumGonder(IDLE, form({ onay: '' }))).toEqual({ status: 'error' })
      expect(await yorumlar(yayinda.id)).toHaveLength(0)
    })

    it('returns error for an unpublished or missing yazı', async () => {
      expect(await yorumGonder(IDLE, form({ yazi: 'yorum-taslak' }))).toEqual({ status: 'error' })
      expect(await yorumGonder(IDLE, form({ yazi: 'boyle-bir-yazi-yok' }))).toEqual({ status: 'error' })
      expect(await yorumlar(taslak.id)).toHaveLength(0)
    })

    it('returns unavailable when the comment texts are not entered', async () => {
      await payload.updateGlobal({ slug: 'yorum-metinleri', data: { metinler: { baslik: '', formGonder: '' } }, locale: 'tr', context: ctx })
      try {
        expect(await yorumGonder(IDLE, form())).toEqual({ status: 'unavailable' })
      } finally {
        await payload.updateGlobal({ slug: 'yorum-metinleri', data: { metinler: { baslik: 'Yorumlar', formGonder: 'Gönder' } }, locale: 'tr', context: ctx })
      }
    })

    it('stores a pending comment with its language, sends no e-mail and warms nothing', async () => {
      const r = await yorumGonder(IDLE, form({ locale: 'en', ad: 'Reader', eposta: 'reader@example.com' }))
      expect(r).toEqual({ status: 'ok' })
      const docs = await yorumlar(yayinda.id)
      expect(docs).toHaveLength(1)
      expect(docs[0]).toMatchObject({ ad: 'Reader', eposta: 'reader@example.com', dil: 'en', durum: 'bekliyor' })
      expect(h.send).not.toHaveBeenCalled()
      runAfter()
      expect(vi.mocked(revalidateTag)).not.toHaveBeenCalled()
      expect(warmCalls()).toHaveLength(0)
    })

    it('rate-limits the same e-mail and the same IP', async () => {
      const eposta = 'cok@example.com'
      for (let i = 0; i < YORUM_LIMITLERI.onDakikada; i++) {
        h.ip = `198.51.100.${i + 1}`
        expect(await yorumGonder(IDLE, form({ eposta }))).toEqual({ status: 'ok' })
      }
      h.ip = '198.51.100.99'
      expect(await yorumGonder(IDLE, form({ eposta }))).toEqual({ status: 'limit' })

      h.ip = '192.0.2.50'
      for (let i = 0; i < YORUM_LIMITLERI.onDakikada; i++) {
        expect(await yorumGonder(IDLE, form())).toEqual({ status: 'ok' })
      }
      expect(await yorumGonder(IDLE, form())).toEqual({ status: 'limit' })
    })
  })

  describe('approved comments', () => {
    it('returns only approved comments of the yazı in every locale, oldest first, without e-mail', async () => {
      await payload.delete({ collection: 'yorumlar', where: { id: { exists: true } }, context: ctx })
      const mk = (ad: string, durum: 'bekliyor' | 'onaylandi' | 'reddedildi', dil: 'tr' | 'en' | 'ar') =>
        payload.create({
          collection: 'yorumlar',
          data: { yazi: yayinda.id, ad, eposta: `${ad}@gizli.example.com`, metin: `${ad} metni`, dil, durum },
          context: ctx,
        })
      await mk('birinci', 'onaylandi', 'en')
      await mk('bekleyen', 'bekliyor', 'tr')
      await mk('reddedilen', 'reddedildi', 'tr')
      const ucuncu = await mk('ikinci', 'onaylandi', 'ar')
      await payload.update({ collection: 'yorumlar', id: ucuncu.id, data: { cevap: 'Teşekkürler.' }, context: ctx })

      const list = await getYorumlar(yayinda.id)
      expect(list.map((y) => y.ad)).toEqual(['birinci', 'ikinci'])
      expect(list[1].cevap).toBe('Teşekkürler.')
      expect(list[1].dil).toBe('ar')
      const json = JSON.stringify(list)
      expect(json).not.toContain('gizli.example.com')
      expect(json).not.toContain('eposta')
      expect(Object.keys(list[0]).sort()).toEqual(['ad', 'cevap', 'createdAt', 'dil', 'id', 'metin'])
      // Önbelleksiz iç fonksiyon da aynı.
      expect((await findYorumlar(payload, yayinda.id)).map((y) => y.ad)).toEqual(['birinci', 'ikinci'])
      expect(getYorumlar.tags).toEqual(['yorumlar'])
    })

    it('stamps the reply date when a reply is written', async () => {
      const y = await payload.create({
        collection: 'yorumlar',
        data: { yazi: yayinda.id, ad: 'Cevaplı', eposta: 'c@example.com', metin: 'Soru?', dil: 'tr', durum: 'bekliyor' },
        context: ctx,
      })
      expect(y.durum).toBe('bekliyor')
      const v = await payload.create({
        collection: 'yorumlar',
        data: { yazi: yayinda.id, ad: 'Varsayılan', eposta: 'v@example.com', metin: 'x', dil: 'tr' } as never,
        context: ctx,
      })
      expect(v.durum).toBe('bekliyor') // varsayılan durum
      expect(y.cevapTarihi ?? null).toBeNull()
      const u = await payload.update({ collection: 'yorumlar', id: y.id, data: { cevap: 'Cevap.' }, context: ctx })
      expect(u.cevapTarihi).toBeTruthy()
    })
  })

  describe('yazı deletion', () => {
    it('deletes the comments of a deleted yazı instead of failing', async () => {
      const y = await makeYazi('yorum-silinecek', true)
      await payload.create({
        collection: 'yorumlar',
        data: { yazi: y.id, ad: 'Yetim', eposta: 'y@example.com', metin: 'x', dil: 'tr', durum: 'onaylandi' },
        context: ctx,
      })
      await payload.delete({ collection: 'yazilar', id: y.id, context: ctx })
      expect(await yorumlar(y.id)).toHaveLength(0)
    })
  })

  describe('revalidation', () => {
    const detail = ['/yazilar/yorum-yayinda', '/en/writings/yorum-yayinda', '/ar/writings/yorum-yayinda'].map(
      (p) => `http://localhost:3999${p}`,
    )

    it('approval invalidates only that yazı and warms its three detail pages; pending saves do nothing', async () => {
      const y = await payload.create({
        collection: 'yorumlar',
        data: { yazi: yayinda.id, ad: 'Onaylanacak', eposta: 'o@example.com', metin: 'Metin', dil: 'en', durum: 'bekliyor' },
      })
      runAfter()
      expect(vi.mocked(revalidateTag)).not.toHaveBeenCalled()
      expect(warmCalls()).toHaveLength(0)

      await payload.update({ collection: 'yorumlar', id: y.id, data: { metin: 'Düzeltildi' } })
      runAfter()
      expect(vi.mocked(revalidateTag)).not.toHaveBeenCalled()
      expect(warmCalls()).toHaveLength(0)

      await payload.update({ collection: 'yorumlar', id: y.id, data: { durum: 'onaylandi' } })
      expect(vi.mocked(revalidateTag).mock.calls.map((c) => c[0])).toEqual([`yorumlar:${yayinda.id}`])
      expect(warmCalls()).toHaveLength(0) // yanıttan sonra
      runAfter()
      expect(warmCalls().sort()).toEqual([...detail].sort())

      // Onaydan geri çekme ve silme de görünen çıktıyı değiştirir.
      vi.mocked(revalidateTag).mockClear()
      fetchMock.mockClear()
      await payload.update({ collection: 'yorumlar', id: y.id, data: { durum: 'reddedildi' } })
      runAfter()
      expect(warmCalls().sort()).toEqual([...detail].sort())

      fetchMock.mockClear()
      await payload.delete({ collection: 'yorumlar', id: y.id })
      runAfter()
      expect(warmCalls()).toHaveLength(0) // reddedilmiş yorumun silinmesi görünmez

      const z = await payload.create({
        collection: 'yorumlar',
        data: { yazi: yayinda.id, ad: 'Silinecek', eposta: 's@example.com', metin: 'Metin', dil: 'tr', durum: 'onaylandi' },
        context: ctx,
      })
      fetchMock.mockClear()
      await payload.delete({ collection: 'yorumlar', id: z.id })
      runAfter()
      expect(warmCalls().sort()).toEqual([...detail].sort())
    })

    it('respects disableRevalidate', async () => {
      await payload.create({
        collection: 'yorumlar',
        data: { yazi: yayinda.id, ad: 'Sessiz', eposta: 'q@example.com', metin: 'Metin', dil: 'tr', durum: 'onaylandi' },
        context: ctx,
      })
      runAfter()
      expect(vi.mocked(revalidateTag)).not.toHaveBeenCalled()
      expect(warmCalls()).toHaveLength(0)
    })

    it('maps the comment texts global to every published yazı detail page only', () => {
      expect(TAGS_BY_SOURCE['yorum-metinleri']).toEqual(['yorumMetinleri'])
      expect(TAGS_BY_SOURCE.yorumlar).toBeUndefined() // kendi kancası: yalnızca ilgili yazı
      expect(PAGES_BY_TAG.yorumlar).toEqual([])
      expect(PAGES_BY_TAG.yorumMetinleri).toEqual([])
      expect(YAZI_DETAIL_TAGS).toEqual(expect.arrayContaining(['yorumlar', 'yorumMetinleri']))
      expect(pathsForChange('yorum-metinleri', null, null, ['a'])).toEqual(['/yazilar/a', '/en/writings/a', '/ar/writings/a'])
      expect(getYorumMetinleri.tags).toEqual(['yorumMetinleri'])
    })
  })

  describe('texts', () => {
    it('seeds every key in three languages and gates rendering on them', () => {
      for (const k of YORUM_METIN_KEYS)
        for (const l of ['tr', 'en', 'ar'] as const) expect(YORUM_METINLERI[k][l], `${k}.${l}`).toBeTruthy()
      expect(YORUM_METINLERI.formBasariMetin.tr).toBe('Yorumunuz onaylandıktan sonra yayınlanacak.')
      expect(YORUM_METINLERI.cevapEtiket.tr).toBe("Sıtkı Çoban'ın cevabı")
      expect(yorumMetinleriVar(null)).toBe(false)
      expect(yorumMetinleriVar({ baslik: 'Yorumlar', formGonder: '' })).toBe(false)
      expect(yorumMetinleriVar({ baslik: 'Yorumlar', formGonder: 'Gönder' })).toBe(true)
    })
  })
})
