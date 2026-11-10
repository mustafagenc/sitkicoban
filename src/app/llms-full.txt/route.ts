import {
  getAnasayfa,
  getDersler,
  getEserler,
  getHayati,
  getHocalar,
  getKitaplar,
  getSiteAyarlari,
  getVideolar,
  getYazi,
  getYaziTurleri,
  getYazilar,
} from '@/lib/data'
import { bugunIstanbul, llmsFullTxt, satir } from '@/lib/llms'
import { SITE_NAME } from '@/lib/seo'
import { siteUrl } from '@/lib/site'
import type { Yazilar } from '@/payload-types'

// /llms.txt'nin tam içerikli eşi. Statik üretilir; veri `unstable_cache` etiketleriyle gelir ve ilgili
// kayıtta yeniden ısıtılır (LLMS_FULL_TAGS, src/lib/cache/revalidate.ts). Ziyaretçi isteği sorgu göndermez.
// Yazı gövdeleri yazı detay sayfalarıyla aynı önbellekten (getYazi) gelir.
export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const [anasayfa, hayati, hocalar, kitaplar, dersler, yaziTurleri, liste, eserler, videolar, ayarlar] = await Promise.all([
    getAnasayfa('en'),
    getHayati('tr'),
    getHocalar('tr'),
    getKitaplar('tr'),
    getDersler('tr'),
    getYaziTurleri('tr'),
    getYazilar('tr'),
    getEserler('tr'),
    getVideolar('tr'),
    getSiteAyarlari('tr'),
  ])
  const yazilar = (
    await Promise.all(
      liste.map((y) => (typeof y.slug === 'string' && y.slug ? getYazi(y.slug, 'tr') : Promise.resolve(null))),
    )
  ).filter((y): y is Yazilar => y !== null)

  const metin = llmsFullTxt({
    base: siteUrl(),
    bugun: bugunIstanbul(),
    aciklama: satir(anasayfa.metaAciklama) || `Official website of ${SITE_NAME}, Turkish calligrapher (hattat).`,
    hayati,
    hocalar,
    kitaplar,
    dersler,
    yaziTurleri,
    yazilar,
    eserler,
    videolar,
    ayarlar,
  })

  return new Response(metin, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
