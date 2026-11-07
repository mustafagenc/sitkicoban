import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import { LOCALES, localizedPath, type PageKey } from '@/i18n/config'

import { TAGS_BY_SOURCE, type Tag } from './tags'

const ALL_PAGES: PageKey[] = ['home', 'eserler', 'kitaplar']

const PAGES_BY_TAG: Record<Tag, PageKey[]> = {
  eserler: ['eserler'],
  kitaplar: ['kitaplar'],
  anasayfa: ['home'],
  ayarlar: ALL_PAGES,
  ui: ALL_PAGES,
  turler: ALL_PAGES,
  media: ALL_PAGES,
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

function invalidate(source: string): void {
  const tags = TAGS_BY_SOURCE[source] ?? []
  for (const tag of tags) {
    try {
      // Immediate expiry: the warm-up fetch below must see fresh data.
      revalidateTag(tag, { expire: 0 })
    } catch {
      // Outside a Next request context (scripts, tests): nothing to invalidate.
    }
  }

  const paths = pathsForTags(tags)
  if (paths.length === 0) return
  console.log(`[yenile] ${paths.join(',')}`)

  const base = process.env.NEXT_PUBLIC_SITE_URL
  if (!base) return
  for (const path of paths) {
    // Fire-and-forget warm-up; must never fail a save.
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
    afterChange: ({ doc, context }) => {
      if (!context?.disableRevalidate) invalidate(source)
      return doc
    },
    afterDelete: ({ doc, context }) => {
      if (!context?.disableRevalidate) invalidate(source)
      return doc
    },
  }
}
