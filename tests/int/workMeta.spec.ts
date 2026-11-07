import { describe, expect, it } from 'vitest'

import { workMeta } from '@/components/workMeta'

describe('workMeta', () => {
  it('joins script names and keeps type, year in order', () => {
    expect(workMeta({ yaziTurleri: ['Sülüs', 'Nesih'], tur: 'Hilye' })).toEqual([
      'Sülüs · Nesih',
      'Hilye',
    ])
    expect(workMeta({ yaziTurleri: ['Celî Sülüs'], tur: 'Levha', yil: '1442' })).toEqual([
      'Celî Sülüs',
      'Levha',
      '1442',
    ])
  })
  it('drops empty parts', () => {
    expect(workMeta({ yaziTurleri: ["Ta'lik"], tur: null, yil: '' })).toEqual(["Ta'lik"])
    expect(workMeta({ yaziTurleri: [], tur: 'Beyit', yil: '  ' })).toEqual(['Beyit'])
    expect(workMeta({ yaziTurleri: [] })).toEqual([])
  })
})
