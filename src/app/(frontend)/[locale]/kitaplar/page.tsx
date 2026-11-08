import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BookShelf } from '@/components/BookShelf'
import { toBooks } from '@/components/books'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { isLocale } from '@/i18n/config'
import { toYazilar, yaziliKitaplar } from '@/components/yazilar'
import { getKitaplar, getSiteAyarlari, getUi, getYazilar } from '@/lib/data'

import '../../styles/kitaplar.css'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const ui = await getUi(locale)
  return { title: ui.navKitaplar ?? undefined, description: ui.kitaplarAciklama ?? undefined }
}

export default async function KitaplarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, kitaplar, yazilar] = await Promise.all([
    getUi(locale),
    getSiteAyarlari(locale),
    getKitaplar(locale),
    getYazilar(locale),
  ])

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="kitaplar" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{ui.kitaplarBaslik}</h1>
        <p>{ui.kitaplarAciklama}</p>
      </div>
      <BookShelf
        books={toBooks(kitaplar)}
        ui={ui}
        locale={locale}
        yazili={yaziliKitaplar(toYazilar(yazilar, ui, locale))}
      />
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
