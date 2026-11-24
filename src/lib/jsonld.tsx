import { localizedPath, type Locale } from '@/i18n/config'
import { mutlak, SITE_NAME, THUMBNAIL_DEFAULT } from '@/lib/seo'
import { siteUrl } from '@/lib/site'
import type { SiteAyarlari } from '@/payload-types'

/** schema.org yapılandırılmış verisi; arama motorlarının sayfayı anlaması için. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // `<` kaçırılır ki metin içindeki "</script>" etiketi kapatamasın.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

const sosyal = (a: Pick<SiteAyarlari, 'instagram' | 'facebook' | 'youtube'>) =>
  [a.instagram, a.facebook, a.youtube].filter((x): x is string => Boolean(x))

/** Sıtkı Çoban'ı tanımlayan Person; ana sayfa ve Hayatı'nda kullanılır. */
export function kisi(opts: {
  locale: Locale
  ayarlar: Pick<SiteAyarlari, 'instagram' | 'facebook' | 'youtube'>
  unvanlar?: string | null
  aciklama?: string | null
  portre?: string | null
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl()}/#kisi`,
    name: SITE_NAME,
    url: siteUrl() + localizedPath('home', opts.locale),
    ...(opts.unvanlar
      ? { jobTitle: opts.unvanlar.split('·').map((s) => s.trim()).filter(Boolean) }
      : {}),
    ...(opts.aciklama ? { description: opts.aciklama } : {}),
    ...(opts.portre ? { image: mutlak(opts.portre) } : {}),
    sameAs: sosyal(opts.ayarlar),
  }
}

/** Ana sayfa için WebPage: Google arama sonucu önizleme görselini (primaryImageOfPage) açıkça bildirir. */
export function webSayfasi(opts: {
  locale: Locale
  aciklama?: string | null
}): Record<string, unknown> {
  const url = siteUrl() + localizedPath('home', opts.locale)
  const gorselUrl = mutlak(THUMBNAIL_DEFAULT.url)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#sayfa`,
    url,
    name: SITE_NAME,
    inLanguage: opts.locale,
    ...(opts.aciklama ? { description: opts.aciklama } : {}),
    thumbnailUrl: gorselUrl,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: gorselUrl,
      width: THUMBNAIL_DEFAULT.width,
      height: THUMBNAIL_DEFAULT.height,
    },
    about: { '@id': `${siteUrl()}/#kisi` },
  }
}

/** Yazılar için Article. */
export function makale(opts: {
  url: string
  baslik: string
  ozet?: string | null
  yayin?: string | null
  guncelleme?: string | null
  kapak?: string | null
  locale: Locale
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.baslik,
    ...(opts.ozet ? { description: opts.ozet } : {}),
    ...(opts.yayin ? { datePublished: opts.yayin } : {}),
    ...(opts.guncelleme ? { dateModified: opts.guncelleme } : {}),
    ...(opts.kapak ? { image: mutlak(opts.kapak) } : {}),
    inLanguage: opts.locale,
    mainEntityOfPage: opts.url,
    author: { '@type': 'Person', '@id': `${siteUrl()}/#kisi`, name: SITE_NAME, url: siteUrl() },
  }
}

/** Eserler sayfası için VisualArtwork listesi; Google Görseller'de eser, hattat ve hat türünü ilişkilendirir. */
export function eserListesi(
  eserler: {
    baslik: string
    src: string
    width?: number | null
    height?: number | null
    yaziTurleri?: string[]
    tur?: string | null
    yil?: string | null
    malzeme?: string | null
    aciklama?: string | null
    anlam?: string | null
  }[],
  locale: Locale,
): Record<string, unknown> {
  const sanatci = { '@type': 'Person', '@id': `${siteUrl()}/#kisi`, name: SITE_NAME, url: siteUrl() }
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: eserler.map((e, i) => {
      const url = mutlak(e.src)
      const bicimler = [e.tur, ...(e.yaziTurleri ?? [])].filter((x): x is string => Boolean(x))
      const tanim = e.aciklama || e.anlam
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'VisualArtwork',
          name: e.baslik,
          creator: sanatci,
          inLanguage: locale,
          image: {
            '@type': 'ImageObject',
            url,
            contentUrl: url,
            creator: sanatci,
            ...(e.width ? { width: e.width } : {}),
            ...(e.height ? { height: e.height } : {}),
          },
          ...(bicimler.length > 0 ? { artform: bicimler } : {}),
          ...(e.malzeme ? { artMedium: e.malzeme } : {}),
          ...(e.yil ? { dateCreated: e.yil } : {}),
          ...(tanim ? { description: tanim } : {}),
        },
      }
    }),
  }
}

/** Kitaplar sayfası için Book listesi. */
export function kitapListesi(
  kitaplar: { baslik: string; yazar?: string | null; yayinevi?: string | null; yil?: string | null; isbn?: string | null; kapak?: string | null }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: kitaplar.map((k, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Book',
        name: k.baslik,
        author: { '@type': 'Person', name: k.yazar || SITE_NAME },
        ...(k.yayinevi ? { publisher: { '@type': 'Organization', name: k.yayinevi } } : {}),
        ...(k.yil ? { datePublished: k.yil } : {}),
        ...(k.isbn ? { isbn: k.isbn } : {}),
        ...(k.kapak ? { image: mutlak(k.kapak) } : {}),
      },
    })),
  }
}
