// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

// Blob'a hiç gidilmez: dosya varlığı sorgusu taklit edilir (varsayılan: dosya var).
const { head } = vi.hoisted(() => ({ head: vi.fn(async (_key: string) => ({})) }))
vi.mock('@vercel/blob', async (orig) => ({ ...(await orig<typeof import('@vercel/blob')>()), head }))

import { BlobNotFoundError } from '@vercel/blob'

import config from '@/payload.config'
import { readDesign } from '@/seed/read-design'
import { seed } from '@/seed'
import { SEED_DERSLER } from '@/seed/dersler'
import { SEED_HOCALAR, SEED_PORTRE } from '@/seed/hayati'
import { SEED_VIDEOLAR } from '@/seed/videolar'
import { SEED_YAZILAR } from '@/seed/yazilar'

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
    // works, covers, lesson posters, teacher signatures, portrait and post covers share images: one media doc per distinct file.
    const files = new Set([
      ...design.eserler.map((e) => e.f),
      ...design.kitaplar.filter((k) => k.img).map((k) => k.img),
      ...SEED_DERSLER.flatMap((d) => (d.afis ? [d.afis.file] : [])),
      ...SEED_HOCALAR.map((h) => h.imza.file),
      SEED_PORTRE.file,
      ...SEED_YAZILAR.flatMap((y) => (y.kapak ? [y.kapak.file] : [])),
      ...SEED_VIDEOLAR.flatMap((v) => (v.kapak ? [v.kapak.ad] : [])),
    ])
    expect((await payload.count({ collection: 'media' })).totalDocs).toBe(files.size)
  }, 120_000)

  it('seeds contact e-mail and cookie texts in every locale, but never an analytics id', async () => {
    const tr = await payload.findGlobal({ slug: 'site-ayarlari', locale: 'tr' })
    expect(tr.formHedefEposta).toBe('hattatsitkicoban@gmail.com')
    expect(tr.gaOlcumKimligi ?? null).toBeNull() // ölçüm kimliği panelden girilir; seed onu ezmez
    const en = await payload.findGlobal({ slug: 'site-ayarlari', locale: 'en', fallbackLocale: false })
    expect(en.cerez?.kabul).toBe('Accept')
    const ar = await payload.findGlobal({ slug: 'site-ayarlari', locale: 'ar', fallbackLocale: false })
    expect(ar.cerez?.tercihler).toBeTruthy()
  })

  it('seeds the newsletter texts in every locale', async () => {
    const tr = await payload.findGlobal({ slug: 'bulten', locale: 'tr' })
    expect(tr.metinler?.formGonder).toBe('Abone ol')
    expect(tr.aciklama).toBeTruthy()
    const en = await payload.findGlobal({ slug: 'bulten', locale: 'en', fallbackLocale: false })
    expect(en.metinler?.baslik).toBe('Newsletter')
    const ar = await payload.findGlobal({ slug: 'bulten', locale: 'ar', fallbackLocale: false })
    expect(ar.metinler?.onayEpostaKonu).toBeTruthy()
    expect(ar.metinler?.onayEpostaKonu).not.toBe(tr.metinler?.onayEpostaKonu)
  })

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

  it('gives every write its own context object (plugins store per-request state in it)', async () => {
    const contexts: unknown[] = []
    const spies = (['create', 'update', 'updateGlobal', 'delete'] as const).map((m) => {
      const orig = payload[m].bind(payload) as (args: unknown) => unknown
      return vi.spyOn(payload, m).mockImplementation(((args: { context?: unknown }) => {
        if (args.context) contexts.push(args.context)
        return orig(args)
      }) as never)
    })
    try {
      await seed(payload)
    } finally {
      for (const s of spies) s.mockRestore()
    }
    expect(contexts.length).toBeGreaterThan(10)
    expect(new Set(contexts).size).toBe(contexts.length)
  }, 120_000)

  it('fills the social links, YouTube included', async () => {
    const ayarlar = await payload.findGlobal({ slug: 'site-ayarlari' })
    expect(ayarlar.youtube).toBe('https://www.youtube.com/@HattatSitkiCoban')
    expect(ayarlar.instagram).toBeTruthy()
    expect(ayarlar.facebook).toBeTruthy()
  })

  it('writes Arabic UI strings, not Turkish', async () => {
    const ar = await payload.findGlobal({ slug: 'ui-metinleri', locale: 'ar', fallbackLocale: false })
    const tr = await payload.findGlobal({ slug: 'ui-metinleri', locale: 'tr' })
    expect(tr.navEserler).toBe('Eserler')
    expect(ar.navEserler).toBe('الأعمال')
    expect(ar.navEserler).not.toBe(tr.navEserler)
  })

  it('re-uploads a media file that Blob reports missing (the stored url is not trusted)', async () => {
    const find = async (filename: string) =>
      (await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })).docs[0]
    const eksik = await find('e-hilye.jpg')
    const duran = await find('e-subhanallah.jpg')
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_test_test'
    head.mockImplementation(async (key: string) => {
      if (key === 'e-hilye.jpg') throw new BlobNotFoundError()
      return {}
    })
    let sorulan: unknown[] = []
    try {
      await seed(payload)
      sorulan = head.mock.calls.map((c) => c[0])
    } finally {
      delete process.env.BLOB_READ_WRITE_TOKEN
      head.mockReset()
      head.mockImplementation(async () => ({}))
    }
    expect(sorulan).toEqual(expect.arrayContaining(['e-hilye.jpg', 'e-subhanallah.jpg']))
    expect((await find('e-hilye.jpg'))?.id).not.toBe(eksik.id)
    expect((await find('e-subhanallah.jpg'))?.id).toBe(duran.id)
  }, 120_000)
})
