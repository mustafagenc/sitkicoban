import { describe, expect, it } from 'vitest'

import { biyografiOzeti, epostaAyikla, kisalt, lexicalMarkdown, llmsFullTxt, llmsTxt, type LlmsFullVeri } from '@/lib/llms'
import type { Dersler, Eserler, Hayati, Hocalar, Kitaplar, SiteAyarlari, Videolar, YaziTurleri, Yazilar } from '@/payload-types'

const BASE = 'https://ornek.test'

const p = (...children: unknown[]) => ({ type: 'paragraph', children })
const t = (text: string, format = 0) => ({ type: 'text', text, format })
const lex = (...children: unknown[]) => ({ root: { type: 'root', children } })

const hayati = {
  id: 1,
  girisCumlesi: 'Klasik meşk geleneğinin temsilcilerinden.',
  kunye: [{ etiket: 'Doğum', deger: 'Köyceğiz' }, { etiket: 'Eğitim', deger: 'Lisans\nYüksek lisans' }],
  bolumler: [
    {
      baslik: 'Hat yolculuğu',
      govde: lex(p(t('Hocalarından icazet aldı.')), { type: 'block', fields: { blockType: 'hocaKartlari' } }),
    },
  ],
  kapanis: 'Son söz.',
  anasayfaOzet: lex(p(t('Köyceğiz’de doğdu. Lisansını Trakya’da yaptı. Halen öğretmen. Dördüncü cümle.'))),
} as unknown as Hayati

const hocalar = [
  { id: 1, ad: 'Hasan Çelebi', kalemler: "Rik'a · Ta'lik", aciklama: 'Kısa.', sayfaAciklama: 'Uzun açıklama.' },
] as unknown as Hocalar[]

const kitaplar = [
  {
    id: 1,
    baslik: 'Hat Sanatı',
    altBaslik: 'Bir giriş',
    aciklama: 'Uzun bir açıklama '.repeat(30),
    satinAlLinki: 'https://magaza.test/satin-al',
    rol: 'yazar',
    yayinevi: 'Yayınevi',
  },
] as unknown as Kitaplar[]

const dersler = [
  { id: 1, kurum: 'Eski Kurum', baslik: 'Bitmiş ders', gun: 'Pazartesi', bitis: '2000-01-01T00:00:00.000Z' },
  { id: 2, kurum: 'ISMEK', baslik: 'Sülüs dersi', gun: 'Salı', saat: '10.00', yer: 'Üsküdar', bitis: '2999-01-01T00:00:00.000Z' },
] as unknown as Dersler[]

const yaziTurleri = [{ id: 1, ad: 'Sülüs' }, { id: 2, ad: 'Nesih' }] as unknown as YaziTurleri[]

const yazilar = [
  {
    id: 1,
    baslik: 'Zikir, Fikir, Dua',
    slug: 'zikir-fikir-dua',
    ozet: 'Kısa özet.',
    tarih: '2025-01-02T00:00:00.000Z',
    govde: lex(
      { type: 'heading', tag: 'h2', children: [t('Zikir')] },
      p(t('Dilin '), t('zikri', 1), t(' ve gizli@ornek.test adresi.')),
      { type: 'list', listType: 'bullet', children: [{ type: 'listitem', children: [t('bir')] }, { type: 'listitem', children: [t('iki')] }] },
      { type: 'block', fields: { blockType: 'ayet', arapca: 'الله', meal: 'Allah', kaynak: 'İhlâs 1' } },
    ),
    kaynaklar: [{ metin: 'Tefsir kaynağı' }],
  },
] as unknown as Yazilar[]

const eserler = [
  {
    id: 1,
    baslik: 'Hilye',
    gorsel: { url: '/media/h.jpg', filename: 'h.jpg', width: 100, height: 200 },
    yaziTurleri: [{ ad: 'Sülüs' }],
    yil: '2020',
    anlam: 'Övgü',
    olcu: '50 × 70 cm',
  },
] as unknown as Eserler[]

const videolar = [{ id: 1, baslik: 'Ders 1', youtube: 'https://youtu.be/dQw4w9WgXcQ', aciklama: 'Açıklama' }] as unknown as Videolar[]

const ayarlar = { id: 1, eposta: 'iletisim@ornek.test', formHedefEposta: 'gizli-hedef@ornek.test' } as unknown as SiteAyarlari

const veri: LlmsFullVeri = {
  base: BASE,
  bugun: '2026-11-11',
  aciklama: 'Hattat.',
  hayati,
  hocalar,
  kitaplar,
  dersler,
  yaziTurleri,
  yazilar,
  eserler,
  videolar,
  ayarlar,
}

describe('llms.txt', () => {
  const out = llmsTxt(veri)

  it('has the llmstxt.org shape: H1, blockquote, biography summary', () => {
    expect(out.startsWith('# Sıtkı Çoban\n\n> Hattat.\n')).toBe(true)
    expect(out).toContain('Klasik meşk geleneğinin temsilcilerinden. Köyceğiz’de doğdu. Lisansını Trakya’da yaptı.')
    expect(out).not.toContain('Dördüncü cümle')
    expect(out).toContain("Teachers: Hasan Çelebi (Rik'a · Ta'lik).")
    expect(out).toContain(`Works are calligraphy pieces in these scripts: Sülüs, Nesih; see [Works](${BASE}/en/works).`)
  })

  it('lists books linking to the books page, never the purchase link, description truncated', () => {
    expect(out).toContain(`## Books (Turkish)`)
    expect(out).toMatch(new RegExp(`- \\[Hat Sanatı\\]\\(${BASE}/kitaplar\\): Bir giriş\\. Uzun`))
    const satir = out.split('\n').find((l) => l.startsWith('- [Hat Sanatı]'))!
    expect(satir.length).toBeLessThan(260)
    expect(satir.endsWith('…')).toBe(true)
    expect(out).not.toContain('magaza.test')
    expect(llmsFullTxt(veri)).not.toContain('magaza.test')
  })

  it('lists only lessons that have not ended', () => {
    expect(out).toContain('## Lessons')
    expect(out).toContain('ISMEK — Sülüs dersi: Salı, 10.00; Üsküdar (until 2999-01-01)')
    expect(out).not.toContain('Bitmiş ders')
    expect(llmsFullTxt(veri)).not.toContain('Bitmiş ders')
    expect(llmsTxt({ ...veri, dersler: [dersler[0]] })).not.toContain('## Lessons')
  })

  it('lists the newsletter page, the updated privacy note and links llms-full.txt', () => {
    expect(out).toContain(`- [Newsletter](${BASE}/en/newsletter)`)
    expect(out).toContain(`[tr](${BASE}/bulten)`)
    expect(out).toContain('privacy notice for the contact form, newsletter, browser notifications and comments')
    expect(out).toContain(`- [Full content](${BASE}/llms-full.txt)`)
    expect(out).toContain(`- [Sitemap](${BASE}/sitemap.xml)`)
  })

  it('omits the biography summary and books when data is empty', () => {
    const bos = llmsTxt({ ...veri, hayati: null, hocalar: [], kitaplar: [] })
    expect(bos).not.toContain('Teachers:')
    expect(bos).not.toContain('## Books')
  })
})

describe('llms-full.txt', () => {
  const out = llmsFullTxt(veri)

  it('contains every section and the full writing body as Markdown', () => {
    for (const h of ['## Biography (Turkish)', '## Teachers (Turkish)', '## Books (Turkish)', '## Works (Turkish)', '## Lessons (Turkish)', '## Videos (Turkish)', '## Writings (Turkish)', '## Contact'])
      expect(out).toContain(h)
    expect(out).toContain('#### Zikir')
    expect(out).toContain('Dilin **zikri** ve')
    expect(out).toContain('- bir\n- iki')
    expect(out).toContain('> الله\n>\n> Allah\n>\n> — İhlâs 1')
    expect(out).toContain('- Tefsir kaynağı')
    expect(out).toContain(`- URL: ${BASE}/yazilar/zikir-fikir-dua`)
  })

  it('renders biography with teacher cards in place, works, books and videos', () => {
    expect(out).toContain('### Hat yolculuğu\n\nHocalarından icazet aldı.\n\n- **Hasan Çelebi** (Rik\'a · Ta\'lik): Uzun açıklama.')
    expect(out).toContain('- Doğum: Köyceğiz')
    expect(out).toContain('- Eğitim: Lisans; Yüksek lisans')
    expect(out).toContain('- Script: Sülüs')
    expect(out).toContain('- Dimensions: 50 × 70 cm')
    expect(out).toContain('- Meaning: Övgü')
    expect(out).toContain('- Role: Author')
    expect(out).toContain('Uzun bir açıklama Uzun bir açıklama')
    expect(out).toContain('- YouTube: https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  })

  it('shows only the public site e-mail: never the form target or e-mails inside texts', () => {
    expect(out).toContain('- E-mail: iletisim@ornek.test')
    expect(out).not.toContain('gizli-hedef@ornek.test')
    expect(out).not.toContain('gizli@ornek.test')
  })
})

describe('helpers', () => {
  it('kisalt cuts on a word boundary', () => {
    expect(kisalt('kısa')).toBe('kısa')
    const k = kisalt('kelime '.repeat(40), 50)
    expect(k.length).toBeLessThanOrEqual(50)
    expect(k.endsWith('kelime…')).toBe(true)
  })

  it('lexicalMarkdown handles empty input and nested lists', () => {
    expect(lexicalMarkdown(null, { base: BASE })).toBe('')
    const md = lexicalMarkdown(
      lex({
        type: 'list',
        listType: 'number',
        children: [
          { type: 'listitem', children: [t('a')] },
          { type: 'listitem', children: [{ type: 'list', listType: 'bullet', children: [{ type: 'listitem', children: [t('b')] }] }] },
        ],
      }),
      { base: BASE },
    )
    expect(md).toBe('1. a\n  - b')
  })

  it('epostaAyikla keeps only the allowed address', () => {
    expect(epostaAyikla('a@b.co ve c@d.co', 'C@d.co')).toBe('[e-mail removed] ve c@d.co')
  })

  it('biyografiOzeti is empty without data', () => {
    expect(biyografiOzeti(null, [])).toBe('')
  })
})
