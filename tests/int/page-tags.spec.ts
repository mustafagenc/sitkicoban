import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/payload.config', () => ({ default: {} }))

import * as data from '@/lib/data'
import { LLMS_TAGS, PAGES_BY_TAG, YAZI_DETAIL_TAGS } from '@/lib/cache/revalidate'
import type { PageKey } from '@/i18n/config'
import type { Tag } from '@/lib/cache/tags'

const ROOT = path.join(process.cwd(), 'src/app/(frontend)/[locale]')

/** Source file of each page; its `get*` calls are scanned, so a new getter cannot slip in unnoticed. */
const PAGE_FILES: Record<PageKey | 'yazi', string> = {
  home: 'page.tsx',
  eserler: 'eserler/page.tsx',
  kitaplar: 'kitaplar/page.tsx',
  yazilar: 'yazilar/page.tsx',
  videolar: 'videolar/page.tsx',
  hayati: 'hayati/page.tsx',
  iletisim: 'iletisim/page.tsx',
  aydinlatma: 'iletisim/aydinlatma/page.tsx',
  bulten: 'bulten/page.tsx',
  bultenOnay: 'bulten/onay/page.tsx',
  yazi: 'yazilar/[slug]/page.tsx',
}

type Tagged = { tags: Tag[] }
const getters = data as unknown as Record<string, Tagged | unknown>

/** Components that fetch their own data (async server components); a page rendering one reads its tags too. */
const FETCHING_COMPONENTS: Record<string, string> = {
  Footer: path.join(process.cwd(), 'src/components/Footer.tsx'),
}

function tagsOfPage(file: string): { tag: Tag; getter: string }[] {
  const pageSrc = readFileSync(path.join(ROOT, file), 'utf8')
  const used = Object.entries(FETCHING_COMPONENTS).filter(([name]) => new RegExp(`<${name}\\b`).test(pageSrc))
  const src = [pageSrc, ...used.map(([, f]) => readFileSync(f, 'utf8'))].join('\n')
  const names = [...new Set(src.match(/\bget[A-Z]\w*(?=\()/g) ?? [])].filter((n) => n in getters)
  return names.flatMap((getter) => ((getters[getter] as Tagged).tags ?? []).map((tag) => ({ tag, getter })))
}

describe('page cache tags are covered by the revalidation map', () => {
  for (const [page, file] of Object.entries(PAGE_FILES)) {
    it(`${page} is warmed by every tag its getters read`, () => {
      const pairs = tagsOfPage(file)
      expect(pairs.length).toBeGreaterThan(0)
      for (const { tag, getter } of pairs) {
        const covered =
          page === 'yazi' ? YAZI_DETAIL_TAGS.includes(tag) : PAGES_BY_TAG[tag].includes(page as PageKey)
        expect(covered, `${page} reads tag "${tag}" via ${getter}() but a save to it would not warm ${page}`).toBe(true)
      }
    })
  }

  it('llms.txt is warmed by every tag its getters read', () => {
    const pairs = tagsOfPage('../../llms.txt/route.ts')
    expect(pairs.length).toBeGreaterThan(0)
    for (const { tag, getter } of pairs)
      expect(LLMS_TAGS.includes(tag), `llms.txt reads tag "${tag}" via ${getter}() but LLMS_TAGS lacks it`).toBe(true)
  })
})
