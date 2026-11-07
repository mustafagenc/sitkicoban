import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

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
) => unstable_cache(async (...args: A) => plain(await fn(...args)), [name], { tags })

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
