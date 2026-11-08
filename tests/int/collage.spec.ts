import { describe, expect, it } from 'vitest'

import { collageRows } from '@/components/HomeHero'

describe('collageRows', () => {
  it('builds 5 rows of 9 images each, duplicated, by the design formula', () => {
    const imgs = Array.from({ length: 13 }, (_, i) => `e${i}`)
    const rows = collageRows(imgs)
    expect(rows).toHaveLength(5)
    rows.forEach((row, r) => {
      expect(row).toHaveLength(18)
      expect(row.slice(0, 9)).toEqual(row.slice(9))
      row.slice(0, 9).forEach((src, i) => expect(src).toBe(imgs[(r * 4 + i * 5) % 13]))
    })
  })

  it('uses every image when there are enough slots', () => {
    const imgs = Array.from({ length: 13 }, (_, i) => `e${i}`)
    expect(new Set(collageRows(imgs).flat())).toEqual(new Set(imgs))
  })

  it('returns no rows without images', () => {
    expect(collageRows([])).toEqual([])
  })
})
