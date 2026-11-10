import { LOCALES, localizedPath, yaziPath, type Locale, type PageKey } from '@/i18n/config'
import { getAnasayfa, getYazilar } from '@/lib/data'
import { SITE_NAME } from '@/lib/seo'
import { siteUrl } from '@/lib/site'

// Statik üretilir; veri `unstable_cache` etiketleriyle gelir. Bir kayıt bu etiketleri geçersiz kılınca
// `/llms.txt` de ısıtılır (LLMS_TAGS, src/lib/cache/revalidate.ts), ziyaretçi isteği sorgu göndermez.
export const dynamic = 'force-static'

const SAYFALAR: { key: PageKey; ad: string; not: string }[] = [
  { key: 'home', ad: 'Home', not: 'Overview: selected works, books, lessons, writings and videos' },
  { key: 'eserler', ad: 'Works', not: 'Calligraphy works (hat)' },
  { key: 'kitaplar', ad: 'Books', not: 'Published books' },
  { key: 'yazilar', ad: 'Writings', not: 'Articles and essays' },
  { key: 'videolar', ad: 'Videos', not: 'Video recordings' },
  { key: 'hayati', ad: 'Biography', not: 'Life, teachers and icazet (calligraphy licence) lineage' },
  { key: 'iletisim', ad: 'Contact', not: 'Contact form' },
  { key: 'aydinlatma', ad: 'Privacy notice', not: 'KVKK privacy notice for the contact form' },
]

const DIL: Record<Locale, string> = { tr: 'Türkçe', en: 'English', ar: 'العربية' }

/** Tek satıra indirir: Markdown liste öğesini bozmasın. */
const satir = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim()

export async function GET(): Promise<Response> {
  const base = siteUrl()
  const [anasayfa, yazilar] = await Promise.all([getAnasayfa('en'), getYazilar('tr')])

  const aciklama = satir(anasayfa.metaAciklama) || `Official website of ${SITE_NAME}, Turkish calligrapher (hattat).`

  const out: string[] = [
    `# ${SITE_NAME}`,
    '',
    `> ${aciklama}`,
    '',
    `Every page is available in ${LOCALES.map((l) => DIL[l]).join(', ')}. Turkish is the default (no prefix); English and Arabic use the /en and /ar prefixes.`,
    '',
    '## Pages',
    '',
    ...SAYFALAR.map(({ key, ad, not }) => {
      const diller = LOCALES.map((l) => `[${l}](${base}${localizedPath(key, l)})`).join(' · ')
      return `- [${ad}](${base}${localizedPath(key, 'en')}): ${not} (${diller})`
    }),
  ]

  if (yazilar.length) {
    out.push('', '## Writings (Turkish)', '')
    for (const y of yazilar) {
      if (typeof y.slug !== 'string' || !y.slug) continue
      const ozet = satir(y.ozet)
      out.push(`- [${satir(y.baslik)}](${base}${yaziPath(y.slug, 'tr')})${ozet ? `: ${ozet}` : ''}`)
    }
  }

  out.push('', '## Optional', '', `- [Sitemap](${base}/sitemap.xml): every page and writing in all languages`, '')

  return new Response(out.join('\n'), {
    // Markdown içerik; tarayıcıda indirilmek yerine görüntülensin diye text/plain.
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
