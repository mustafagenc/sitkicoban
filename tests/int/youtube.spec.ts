import { describe, expect, it } from 'vitest'

import { youtubeId, youtubeThumb } from '@/lib/youtube'

describe('youtubeId', () => {
  it.each([
    'aLry4uypqxs',
    'https://youtu.be/aLry4uypqxs',
    'https://www.youtube.com/watch?v=aLry4uypqxs&t=3',
    'https://youtube.com/shorts/aLry4uypqxs',
    'https://www.youtube.com/embed/aLry4uypqxs',
    'https://m.youtube.com/watch?v=aLry4uypqxs',
    '  aLry4uypqxs  ',
  ])('extracts the id from %s', (input) => {
    expect(youtubeId(input)).toBe('aLry4uypqxs')
  })

  it.each([
    'https://example.com',
    'https://example.com/watch?v=aLry4uypqxs',
    'abc',
    '',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/channel/aLry4uypqxs',
    'aLry4uypqx!',
  ])('returns null for %s', (input) => {
    expect(youtubeId(input)).toBeNull()
  })
})

describe('youtubeThumb', () => {
  it('points at i.ytimg.com hqdefault', () => {
    expect(youtubeThumb('aLry4uypqxs')).toBe('https://i.ytimg.com/vi/aLry4uypqxs/hqdefault.jpg')
  })
})
