import { describe, expect, it } from 'vitest'

import { slugify } from '@/lib/slug'

describe('slugify', () => {
  it('maps Turkish characters and drops apostrophes', () => {
    expect(slugify("Şey'en Lillâh")).toBe('seyen-lillah')
    expect(slugify("Mesnevî'de Geçen Hikâyeler")).toBe('mesnevide-gecen-hikayeler')
  })
  it('collapses whitespace and handles dotted/dotless i', () => {
    expect(slugify('İcazet  Ğ ı Ö')).toBe('icazet-g-i-o')
  })
})
