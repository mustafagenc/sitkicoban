import { notFound } from 'next/navigation'

import { BookShelf } from '@/components/BookShelf'
import { toBooks } from '@/components/books'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { isLocale } from '@/i18n/config'
import { getKitaplar, getSiteAyarlari, getUi } from '@/lib/data'

import '../../styles/kitaplar.css'

export default async function KitaplarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, kitaplar] = await Promise.all([
    getUi(locale),
    getSiteAyarlari(locale),
    getKitaplar(locale),
  ])

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="kitaplar" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{ui.kitaplarBaslik}</h1>
        <p>{ui.kitaplarAciklama}</p>
      </div>
      <BookShelf books={toBooks(kitaplar)} ui={ui} />
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
