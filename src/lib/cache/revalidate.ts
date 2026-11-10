import { revalidateTag } from 'next/cache'
import { after } from 'next/server'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { LOCALES, localizedPath, yaziPath, type PageKey } from '@/i18n/config'

import { siteUrl } from '@/lib/site'

import { TAGS_BY_SOURCE, yorumTag, type Tag } from './tags'

export { yorumTag }

const ALL_PAGES: PageKey[] = [
  'home',
  'eserler',
  'kitaplar',
  'yazilar',
  'videolar',
  'hayati',
  'iletisim',
  'aydinlatma',
  'bulten',
  'bultenOnay',
]

export const PAGES_BY_TAG: Record<Tag, PageKey[]> = {
  eserler: ['eserler', 'home'], // ana sayfa eser seçkisi
  kitaplar: ['kitaplar', 'yazilar', 'home'], // yazı listesi ilgili kitap adlarını (?kitap= süzgeci) gösterir
  anasayfa: ['home', 'hayati'], // hayatı sayfası da getAnasayfa() okur
  ayarlar: ALL_PAGES,
  ui: ALL_PAGES,
  turler: ['eserler', 'home'],
  media: ALL_PAGES,
  dersler: ['home'],
  yazilar: ['yazilar', 'home', 'kitaplar'],
  hayati: ['hayati', 'home'],
  videolar: ['videolar', 'home'],
  iletisim: ['iletisim', 'aydinlatma'],
  bulten: ALL_PAGES, // alt bilgideki "Bülten" bağlantısı her sayfada; ana sayfada bülten şeridi
  // Yorumlar ve metinleri yalnızca yazı detay sayfalarında (YAZI_DETAIL_TAGS); liste sayfası yok.
  yorumlar: [],
  yorumMetinleri: [],
}

/** Tags whose data `/llms.txt` renders (getAnasayfa, getYazilar). */
export const LLMS_TAGS: Tag[] = ['anasayfa', 'yazilar', 'media', 'kitaplar']

/** Tags whose data `/ajan.json` (WebMCP tools) renders: works, books, writings, lessons, settings. */
export const AJAN_TAGS: Tag[] = ['eserler', 'turler', 'media', 'kitaplar', 'yazilar', 'dersler', 'ayarlar']

/** Public paths that render data behind the given tags (deduplicated). */
export function pathsForTags(tags: Tag[]): string[] {
  const paths = new Set<string>()
  for (const tag of tags) {
    for (const page of PAGES_BY_TAG[tag]) {
      for (const locale of LOCALES) paths.add(localizedPath(page, locale))
    }
  }
  return [...paths]
}

/**
 * Tag paths plus yazı detail pages: for `yazilar`, the changed doc's current and previous slug,
 * and every slug in `publishedSlugs` (see `rendersYaziDetail`).
 */
export function pathsForChange(
  source: string,
  doc?: { slug?: unknown } | null,
  previousDoc?: { slug?: unknown } | null,
  publishedSlugs: string[] = [],
): string[] {
  const paths = new Set(pathsForTags(TAGS_BY_SOURCE[source] ?? []))
  // The sitemap lists published yazı slugs, so it is re-rendered whenever they can change.
  if ((TAGS_BY_SOURCE[source] ?? []).includes('yazilar')) paths.add('/sitemap.xml')
  if ((TAGS_BY_SOURCE[source] ?? []).some((t) => LLMS_TAGS.includes(t))) paths.add('/llms.txt')
  if ((TAGS_BY_SOURCE[source] ?? []).some((t) => AJAN_TAGS.includes(t))) paths.add('/ajan.json')
  const slugs = [...publishedSlugs]
  if (source === 'yazilar') {
    for (const d of [doc, previousDoc]) if (typeof d?.slug === 'string' && d.slug) slugs.push(d.slug)
  }
  for (const slug of slugs) for (const locale of LOCALES) paths.add(yaziPath(slug, locale))
  return [...paths]
}

/**
 * Tags whose data every yazı detail page renders (layout, UI strings, images, posts/categories, related books,
 * footer newsletter link, comments and their texts). Comments are also tagged per yazı (`yorumTag`), and a
 * comment save invalidates only that tag, so `yorumlar` itself is never revalidated as a whole.
 */
export const YAZI_DETAIL_TAGS: Tag[] = ['ayarlar', 'ui', 'media', 'yazilar', 'kitaplar', 'bulten', 'yorumlar', 'yorumMetinleri']

/** Whether a save to this source changes data shown on every published yazı detail page. */
export function rendersYaziDetail(source: string): boolean {
  return (TAGS_BY_SOURCE[source] ?? []).some((t) => YAZI_DETAIL_TAGS.includes(t))
}

/**
 * Published yazı slugs, read inside the save's own request/transaction (admin context, so the
 * DB is already awake). Never fails a save.
 */
async function publishedYaziSlugs(req: PayloadRequest | undefined): Promise<string[]> {
  if (!req?.payload?.collections?.yazilar) return []
  try {
    const res = await req.payload.find({
      collection: 'yazilar',
      where: { yayinda: { equals: true } },
      select: { slug: true },
      depth: 0,
      pagination: false,
      limit: 0,
      req,
    })
    return res.docs.map((d) => d.slug).filter((s): s is string => typeof s === 'string' && s.length > 0)
  } catch {
    return []
  }
}

async function invalidate(
  source: string,
  req: PayloadRequest | undefined,
  doc?: { slug?: unknown } | null,
  previousDoc?: { slug?: unknown } | null,
): Promise<void> {
  const tags = TAGS_BY_SOURCE[source] ?? []
  for (const tag of tags) {
    try {
      // Immediate expiry: the warm-up fetch below must see fresh data.
      revalidateTag(tag, { expire: 0 })
    } catch {
      // Outside a Next request context (scripts, tests): nothing to invalidate.
    }
  }

  const published = rendersYaziDetail(source) ? await publishedYaziSlugs(req) : []
  const paths = pathsForChange(source, doc, previousDoc, published)
  if (paths.length === 0) return

  // Ordering matters: the hook runs before Payload commits its DB transaction, and
  // revalidateTag only queues the invalidation until the route handler returns.
  // Warming now would read the old row and hit a still-valid cache. So defer the
  // warm-up until after the response (by then the commit is done and the pending
  // revalidates are applied).
  const warm = () => warmUp(paths)
  try {
    after(warm)
  } catch {
    // Outside a Next request context (scripts, tests): defer on the event loop instead.
    setTimeout(warm, 250)
  }
}

function warmUp(paths: string[]): void {
  console.log(`[yenile] ${paths.join(',')}`)

  const base = siteUrl()
  for (const path of paths) {
    // Fire-and-forget; must never fail a save.
    try {
      fetch(new URL(path, base).toString()).catch(() => {})
    } catch {
      // ignore
    }
  }
}

type YorumDoc = { durum?: unknown; yazi?: unknown } | null | undefined

const yaziIdOf = (v: unknown): number | string | null =>
  typeof v === 'number' || typeof v === 'string' ? v : v && typeof v === 'object' && 'id' in v ? (v as { id: number }).id : null

/** Whether a comment save changes public output: only approved comments are rendered. */
export function yorumGorunurDegisti(doc: YorumDoc, previousDoc?: YorumDoc): boolean {
  return doc?.durum === 'onaylandi' || previousDoc?.durum === 'onaylandi'
}

/**
 * Comment hooks: when an approved comment changes (approved, withdrawn, edited, deleted), invalidate only its
 * yazı's comment tag and warm that yazı's detail page in every locale (comments show in all languages).
 * New pending submissions and edits of unapproved comments touch nothing.
 */
export function yorumRevalidateHooks(): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  const run = async (req: PayloadRequest, docs: YorumDoc[]) => {
    const ids = [...new Set(docs.map((d) => yaziIdOf(d?.yazi)).filter((v): v is number | string => v !== null))]
    const paths = new Set<string>()
    for (const id of ids) {
      try {
        revalidateTag(yorumTag(id), { expire: 0 })
      } catch {
        // Outside a Next request context (scripts, tests): nothing to invalidate.
      }
      try {
        const yazi = await req.payload.findByID({ collection: 'yazilar', id, select: { slug: true }, depth: 0, req })
        if (typeof yazi?.slug === 'string' && yazi.slug) for (const l of LOCALES) paths.add(yaziPath(yazi.slug, l))
      } catch {
        // Yazı silinmiş: ısıtılacak sayfa yok.
      }
    }
    if (paths.size === 0) return
    const warm = () => warmUp([...paths])
    try {
      after(warm)
    } catch {
      setTimeout(warm, 250)
    }
  }
  return {
    afterChange: async ({ doc, previousDoc, context, req }) => {
      if (!context?.disableRevalidate && yorumGorunurDegisti(doc, previousDoc)) await run(req, [doc, previousDoc])
      return doc
    },
    afterDelete: async ({ doc, context, req }) => {
      if (!context?.disableRevalidate && yorumGorunurDegisti(doc)) await run(req, [doc])
      return doc
    },
  }
}

export function revalidateHooks(source: string): {
  afterChange: CollectionAfterChangeHook & GlobalAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  return {
    afterChange: async ({ doc, previousDoc, context, req }) => {
      if (!context?.disableRevalidate) await invalidate(source, req, doc, previousDoc)
      return doc
    },
    afterDelete: async ({ doc, context, req }) => {
      if (!context?.disableRevalidate) await invalidate(source, req, doc)
      return doc
    },
  }
}
