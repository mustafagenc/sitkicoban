import { getAnasayfa, getDersler, getHayati, getHocalar, getKitaplar, getYaziTurleri, getYazilar } from '@/lib/data'
import { bugunIstanbul, llmsTxt, satir } from '@/lib/llms'
import { SITE_NAME } from '@/lib/seo'
import { siteUrl } from '@/lib/site'

// Statik üretilir; veri `unstable_cache` etiketleriyle gelir. Bir kayıt bu etiketleri geçersiz kılınca
// `/llms.txt` de ısıtılır (LLMS_TAGS, src/lib/cache/revalidate.ts), ziyaretçi isteği sorgu göndermez.
export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const [anasayfa, hayati, hocalar, kitaplar, dersler, yaziTurleri, yazilar] = await Promise.all([
    getAnasayfa('en'),
    getHayati('tr'),
    getHocalar('tr'),
    getKitaplar('tr'),
    getDersler('tr'),
    getYaziTurleri('tr'),
    getYazilar('tr'),
  ])

  const metin = llmsTxt({
    base: siteUrl(),
    bugun: bugunIstanbul(),
    aciklama: satir(anasayfa.metaAciklama) || `Official website of ${SITE_NAME}, Turkish calligrapher (hattat).`,
    hayati,
    hocalar,
    kitaplar,
    dersler,
    yaziTurleri,
    yazilar,
  })

  return new Response(metin, {
    // Markdown içerik; tarayıcıda indirilmek yerine görüntülensin diye text/plain.
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
