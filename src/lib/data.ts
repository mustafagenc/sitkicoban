import { unstable_cache } from 'next/cache'
import { getPayload, type Payload } from 'payload'

import type { Locale } from '@/i18n/config'
import config from '@/payload.config'

import type { Tag } from './cache/tags'

const opts = (locale: Locale) => ({ locale, fallbackLocale: 'tr' as const, depth: 1 })

/** Plain, serializable copy (drops class instances/undefined). */
const plain = <T>(v: T): T => JSON.parse(JSON.stringify(v))

/** Cached by tags only; no time-based revalidation. */
const cached = <A extends unknown[], R>(
  name: string,
  tags: Tag[],
  fn: (...args: A) => Promise<R>,
) =>
  // `tags` is exposed so tests can check every page's getters are covered by the revalidation map.
  Object.assign(
    unstable_cache(async (...args: A) => plain(await fn(...args)), [name], { tags }),
    { tags },
  )

export const getEserler = cached('eserler', ['eserler', 'turler', 'media'], async (locale: Locale) => {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'eserler',
    sort: 'sira',
    limit: 1000,
    pagination: false,
    ...opts(locale),
  })
  return res.docs
})

export const getYaziTurleri = cached('yazi-turleri', ['turler'], async (locale: Locale) => {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'yazi-turleri',
    sort: 'sira',
    limit: 1000,
    pagination: false,
    ...opts(locale),
  })
  return res.docs
})

export const getKitaplar = cached('kitaplar', ['kitaplar', 'media'], async (locale: Locale) => {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'kitaplar',
    sort: 'sira',
    limit: 1000,
    pagination: false,
    ...opts(locale),
  })
  return res.docs
})

export const getSiteAyarlari = cached('site-ayarlari', ['ayarlar'], async (locale: Locale) => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-ayarlari', ...opts(locale) })
})

export const getUi = cached('ui-metinleri', ['ui'], async (locale: Locale) => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'ui-metinleri', ...opts(locale) })
})

export const getAnasayfa = cached('anasayfa', ['anasayfa'], async (locale: Locale) => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'anasayfa', ...opts(locale) })
})

export const getAnasayfaEserleri = cached(
  'anasayfa-eserleri',
  ['eserler', 'anasayfa', 'turler', 'media'],
  async (locale: Locale) => {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'eserler',
      where: { anasayfadaGoster: { equals: true } },
      sort: 'anasayfaSira',
      limit: 1000,
      pagination: false,
      ...opts(locale),
    })
    return res.docs
  },
)

export const getAnasayfaKitaplari = cached(
  'anasayfa-kitaplari',
  ['kitaplar', 'anasayfa', 'media'],
  async (locale: Locale) => {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'kitaplar',
      where: { anasayfadaGoster: { equals: true } },
      sort: 'anasayfaSira',
      limit: 1000,
      pagination: false,
      ...opts(locale),
    })
    return res.docs
  },
)

export const getDersler = cached('dersler', ['dersler', 'media'], async (locale: Locale) => {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'dersler',
    sort: 'sira',
    limit: 1000,
    pagination: false,
    ...opts(locale),
  })
  return res.docs
})

// Yazılar: yalnızca `yayinda` olanlar. İç fonksiyonlar testlerde önbelleksiz çağrılır.
const YAYINDA = { yayinda: { equals: true } } as const

export async function findYazilar(payload: Payload, locale: Locale) {
  const res = await payload.find({
    collection: 'yazilar',
    where: YAYINDA,
    sort: '-tarih',
    limit: 1000,
    pagination: false,
    // Liste gövdeyi çizmez; ilgili kitaplardan yalnızca slug gerekir (?kitap= süzgeci).
    select: { govde: false },
    populate: { kitaplar: { slug: true, baslik: true } },
    ...opts(locale),
  })
  return res.docs
}

export async function findYazi(payload: Payload, slug: string, locale: Locale) {
  const res = await payload.find({
    collection: 'yazilar',
    where: { and: [YAYINDA, { slug: { equals: slug } }] },
    limit: 1,
    pagination: false,
    populate: { kitaplar: { slug: true, baslik: true } },
    ...opts(locale),
  })
  return res.docs[0] ?? null
}

export async function findYaziSluglari(payload: Payload) {
  const res = await payload.find({
    collection: 'yazilar',
    where: YAYINDA,
    sort: '-tarih',
    select: { slug: true },
    depth: 0,
    limit: 1000,
    pagination: false,
  })
  return res.docs.map((d) => d.slug).filter((s): s is string => typeof s === 'string' && s.length > 0)
}

export async function findYaziKategorileri(payload: Payload, locale: Locale) {
  const res = await payload.find({
    collection: 'yazi-kategorileri',
    sort: 'sira',
    limit: 1000,
    pagination: false,
    ...opts(locale),
  })
  return res.docs
}

export const getYazilar = cached('yazilar', ['yazilar', 'media', 'kitaplar'], async (locale: Locale) =>
  findYazilar(await getPayload({ config }), locale),
)

export const getYazi = cached('yazi', ['yazilar', 'media', 'kitaplar'], async (slug: string, locale: Locale) =>
  findYazi(await getPayload({ config }), slug, locale),
)

export const getYaziSluglari = cached('yazi-sluglari', ['yazilar'], async () =>
  findYaziSluglari(await getPayload({ config })),
)

export const getYaziKategorileri = cached('yazi-kategorileri', ['yazilar'], async (locale: Locale) =>
  findYaziKategorileri(await getPayload({ config }), locale),
)

// Hayatı sayfası ve ana sayfadaki İcazet/Hayatı bölümleri.
export async function findHayati(payload: Payload, locale: Locale) {
  return payload.findGlobal({ slug: 'hayati', ...opts(locale) })
}

export async function findHocalar(payload: Payload, locale: Locale) {
  const res = await payload.find({
    collection: 'hocalar',
    sort: 'sira',
    limit: 1000,
    pagination: false,
    ...opts(locale),
  })
  return res.docs
}

export const getHayati = cached('hayati', ['hayati', 'media'], async (locale: Locale) =>
  findHayati(await getPayload({ config }), locale),
)

export const getHocalar = cached('hocalar', ['hayati', 'media'], async (locale: Locale) =>
  findHocalar(await getPayload({ config }), locale),
)

// Videolar ve kategorileri: tek getirme; ana sayfa videosu istemci tarafında değil sunucuda seçilir.
export async function findVideolar(payload: Payload, locale: Locale) {
  const res = await payload.find({
    collection: 'videolar',
    sort: ['sira', '-tarih'],
    limit: 1000,
    pagination: false,
    ...opts(locale),
  })
  return res.docs
}

export async function findVideoKategorileri(payload: Payload, locale: Locale) {
  const res = await payload.find({
    collection: 'video-kategorileri',
    sort: 'sira',
    limit: 1000,
    pagination: false,
    ...opts(locale),
  })
  return res.docs
}

export const getVideolar = cached('videolar', ['videolar', 'media'], async (locale: Locale) =>
  findVideolar(await getPayload({ config }), locale),
)

export const getVideoKategorileri = cached('video-kategorileri', ['videolar'], async (locale: Locale) =>
  findVideoKategorileri(await getPayload({ config }), locale),
)

// İletişim sayfası ve aydınlatma metni.
export const getIletisim = cached('iletisim', ['iletisim'], async (locale: Locale) => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'iletisim', ...opts(locale) })
})

// Bülten metinleri: bülten ve onay sayfaları, ana sayfa şeridi ve her sayfanın alt bilgisi.
export const getBulten = cached('bulten', ['bulten'], async (locale: Locale) => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'bulten', ...opts(locale) })
})
