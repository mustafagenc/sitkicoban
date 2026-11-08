import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { VideoGallery } from '@/components/VideoGallery'
import { toVideolar } from '@/components/videolar'
import { isLocale } from '@/i18n/config'
import { getSiteAyarlari, getUi, getVideoKategorileri, getVideolar } from '@/lib/data'

import '../../styles/videolar.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const ui = await getUi(locale)
  return { title: ui.navVideolar ?? undefined }
}

export default async function VideolarPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, videolar, kategoriler] = await Promise.all([
    getUi(locale),
    getSiteAyarlari(locale),
    getVideolar(locale),
    getVideoKategorileri(locale),
  ])

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="videolar" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{ui.videolarBaslik}</h1>
        <p>{ui.videolarAciklama}</p>
      </div>
      <main className="wrap videolar-sayfa">
        <VideoGallery
          videos={toVideolar(videolar, ui, locale)}
          kategoriler={kategoriler.map((k) => ({ id: k.id, ad: k.ad }))}
          ui={ui}
        />
      </main>
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
