import { afterEach, describe, expect, it } from 'vitest'

import { localizedPath } from '@/i18n/config'
import { webSayfasi } from '@/lib/jsonld'
import { sayfaMeta } from '@/lib/seo'

const savedSiteUrl = process.env.SITE_URL

describe('seo ve arama önizleme görseli', () => {
  afterEach(() => {
    if (savedSiteUrl === undefined) delete process.env.SITE_URL
    else process.env.SITE_URL = savedSiteUrl
  })

  it('özel görsel verilmeyen sayfalarda kare imza thumbnail.jpg tanımlar', () => {
    process.env.SITE_URL = 'https://sitkicoban.com'
    const meta = sayfaMeta({ locale: 'tr', yol: (l) => localizedPath('home', l), aciklama: 'Hattat Sıtkı Çoban' })

    expect(meta.other).toEqual({ thumbnail: 'https://sitkicoban.com/thumbnail.jpg' })
    expect(meta.openGraph?.images).toEqual([
      { url: 'https://sitkicoban.com/og.jpg', width: 1200, height: 630, alt: 'Sıtkı Çoban' },
      { url: 'https://sitkicoban.com/thumbnail.jpg', width: 1200, height: 1200, alt: 'Sıtkı Çoban' },
    ])
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      images: [{ url: 'https://sitkicoban.com/og.jpg', width: 1200, height: 630, alt: 'Sıtkı Çoban' }],
    })
  })

  it('özel görsel verilen sayfalarda o görseli thumbnail olarak kullanır', () => {
    process.env.SITE_URL = 'https://sitkicoban.com'
    const meta = sayfaMeta({
      locale: 'tr',
      yol: (l) => localizedPath('hayati', l),
      baslik: 'Hayatı',
      gorsel: { url: '/media/portre.jpg', alt: 'Sıtkı Çoban portresi' },
    })

    expect(meta.other).toEqual({ thumbnail: 'https://sitkicoban.com/media/portre.jpg' })
    expect(meta.openGraph?.images).toEqual([
      { url: 'https://sitkicoban.com/media/portre.jpg', alt: 'Sıtkı Çoban portresi' },
    ])
  })

  it('webSayfasi JSON-LD içinde primaryImageOfPage olarak 1200x1200 thumbnail.jpg bildirir', () => {
    process.env.SITE_URL = 'https://sitkicoban.com'
    const ld = webSayfasi({ locale: 'tr', aciklama: 'Hattat' })

    expect(ld).toMatchObject({
      '@type': 'WebPage',
      url: 'https://sitkicoban.com/',
      thumbnailUrl: 'https://sitkicoban.com/thumbnail.jpg',
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: 'https://sitkicoban.com/thumbnail.jpg',
        width: 1200,
        height: 1200,
      },
    })
  })
})
