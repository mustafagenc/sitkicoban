import { describe, expect, it } from 'vitest'

import { pathsForChange, pathsForTags } from '@/lib/cache/revalidate'
import { TAGS_BY_SOURCE } from '@/lib/cache/tags'

describe('pathsForTags', () => {
  it('maps eserler to the works page in all locales plus home', () => {
    const paths = pathsForTags(TAGS_BY_SOURCE.eserler)
    expect(new Set(paths)).toEqual(
      new Set([
        '/', '/en', '/ar', '/eserler', '/en/works', '/ar/works',
        '/hayati', '/en/biography', '/ar/biography',
      ]),
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
    expect(pathsForTags(['ui'])).toHaveLength(24)
  })

  it('maps anasayfa to home and the biography page', () => {
    expect(new Set(pathsForTags(['anasayfa']))).toEqual(
      new Set(['/', '/en', '/ar', '/hayati', '/en/biography', '/ar/biography']),
    )
  })

  it('maps dersler to home only', () => {
    expect(new Set(pathsForTags(['dersler']))).toEqual(new Set(['/', '/en', '/ar']))
  })

  it('maps iletisim to contact and privacy pages', () => {
    expect(new Set(pathsForTags(TAGS_BY_SOURCE.iletisim))).toEqual(
      new Set([
        '/iletisim', '/en/contact', '/ar/contact',
        '/iletisim/aydinlatma', '/en/contact/privacy', '/ar/contact/privacy',
      ]),
    )
  })

  it('maps new sources', () => {
    expect(TAGS_BY_SOURCE['yazi-kategorileri']).toEqual(['yazilar'])
    expect(TAGS_BY_SOURCE.hocalar).toEqual(['hayati'])
    expect(TAGS_BY_SOURCE['video-kategorileri']).toEqual(['videolar'])
    expect(new Set(pathsForTags(['yazilar']))).toContain('/en/books')
  })

  it('pathsForChange adds yazi detail paths for old and new slug', () => {
    const paths = pathsForChange('yazilar', { slug: 'b' }, { slug: 'a' })
    for (const p of ['/yazilar/a', '/yazilar/b', '/en/writings/b', '/ar/writings/a', '/yazilar'])
      expect(paths).toContain(p)
    expect(paths.length).toBe(new Set(paths).size)
    expect(pathsForChange('eserler', { slug: 'b' })).not.toContain('/yazilar/b')
  })

  it('re-renders the sitemap only when published yazı slugs can change', () => {
    expect(pathsForChange('yazilar', { slug: 'b' })).toContain('/sitemap.xml')
    expect(pathsForChange('yazi-kategorileri')).toContain('/sitemap.xml')
    expect(pathsForChange('eserler')).not.toContain('/sitemap.xml')
    expect(pathsForChange('dersler')).not.toContain('/sitemap.xml')
  })
})
