import { describe, expect, it } from 'vitest'

import { TASARIM_LINKS, dir, localizedPath, resolvePath } from '@/i18n/config'

describe('i18n routing', () => {
  it('localizedPath', () => {
    expect(localizedPath('eserler', 'en')).toBe('/en/works')
    expect(localizedPath('home', 'tr')).toBe('/')
    expect(localizedPath('home', 'en')).toBe('/en')
    expect(localizedPath('kitaplar', 'tr')).toBe('/kitaplar')
  })
  it('resolvePath resolves localized segments', () => {
    expect(resolvePath('/ar/books')).toEqual({ locale: 'ar', key: 'kitaplar' })
    expect(resolvePath('/eserler')).toEqual({ locale: 'tr', key: 'eserler' })
    expect(resolvePath('/')).toEqual({ locale: 'tr', key: 'home' })
    expect(resolvePath('/en')).toEqual({ locale: 'en', key: 'home' })
  })
  it('redirects the default-locale prefix', () => {
    expect(resolvePath('/tr/eserler')).toEqual({ redirect: '/eserler' })
    expect(resolvePath('/tr')).toEqual({ redirect: '/' })
  })
  it('returns null for unknown paths', () => {
    expect(resolvePath('/en/eserler')).toBeNull()
    expect(resolvePath('/works')).toBeNull()
    expect(resolvePath('/fr')).toBeNull()
  })
  it('treats trailing slashes like none', () => {
    expect(resolvePath('/en/')).toEqual({ locale: 'en', key: 'home' })
    expect(resolvePath('/ar/books/')).toEqual({ locale: 'ar', key: 'kitaplar' })
    expect(resolvePath('/tr/eserler/')).toEqual({ redirect: '/eserler' })
  })
  it('dir', () => {
    expect(dir('ar')).toBe('rtl')
    expect(dir('tr')).toBe('ltr')
  })
  it('TASARIM_LINKS', () => {
    expect(TASARIM_LINKS.hayati).toBe('/tasarim/hayati.html')
  })
})
