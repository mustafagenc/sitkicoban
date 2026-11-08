// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { readingTime } from '@/lib/readingTime'
import { RichText, headings } from '@/lib/richtext'

const text = (t: string, format = 0) => ({ type: 'text', version: 1, text: t, format, detail: 0, mode: 'normal', style: '' })
const p = (...children: unknown[]) => ({ type: 'paragraph', version: 1, children, direction: 'ltr', format: '', indent: 0, textFormat: 0 })
const h = (tag: 'h2' | 'h3', t: string) => ({ type: 'heading', tag, version: 1, children: [text(t)], direction: 'ltr', format: '', indent: 0 })
const block = (fields: Record<string, unknown>) => ({ type: 'block', version: 2, format: '', fields: { id: 'x', blockName: '', ...fields } })
const doc = (...children: unknown[]) =>
  ({ root: { type: 'root', version: 1, children, direction: 'ltr', format: '', indent: 0 } }) as never

describe('readingTime', () => {
  it('is words / 200 rounded up', () => {
    const words = Array.from({ length: 450 }, (_, i) => `kelime${i}`).join(' ')
    expect(readingTime(doc(p(text(words))))).toBe(3)
  })

  it('is at least 1 and counts block meal and metin, not the Arabic line', () => {
    expect(readingTime(doc())).toBe(1)
    const many = (n: number) => Array.from({ length: n }, () => 'söz').join(' ')
    const d = doc(
      p(text(many(100))),
      block({ blockType: 'ayet', arapca: many(500), meal: many(100), kaynak: 'X' }),
      block({ blockType: 'oneCikanSoz', metin: many(1) }),
    )
    expect(readingTime(d)).toBe(2) // 201 words
  })
})

describe('RichText', () => {
  const body = doc(
    p(text('Giriş '), text('kalın', 1), text(' ve '), text('eğik', 2)),
    block({ blockType: 'ayet', arapca: 'قُلْ هُوَ اللّٰهُ أَحَدٌ', meal: 'De ki: O Allah birdir.', kaynak: 'İhlâs Sûresi · 1' }),
    h('h2', 'Bilmekten görmeye'),
    block({ blockType: 'oneCikanSoz', metin: 'Bilgi kapıyı gösterir.' }),
    {
      type: 'link',
      version: 3,
      fields: { linkType: 'custom', url: 'https://example.com', newTab: false },
      children: [text('dış bağlantı')],
      direction: 'ltr',
      format: '',
      indent: 0,
    },
  )

  it('renders the ayet block with an rtl Arabic line and heading ids', () => {
    const html = renderToStaticMarkup(<RichText data={body} locale="en" />)
    expect(html).toContain('<div class="ayet">')
    expect(html).toContain('<p class="ar" lang="ar" dir="rtl">قُلْ هُوَ اللّٰهُ أَحَدٌ</p>')
    expect(html).toContain('De ki: O Allah birdir.')
    expect(html).toContain('İhlâs Sûresi · 1')
    expect(html).toContain('<h2 id="bilmekten-gormeye">Bilmekten görmeye</h2>')
    expect(html).toContain('<blockquote class="pull">Bilgi kapıyı gösterir.</blockquote>')
    expect(html).toContain('<strong>kalın</strong>')
    expect(html).toContain('<em>eğik</em>')
    expect(html).toMatch(/<a href="https:\/\/example.com" rel="noopener"[^>]*>dış bağlantı<\/a>/)
  })

  it('deduplicates equal headings with -2 and lists them for the TOC', () => {
    const d = doc(h('h2', 'Üç Mertebe'), p(text('a')), h('h2', 'Üç Mertebe'), h('h3', 'Alt başlık'))
    const html = renderToStaticMarkup(<RichText data={d} locale="tr" />)
    expect(html).toContain('<h2 id="uc-mertebe">')
    expect(html).toContain('<h2 id="uc-mertebe-2">')
    expect(html).toContain('<h3 id="alt-baslik">')
    expect(headings(d)).toEqual([
      { id: 'uc-mertebe', text: 'Üç Mertebe' },
      { id: 'uc-mertebe-2', text: 'Üç Mertebe' },
    ])
  })

  it('renders nothing for empty data', () => {
    expect(renderToStaticMarkup(<RichText data={null} locale="tr" />)).toBe('')
  })
})
