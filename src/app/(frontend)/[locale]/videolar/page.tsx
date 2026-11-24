import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { VideoGallery } from '@/components/VideoGallery'
import { toVideolar } from '@/components/videolar'
import { isLocale, localizedPath } from '@/i18n/config'
import { getSiteAyarlari, getUi, getVideoKategorileri, getVideoMetinleri, getVideolar } from '@/lib/data'

import '../../styles/videolar.css'
import { sayfaMeta } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const [ui, vm] = await Promise.all([getUi(locale), getVideoMetinleri(locale)])
  return sayfaMeta({ locale, yol: (l) => localizedPath('videolar', l), baslik: ui.navVideolar, aciklama: vm.videolarAciklama })
}

export default async function VideolarPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, vm, ayarlar, videolar, kategoriler] = await Promise.all([
    getUi(locale),
    getVideoMetinleri(locale),
    getSiteAyarlari(locale),
    getVideolar(locale),
    getVideoKategorileri(locale),
  ])

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="videolar" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{vm.videolarBaslik}</h1>
        <p>{vm.videolarAciklama}</p>
      </div>
      <main className="wrap videolar-sayfa">
        <VideoGallery
          videos={toVideolar(videolar, vm, locale)}
          kategoriler={kategoriler.map((k) => ({ id: k.id, ad: k.ad }))}
          ui={ui}
          vm={vm}
        />
      </main>
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
