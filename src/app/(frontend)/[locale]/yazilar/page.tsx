import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PostList } from '@/components/PostList'
import { toYazilar } from '@/components/yazilar'
import { dir, isLocale, localizedPath } from '@/i18n/config'
import { getSiteAyarlari, getUi, getYaziKategorileri, getYazilar } from '@/lib/data'

import '../../styles/yazilar.css'

export default async function YazilarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, yazilar, kategoriler] = await Promise.all([
    getUi(locale),
    getSiteAyarlari(locale),
    getYazilar(locale),
    getYaziKategorileri(locale),
  ])

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="yazilar" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{ui.yazilarBaslik}</h1>
        <p>{ui.yazilarAciklama}</p>
      </div>
      <main className="wrap yazilar-sayfa">
        <PostList
          posts={toYazilar(yazilar, ui, locale)}
          kategoriler={kategoriler.map((k) => ({ id: k.id, ad: k.ad }))}
          ui={ui}
          listHref={localizedPath('yazilar', locale)}
          rtl={dir(locale) === 'rtl'}
        />
      </main>
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
