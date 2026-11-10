import { toBooks, type BookRole } from '@/components/books'
import { aktifDersler } from '@/components/dersler'
import { toWorks } from '@/components/works'
import { LOCALES, localizedPath, yaziPath, type Locale, type PageKey } from '@/i18n/config'
import { SITE_NAME } from '@/lib/seo'
import { youtubeId, youtubeWatch } from '@/lib/youtube'
import type {
  Dersler,
  Eserler,
  Hayati,
  Hocalar,
  Kitaplar,
  SiteAyarlari,
  VideoKategorileri,
  Videolar,
  YaziKategorileri,
  YaziTurleri,
  Yazilar,
} from '@/payload-types'

/*
 * /llms.txt ve /llms-full.txt metinleri (llmstxt.org). Saf fonksiyonlar: veriyi rotalar önbellekli
 * getter'lardan getirir, burada yalnızca Markdown üretilir. Kural: satın alma bağlantısı (satinAlLinki),
 * form hedef e-postası, yorumlar ve abone verisi asla yazılmaz; site e-postası dışındaki e-postalar ayıklanır.
 */

export type LlmsVeri = {
  base: string
  /** YYYY-MM-DD (İstanbul); bitişi bundan önce olan dersler yazılmaz. */
  bugun: string
  aciklama: string
  hayati: Hayati | null
  hocalar: Hocalar[]
  kitaplar: Kitaplar[]
  dersler: Dersler[]
  yaziTurleri: YaziTurleri[]
  /** Yayındaki yazılar (liste; gövde gerekmez). */
  yazilar: Yazilar[]
}

export type LlmsFullVeri = LlmsVeri & {
  eserler: Eserler[]
  videolar: Videolar[]
  /** Yayındaki yazılar, gövdeleriyle. */
  yazilar: Yazilar[]
  ayarlar: SiteAyarlari | null
}

const SAYFALAR: { key: PageKey; ad: string; not: string }[] = [
  { key: 'home', ad: 'Home', not: 'Overview: selected works, books, lessons, writings and videos' },
  { key: 'eserler', ad: 'Works', not: 'Calligraphy works (hat)' },
  { key: 'kitaplar', ad: 'Books', not: 'Published books' },
  { key: 'yazilar', ad: 'Writings', not: 'Articles and essays' },
  { key: 'videolar', ad: 'Videos', not: 'Video recordings' },
  { key: 'hayati', ad: 'Biography', not: 'Life, teachers and icazet (calligraphy licence) lineage' },
  { key: 'iletisim', ad: 'Contact', not: 'Contact form' },
  { key: 'bulten', ad: 'Newsletter', not: 'Subscribe to e-mail or browser notifications about new works, books, writings and videos' },
  {
    key: 'aydinlatma',
    ad: 'Privacy notice',
    not: 'KVKK privacy notice for the contact form, newsletter, browser notifications and comments',
  },
]

const DIL: Record<Locale, string> = { tr: 'Türkçe', en: 'English', ar: 'العربية' }

const ROL: Record<BookRole, string> = {
  yazar: 'Author',
  hazirlayan: 'Editor (prepared by Sıtkı Çoban)',
  sadelestiren: 'Simplified by Sıtkı Çoban',
  derleyen: 'Compiled by Sıtkı Çoban',
}

/** Tek satıra indirir: Markdown liste öğesini bozmasın. */
export const satir = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim()

/** En çok `n` karakter; sözcük ortasında kesmez, "…" ekler. */
export function kisalt(s: string, n = 160): string {
  if (s.length <= n) return s
  const kes = s.slice(0, n - 1)
  const bosluk = kes.lastIndexOf(' ')
  return `${(bosluk > n * 0.6 ? kes.slice(0, bosluk) : kes).replace(/[\s,;:.–—-]+$/, '')}…`
}

const obj = <T extends object>(v: unknown): T | null => (v && typeof v === 'object' ? (v as T) : null)

// ---------------------------------------------------------------------------------------------
// Lexical → Markdown

type Node = {
  type?: string
  tag?: string
  text?: unknown
  format?: unknown
  listType?: string
  children?: Node[]
  fields?: Record<string, unknown>
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')

function satirIci(nodes: Node[] | undefined, base: string): string {
  return (nodes ?? [])
    .map((n) => {
      if (n.type === 'text') {
        let t = str(n.text)
        const f = typeof n.format === 'number' ? n.format : 0
        if (!t.trim()) return t
        if (f & 16) t = `\`${t}\``
        if (f & 1) t = `**${t}**`
        if (f & 2) t = `*${t}*`
        return t
      }
      if (n.type === 'linebreak') return '\n'
      if (n.type === 'tab') return ' '
      if (n.type === 'link' || n.type === 'autolink') {
        const fields = (n.fields ?? {}) as { url?: string; linkType?: string; doc?: { relationTo?: string; value?: unknown } }
        let href = ''
        if (fields.linkType === 'internal') {
          const slug = obj<{ slug?: unknown }>(fields.doc?.value)?.slug
          if (fields.doc?.relationTo === 'yazilar' && typeof slug === 'string' && slug) href = base + yaziPath(slug, 'tr')
        } else href = str(fields.url)
        const ic = satirIci(n.children, base)
        if (!href || /^mailto:/i.test(href)) return ic
        return `[${ic}](${href.startsWith('/') ? base + href : href})`
      }
      return satirIci(n.children, base)
    })
    .join('')
}

function liste(node: Node, base: string, derinlik: number): string[] {
  const out: string[] = []
  let i = 0
  const girinti = '  '.repeat(derinlik)
  for (const li of node.children ?? []) {
    const alt = (li.children ?? []).filter((c) => c.type === 'list')
    const ic = satirIci((li.children ?? []).filter((c) => c.type !== 'list'), base).trim()
    if (ic) {
      i += 1
      out.push(`${girinti}${node.listType === 'number' ? `${i}.` : '-'} ${ic.replace(/\n/g, ' ')}`)
    }
    for (const a of alt) out.push(...liste(a, base, derinlik + 1))
  }
  return out
}

export type MdSecenek = {
  base: string
  /** h2 → bu düzey (ör. 4: "####"); alt başlıklar sırayla bir düzey aşağı. */
  baslikDuzeyi?: number
  /** Hoca kartları bloğu (Hayatı) yerine yazılacak Markdown. */
  hocaKartlari?: string
}

/** Lexical gövdesini düz Markdown'a çevirir: başlıklar, paragraflar, listeler, alıntılar, Âyet ve Öne çıkan söz. */
export function lexicalMarkdown(data: unknown, secenek: MdSecenek): string {
  const root = (data as { root?: Node } | null | undefined)?.root
  if (!root) return ''
  const { base, baslikDuzeyi = 2, hocaKartlari = '' } = secenek
  const bloklar: string[] = []
  for (const n of root.children ?? []) {
    switch (n.type) {
      case 'heading': {
        const sira = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].indexOf(n.tag ?? 'h2')
        const duzey = Math.min(6, baslikDuzeyi + Math.max(0, sira - 1))
        const t = satir(satirIci(n.children, base))
        if (t) bloklar.push(`${'#'.repeat(duzey)} ${t}`)
        break
      }
      case 'list': {
        const l = liste(n, base, 0)
        if (l.length) bloklar.push(l.join('\n'))
        break
      }
      case 'quote': {
        const t = satirIci(n.children, base).trim()
        if (t) bloklar.push(t.split('\n').map((s) => `> ${s}`).join('\n'))
        break
      }
      case 'horizontalrule':
        bloklar.push('---')
        break
      case 'block': {
        const f = n.fields ?? {}
        if (f.blockType === 'ayet') {
          const satirlar = [str(f.arapca), str(f.meal), str(f.kaynak) && `— ${str(f.kaynak)}`].map(satir).filter(Boolean)
          if (satirlar.length) bloklar.push(satirlar.map((s) => `> ${s}`).join('\n>\n'))
        } else if (f.blockType === 'oneCikanSoz') {
          const t = satir(str(f.metin))
          if (t) bloklar.push(`> ${t}`)
        } else if (f.blockType === 'hocaKartlari' && hocaKartlari) {
          bloklar.push(hocaKartlari)
        }
        break
      }
      case 'upload':
        break
      default: {
        const t = satirIci(n.children, base).trim()
        if (t) bloklar.push(t.replace(/\n/g, '  \n'))
      }
    }
  }
  return bloklar.join('\n\n')
}

// ---------------------------------------------------------------------------------------------
// Ortak parçalar

const E_POSTA = /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}/gi

/** Site iletişim e-postası dışındaki e-posta adreslerini ayıklar. */
export function epostaAyikla(metin: string, izinli: string | null | undefined): string {
  const izin = (izinli ?? '').trim().toLowerCase()
  return metin.replace(E_POSTA, (m) => (izin && m.toLowerCase() === izin ? m : '[e-mail removed]'))
}

/** Lexical gövdesinin düz metni (biyografi özeti için). */
function duzMetin(data: unknown): string {
  const yuru = (n: Node): string =>
    n.type === 'text' ? str(n.text) : ` ${(n.children ?? []).map(yuru).join('')} `
  const root = (data as { root?: Node } | null | undefined)?.root
  return root ? satir(yuru(root)) : ''
}

const cumleler = (s: string): string[] =>
  satir(s)
    .split(/(?<=[.!?…])\s+(?=[A-ZÇĞİÖŞÜÂÎÛ“"'(])/u)
    .map((c) => c.trim())
    .filter(Boolean)

const hocaSatiri = (h: Hocalar): string => `${satir(h.ad)}${satir(h.kalemler) ? ` (${satir(h.kalemler)})` : ''}`

/** 2–4 cümlelik biyografi özeti: giriş cümlesi, ana sayfa özeti, hocalar. Veri yoksa boş. */
export function biyografiOzeti(hayati: Hayati | null, hocalar: Hocalar[]): string {
  const parcalar: string[] = []
  if (hayati) {
    const giris = satir(hayati.girisCumlesi)
    if (giris) parcalar.push(/[.!?…]$/.test(giris) ? giris : `${giris}.`)
    parcalar.push(...cumleler(duzMetin(hayati.anasayfaOzet)).slice(0, giris ? 2 : 3))
  }
  const ozet = parcalar.slice(0, 3)
  const adlar = hocalar.map(hocaSatiri).filter(Boolean)
  if (adlar.length) ozet.push(`Teachers: ${adlar.join('; ')}.`)
  return ozet.join(' ')
}

/** Bitmemiş dersler (WebMCP ile aynı kural: bitiş boş ya da bugün/sonrası); sıra korunur. */
const guncelDersler = (dersler: Dersler[], bugun: string): Dersler[] =>
  dersler.filter((d) => !d.bitis || aktifDersler([{ bitis: String(d.bitis) }], bugun).length > 0)

const dersSatiri = (d: Dersler): string => {
  const ad = [satir(d.kurum), satir(d.baslik)].filter(Boolean).join(' — ')
  const alt = satir(d.altBaslik)
  const zaman = [satir(d.gun), satir(d.saat)].filter(Boolean).join(', ')
  const ayrinti = [zaman, satir(d.yer)].filter(Boolean).join('; ')
  const bitis = typeof d.bitis === 'string' && d.bitis ? ` (until ${d.bitis.slice(0, 10)})` : ''
  return `${ad}${alt ? ` (${alt})` : ''}${ayrinti ? `: ${ayrinti}` : ''}${bitis}`
}

function ustKisim(v: LlmsVeri, ozetli: boolean): string[] {
  const out = [`# ${SITE_NAME}`, '', `> ${v.aciklama}`, '']
  const ozet = ozetli ? biyografiOzeti(v.hayati, v.hocalar) : ''
  if (ozet) out.push(ozet, '')
  out.push(
    `Every page is available in ${LOCALES.map((l) => DIL[l]).join(', ')}. Turkish is the default (no prefix); English and Arabic use the /en and /ar prefixes. Content below is quoted in its original language (mostly Turkish).`,
    '',
  )
  const turler = v.yaziTurleri.map((t) => satir(t.ad)).filter(Boolean)
  if (turler.length)
    out.push(`Works are calligraphy pieces in these scripts: ${turler.join(', ')}; see [Works](${v.base}${localizedPath('eserler', 'en')}).`, '')
  return out
}

const sayfaUrl = (base: string, key: PageKey, l: Locale = 'tr') => base + localizedPath(key, l)

// ---------------------------------------------------------------------------------------------
// /llms.txt

export function llmsTxt(v: LlmsVeri): string {
  const { base } = v
  const out = ustKisim(v, true)

  out.push('## Pages', '')
  for (const { key, ad, not } of SAYFALAR) {
    const diller = LOCALES.map((l) => `[${l}](${sayfaUrl(base, key, l)})`).join(' · ')
    out.push(`- [${ad}](${sayfaUrl(base, key, 'en')}): ${not} (${diller})`)
  }

  const kitaplar = toBooks(v.kitaplar)
  if (kitaplar.length) {
    out.push('', '## Books (Turkish)', '')
    for (const b of kitaplar) {
      const not = kisalt([b.altBaslik, b.aciklama].map(satir).filter(Boolean).join('. '))
      out.push(`- [${satir(b.baslik)}](${sayfaUrl(base, 'kitaplar')})${not ? `: ${not}` : ''}`)
    }
  }

  const dersler = guncelDersler(v.dersler, v.bugun)
  if (dersler.length) {
    out.push('', '## Lessons', '')
    for (const d of dersler) out.push(`- [${dersSatiri(d)}](${sayfaUrl(base, 'home')})`)
    out.push(`- [Registration](${sayfaUrl(base, 'iletisim')}?konu=mesk): via the contact form`)
  }

  if (v.yazilar.length) {
    out.push('', '## Writings (Turkish)', '')
    for (const y of v.yazilar) {
      if (typeof y.slug !== 'string' || !y.slug) continue
      const ozet = satir(y.ozet)
      out.push(`- [${satir(y.baslik)}](${base}${yaziPath(y.slug, 'tr')})${ozet ? `: ${ozet}` : ''}`)
    }
  }

  out.push(
    '',
    '## Optional',
    '',
    `- [Full content](${base}/llms-full.txt): biography, books, works, lessons, videos and the full text of every writing in one Markdown file`,
    `- [Sitemap](${base}/sitemap.xml): every page and writing in all languages`,
    '',
  )
  return epostaAyikla(out.join('\n'), null)
}

// ---------------------------------------------------------------------------------------------
// /llms-full.txt

/** "- Etiket: değer" satırı; çok satırlı değerin satırları "; " ile birleşir. Boşsa hiç yazılmaz. */
const alan = (etiket: string, deger: string | null | undefined): string[] => {
  const d = (deger ?? '').split(/\s*\n\s*/).map(satir).filter(Boolean).join('; ')
  return d ? [`- ${etiket}: ${d}`] : []
}

export function llmsFullTxt(v: LlmsFullVeri): string {
  const { base } = v
  const out = ustKisim(v, false)

  // Biyografi
  const h = v.hayati
  const hocaListesi = v.hocalar
    .map((x) => {
      const ac = satir(x.sayfaAciklama) || satir(x.aciklama)
      return `- **${satir(x.ad)}**${satir(x.kalemler) ? ` (${satir(x.kalemler)})` : ''}${ac ? `: ${ac}` : ''}`
    })
    .join('\n')
  if (h) {
    out.push('## Biography (Turkish)', '', `Source: ${sayfaUrl(base, 'hayati')}`, '')
    if (satir(h.girisCumlesi)) out.push(satir(h.girisCumlesi), '')
    const kunye = (h.kunye ?? []).flatMap((k) => alan(satir(k.etiket), k.deger))
    if (kunye.length) out.push(...kunye, '')
    for (const b of h.bolumler ?? []) {
      if (satir(b.baslik)) out.push(`### ${satir(b.baslik)}`, '')
      const md = lexicalMarkdown(b.govde, { base, baslikDuzeyi: 4, hocaKartlari: hocaListesi })
      if (md) out.push(md, '')
    }
    if (satir(h.kapanis)) out.push(`> ${satir(h.kapanis)}`, '')
  }

  if (hocaListesi) out.push('## Teachers (Turkish)', '', hocaListesi, '')

  // Kitaplar
  const kitaplar = toBooks(v.kitaplar)
  if (kitaplar.length) {
    out.push('## Books (Turkish)', '', `Source: ${sayfaUrl(base, 'kitaplar')}`, '')
    for (const b of kitaplar) {
      out.push(`### ${satir(b.baslik)}`, '')
      const ust = [
        ...alan('Subtitle', b.altBaslik),
        ...alan('Role', b.rol ? ROL[b.rol] : null),
        ...alan('Original author', b.asilYazar),
        ...alan('Publisher', b.yayinevi),
        ...alan('Year', b.yil),
        ...alan('Pages', b.sayfa),
        ...alan('ISBN', b.isbn),
      ]
      if (ust.length) out.push(...ust, '')
      if (b.aciklama) out.push(b.aciklama.trim(), '')
    }
  }

  // Eserler
  const eserler = toWorks(v.eserler)
  if (eserler.length) {
    out.push('## Works (Turkish)', '', `Source: ${sayfaUrl(base, 'eserler')}`, '')
    for (const w of eserler) {
      out.push(`### ${satir(w.baslik)}`, '')
      const ust = [
        ...alan('Script', w.yaziTurleri.join(', ')),
        ...alan('Type', w.tur),
        ...alan('Year', w.yil),
        ...alan('Text', w.metin),
        ...alan('Meaning', w.anlam),
        ...alan('Source', w.kaynak),
        ...alan('Dimensions', w.olcu),
        ...alan('Material', w.malzeme),
        ...alan('Illumination (tezhip)', w.tezhip),
        ...alan('Marbling (ebru)', w.ebru),
      ]
      if (ust.length) out.push(...ust, '')
      if (w.aciklama) out.push(w.aciklama, '')
    }
  }

  // Dersler
  const dersler = guncelDersler(v.dersler, v.bugun)
  if (dersler.length) {
    out.push('## Lessons (Turkish)', '')
    for (const d of dersler) {
      out.push(`### ${[satir(d.kurum), satir(d.baslik)].filter(Boolean).join(' — ')}`, '')
      const ust = [
        ...alan('Subtitle', d.altBaslik),
        ...alan('Day', d.gun),
        ...alan('Time', d.saat),
        ...alan('Place', d.yer),
        ...alan('Capacity', d.kontenjan),
        ...alan('Until', typeof d.bitis === 'string' ? d.bitis.slice(0, 10) : null),
      ]
      if (ust.length) out.push(...ust, '')
      if (satir(d.aciklama)) out.push(d.aciklama!.trim(), '')
    }
    out.push(`Registration: ${sayfaUrl(base, 'iletisim')}?konu=mesk`, '')
  }

  // Videolar
  const videolar = v.videolar.flatMap((d) => {
    const id = youtubeId(d.youtube)
    return id ? [{ d, url: youtubeWatch(id) }] : []
  })
  if (videolar.length) {
    out.push('## Videos (Turkish)', '', `Source: ${sayfaUrl(base, 'videolar')}`, '')
    for (const { d, url } of videolar) {
      out.push(`### ${satir(d.baslik)}`, '')
      const ust = [
        ...alan('Subtitle', d.altBaslik),
        ...alan('Category', obj<VideoKategorileri>(d.kategori)?.ad),
        ...alan('Series', d.seri ? `${satir(d.seri)}${typeof d.bolum === 'number' ? ` #${d.bolum}` : ''}` : null),
        ...alan('Duration', d.sure),
        ...alan('Date', typeof d.tarih === 'string' ? d.tarih.slice(0, 10) : null),
        ...alan('Channel', d.kanal),
        `- YouTube: ${url}`,
      ]
      out.push(...ust, '')
      if (satir(d.aciklama)) out.push(d.aciklama!.trim(), '')
    }
  }

  // Yazılar
  const yazilar = v.yazilar.filter((y): y is Yazilar & { slug: string } => typeof y.slug === 'string' && !!y.slug)
  if (yazilar.length) {
    out.push('## Writings (Turkish)', '')
    for (const y of yazilar) {
      out.push(`### ${satir(y.baslik)}`, '')
      const ust = [
        `- URL: ${base}${yaziPath(y.slug, 'tr')}`,
        ...alan('Date', typeof y.tarih === 'string' ? y.tarih.slice(0, 10) : null),
        ...alan('Category', obj<YaziKategorileri>(y.kategori)?.ad),
        ...alan('Related books', (y.ilgiliKitaplar ?? []).flatMap((k) => obj<Kitaplar>(k)?.baslik ?? []).join(', ')),
      ]
      out.push(...ust, '')
      if (satir(y.ozet)) out.push(`*${satir(y.ozet)}*`, '')
      const md = lexicalMarkdown(y.govde, { base, baslikDuzeyi: 4 })
      if (md) out.push(md, '')
      const kaynaklar = (y.kaynaklar ?? []).map((k) => satir(k.metin)).filter(Boolean)
      if (kaynaklar.length) out.push('Sources:', '', ...kaynaklar.map((k) => `- ${k}`), '')
    }
  }

  // İletişim: yalnızca herkese açık site e-postası ve sosyal bağlantılar.
  const a = v.ayarlar
  const eposta = satir(a?.eposta)
  out.push('## Contact', '', `- Contact form: ${sayfaUrl(base, 'iletisim', 'en')}`)
  if (eposta) out.push(`- E-mail: ${eposta}`)
  out.push(...alan('Instagram', a?.instagram), ...alan('Facebook', a?.facebook), ...alan('YouTube', a?.youtube))
  out.push(`- Newsletter: ${sayfaUrl(base, 'bulten', 'en')}`, '')

  out.push(
    '## Optional',
    '',
    `- [Summary](${base}/llms.txt): the concise index of this site`,
    `- [Sitemap](${base}/sitemap.xml): every page and writing in all languages`,
    '',
  )
  return epostaAyikla(out.join('\n'), eposta)
}

/** Bugünün tarihi (YYYY-MM-DD, İstanbul saatiyle). */
export const bugunIstanbul = (d = new Date()): string => d.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })
