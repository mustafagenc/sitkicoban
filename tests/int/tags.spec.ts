import { describe, expect, it } from 'vitest'

import { pathsForTags } from '@/lib/cache/revalidate'
import { TAGS_BY_SOURCE } from '@/lib/cache/tags'

describe('pathsForTags', () => {
  it('maps eserler to the works page in all locales plus home', () => {
    const paths = pathsForTags(TAGS_BY_SOURCE.eserler)
    expect(new Set(paths)).toEqual(
      new Set(['/', '/en', '/ar', '/eserler', '/en/works', '/ar/works']),
    )
    expect(paths).not.toContain('/kitaplar')
    expect(paths.length).toBe(new Set(paths).size)
  })

  it('maps turler to the works page and home only', () => {
    expect(new Set(pathsForTags(['turler']))).toEqual(
      new Set(['/', '/en', '/ar', '/eserler', '/en/works', '/ar/works']),
    )
  })

  it('maps ui to every page in every locale', () => {
    expect(pathsForTags(['ui'])).toHaveLength(9)
  })
})
