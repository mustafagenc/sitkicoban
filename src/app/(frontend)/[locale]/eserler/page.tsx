import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { WorksGallery } from '@/components/WorksGallery'
import { toWorks } from '@/components/works'
import { isLocale, localizedPath } from '@/i18n/config'
import { getEserler, getSiteAyarlari, getUi, getYaziTurleri } from '@/lib/data'

import '../../styles/eserler.css'
import { sayfaMeta } from '@/lib/seo'
import { JsonLd, eserListesi } from '@/lib/jsonld'

const SAYFA_BASLIGI = {
  tr: 'Hat Eserleri',
  en: 'Calligraphy Works',
  ar: 'أعمال الخط العربي',
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const [ui, eserler] = await Promise.all([getUi(locale), getEserler(locale)])
  const ilk = toWorks(eserler)[0]
  return sayfaMeta({
    locale,
    yol: (l) => localizedPath('eserler', l),
    baslik: SAYFA_BASLIGI[locale] || ui.navEserler,
    aciklama: ui.eserlerAciklama,
    gorsel: ilk
      ? { url: ilk.kanonikSrc, width: ilk.width ?? undefined, height: ilk.height ?? undefined, alt: ilk.baslik }
      : null,
  })
}

export default async function EserlerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, eserler, turler] = await Promise.all([
    getUi(locale),
    getSiteAyarlari(locale),
    getEserler(locale),
    getYaziTurleri(locale),
  ])

  const works = toWorks(eserler)

  return (
    // Sayfa stilleri bu sınıfa kapsanır: istemci tarafı geçişte başka sayfalara sızmasın.
    <div className="eserler-sayfa">
      <Header locale={locale} ui={ui} activeKey="eserler" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{ui.eserlerBaslik}</h1>
        <p>{ui.eserlerAciklama}</p>
      </div>
      <JsonLd data={eserListesi(works, locale)} />
      <WorksGallery
        works={works}
        yaziTurleri={turler.map((t) => t.ad)}
        ui={ui}
        locale={locale}
      />
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </div>
  )
}
