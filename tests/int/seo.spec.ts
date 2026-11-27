import { afterEach, describe, expect, it } from 'vitest'

import { eserPath, localizedPath } from '@/i18n/config'
import { workAlt } from '@/components/works'
import { eserListesi, eserTekil, kisi, webSayfasi } from '@/lib/jsonld'
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

  it('eserListesi her eseri VisualArtwork ve ImageObject olarak yapılandırır', () => {
    process.env.SITE_URL = 'https://sitkicoban.com'
    const ld = eserListesi(
      [
        {
          baslik: 'Hilye-i Şerif',
          src: '/media/e-hilye.jpg',
          width: 1600,
          height: 2400,
          yaziTurleri: ['Sülüs', 'Nesih'],
          tur: 'Hilye',
          yil: '1441',
          malzeme: 'Aharlı kâğıt üzerine is mürekkebi',
          anlam: 'Hz. Peygamberin şemâili',
        },
      ],
      'tr',
    )

    expect(ld).toMatchObject({
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'VisualArtwork',
            name: 'Hilye-i Şerif',
            artform: ['Hilye', 'Sülüs', 'Nesih'],
            artMedium: 'Aharlı kâğıt üzerine is mürekkebi',
            dateCreated: '1441',
            description: 'Hz. Peygamberin şemâili',
            image: {
              '@type': 'ImageObject',
              url: 'https://sitkicoban.com/media/e-hilye.jpg',
              contentUrl: 'https://sitkicoban.com/media/e-hilye.jpg',
              width: 1600,
              height: 2400,
            },
          },
        },
      ],
    })
  })

  it('Blob adreslerini kanonik /media/ yoluna çevirir, eserTekil ve workAlt sanatçı adını içerir', () => {
    process.env.SITE_URL = 'https://sitkicoban.com'
    const ld = eserTekil(
      {
        slug: 'su-kasidesi',
        baslik: 'Su Kasîdesi',
        src: 'https://wjn36w8xqs8fmndf.public.blob.vercel-storage.com/e-su-kasidesi.jpg',
        width: 695,
        height: 1846,
        yaziTurleri: ["Rik'a", 'Sülüs'],
        tur: "Kıt'a",
        yil: '1441',
      },
      'tr',
    )
    expect(ld).toMatchObject({
      '@type': 'VisualArtwork',
      url: `https://sitkicoban.com${eserPath('su-kasidesi', 'tr')}`,
      creditText: 'Hattat Sıtkı Çoban',
      image: {
        url: 'https://sitkicoban.com/media/e-su-kasidesi.jpg',
        contentUrl: 'https://sitkicoban.com/media/e-su-kasidesi.jpg',
      },
    })
    expect(
      workAlt({ baslik: 'Su Kasîdesi', yaziTurleri: ["Rik'a"], tur: "Kıt'a", yil: '1441' }, 'tr'),
    ).toBe("Su Kasîdesi — Hattat Sıtkı Çoban (Rik'a · Kıt'a · 1441)")
    expect(kisi({ locale: 'tr', ayarlar: { instagram: null, facebook: null, youtube: null } })).toMatchObject({
      knowsAbout: expect.arrayContaining(['Hüsn-i Hat', 'Celî Sülüs']),
    })
  })
})
