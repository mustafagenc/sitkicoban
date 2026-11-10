import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BultenOnay } from '@/components/BultenOnay'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { isLocale, localizedPath } from '@/i18n/config'
import { getBulten, getSiteAyarlari, getUi } from '@/lib/data'
import { sayfaMeta } from '@/lib/seo'

import '../../../styles/iletisim.css'
import '../../../styles/bulten.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const bulten = await getBulten(locale)
  return {
    ...sayfaMeta({ locale, yol: (l) => localizedPath('bultenOnay', l), baslik: bulten.metinler?.onayBaslik }),
    // Kişiye özel bağlantıyla açılan bir işlem sayfası: aramada yeri yok.
    robots: { index: false, follow: true },
  }
}

/** Bülten onay sayfası: e-postadaki `?t=` belirtecini tarayıcıda okur ve onaylar. Sayfanın kendisi statik. */
export default async function BultenOnayPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, bulten] = await Promise.all([getUi(locale), getSiteAyarlari(locale), getBulten(locale)])
  const m = bulten.metinler ?? {}

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="bulten" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{m.onayBaslik}</h1>
      </div>
      <main className="wrap iletisim bulten">
        <section className="card" id="card">
          <BultenOnay m={m} bultenHref={localizedPath('bulten', locale)} />
        </section>
      </main>
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
