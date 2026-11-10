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
    expect(pathsForTags(['ui'])).toHaveLength(30)
  })

  it('maps bulten to every page (footer link, home strip), confirm page included', () => {
    const p = pathsForTags(['bulten'])
    expect(p).toHaveLength(30)
    expect(p).toEqual(expect.arrayContaining(['/bulten', '/en/newsletter', '/ar/newsletter/confirm', '/', '/yazilar']))
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

  it('re-renders llms.txt when its description, biography, teachers, books, lessons, scripts or writings can change', () => {
    for (const s of ['yazilar', 'yazi-kategorileri', 'anasayfa', 'kitaplar', 'media', 'hayati', 'hocalar', 'dersler', 'yazi-turleri', 'eser-turleri', 'eserler'])
      expect(pathsForChange(s), s).toContain('/llms.txt')
    for (const s of ['videolar', 'video-kategorileri', 'iletisim', 'site-ayarlari', 'ui-metinleri', 'bulten', 'yorum-metinleri'])
      expect(pathsForChange(s), s).not.toContain('/llms.txt')
  })

  it('re-renders llms-full.txt when any content it includes can change, never for UI/contact/newsletter texts', () => {
    for (const s of [
      'yazilar', 'yazi-kategorileri', 'anasayfa', 'kitaplar', 'media', 'hayati', 'hocalar', 'dersler',
      'yazi-turleri', 'eser-turleri', 'eserler', 'videolar', 'video-kategorileri', 'site-ayarlari',
    ])
      expect(pathsForChange(s), s).toContain('/llms-full.txt')
    for (const s of ['iletisim', 'ui-metinleri', 'bulten', 'yorum-metinleri'])
      expect(pathsForChange(s), s).not.toContain('/llms-full.txt')
  })

  it('re-renders /ajan.json (WebMCP data) when any public content it lists changes', () => {
    for (const s of ['eserler', 'kitaplar', 'yazilar', 'dersler', 'site-ayarlari', 'media', 'yazi-turleri'])
      expect(pathsForChange(s)).toContain('/ajan.json')
    for (const s of ['videolar', 'iletisim', 'hayati', 'ui-metinleri'])
      expect(pathsForChange(s)).not.toContain('/ajan.json')
  })
})
