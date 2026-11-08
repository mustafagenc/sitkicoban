import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { isLocale, localizedPath } from '@/i18n/config'
import { getIletisim, getSiteAyarlari, getUi } from '@/lib/data'
import { RichText } from '@/lib/richtext'

import '../../../styles/iletisim.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const [iletisim, ui] = await Promise.all([getIletisim(locale), getUi(locale)])
  const baslik = iletisim.metinler?.aydinlatmaBaslik || ui.navIletisim
  return { title: baslik || undefined }
}

export default async function AydinlatmaPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, iletisim] = await Promise.all([getUi(locale), getSiteAyarlari(locale), getIletisim(locale)])

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="iletisim" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{iletisim.metinler?.aydinlatmaBaslik}</h1>
      </div>
      <main className="wrap iletisim-metin">
        <div className="prose">
          <RichText data={iletisim.aydinlatmaMetni} locale={locale} />
        </div>
        <a className="back" href={localizedPath('iletisim', locale)}>
          {iletisim.metinler?.iletisimeDon}
        </a>
      </main>
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
