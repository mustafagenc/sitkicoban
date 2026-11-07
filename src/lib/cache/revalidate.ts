import { revalidateTag } from 'next/cache'
import { after } from 'next/server'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { LOCALES, localizedPath, yaziPath, type PageKey } from '@/i18n/config'

import { TAGS_BY_SOURCE, type Tag } from './tags'

const ALL_PAGES: PageKey[] = [
  'home',
  'eserler',
  'kitaplar',
  'yazilar',
  'videolar',
  'hayati',
  'iletisim',
  'aydinlatma',
]

const PAGES_BY_TAG: Record<Tag, PageKey[]> = {
  eserler: ['eserler'],
  kitaplar: ['kitaplar'],
  anasayfa: ['home'],
  ayarlar: ALL_PAGES,
  ui: ALL_PAGES,
  turler: ['eserler', 'home'],
  media: ALL_PAGES,
  dersler: ['home'],
  yazilar: ['yazilar', 'home', 'kitaplar'],
  hayati: ['hayati', 'home'],
  videolar: ['videolar', 'home'],
  iletisim: ['iletisim', 'aydinlatma'],
}

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
  const slugs = [...publishedSlugs]
  if (source === 'yazilar') {
    for (const d of [doc, previousDoc]) if (typeof d?.slug === 'string' && d.slug) slugs.push(d.slug)
  }
  for (const slug of slugs) for (const locale of LOCALES) paths.add(yaziPath(slug, locale))
  return [...paths]
}

/** Tags whose data every yazı detail page renders (layout, UI strings, images, posts/categories). */
const YAZI_DETAIL_TAGS: Tag[] = ['ayarlar', 'ui', 'media', 'yazilar']

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

  const base = process.env.NEXT_PUBLIC_SITE_URL
  if (!base) return
  for (const path of paths) {
    // Fire-and-forget; must never fail a save.
    try {
      fetch(new URL(path, base).toString()).catch(() => {})
    } catch {
      // ignore
    }
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
