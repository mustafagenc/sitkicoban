import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { WorksGallery } from '@/components/WorksGallery'
import { toWorks } from '@/components/works'
import type { Locale } from '@/i18n/config'
import { getEserler, getSiteAyarlari, getUi, getYaziTurleri } from '@/lib/data'

import '../../styles/eserler.css'

export default async function EserlerPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale
  const [ui, ayarlar, eserler, turler] = await Promise.all([
    getUi(locale),
    getSiteAyarlari(locale),
    getEserler(locale),
    getYaziTurleri(locale),
  ])

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="eserler" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{ui.eserlerBaslik}</h1>
        <p>{ui.eserlerAciklama}</p>
      </div>
      <WorksGallery
        works={toWorks(eserler)}
        yaziTurleri={turler.map((t) => t.ad)}
        ui={ui}
        locale={locale}
      />
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
