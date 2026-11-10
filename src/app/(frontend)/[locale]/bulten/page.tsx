import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BultenForm } from '@/components/BultenForm'
import { BultenPush } from '@/components/BultenPush'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { isLocale, localizedPath } from '@/i18n/config'
import { bultenMetinleriVar } from '@/lib/bulten/form'
import { pushHazir, pushMetinleriVar } from '@/lib/bulten/push'
import { getBulten, getSiteAyarlari, getUi } from '@/lib/data'
import { sayfaMeta } from '@/lib/seo'

import '../../styles/iletisim.css'
import '../../styles/bulten.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const bulten = await getBulten(locale)
  return sayfaMeta({ locale, yol: (l) => localizedPath('bulten', l), baslik: bulten.metinler?.baslik, aciklama: bulten.aciklama })
}

/**
 * Bülten sayfası: e-posta aboneliği (çift onay) ve tarayıcı bildirimleri. Statik; abonelikler sunucu
 * eylemiyle yapılır. VAPID açık anahtarı derleme anında ortamdan okunup bileşene verilir.
 */
export default async function BultenPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, bulten] = await Promise.all([getUi(locale), getSiteAyarlari(locale), getBulten(locale)])
  const m = bulten.metinler ?? {}

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="bulten" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{m.baslik}</h1>
        {bulten.aciklama && <p>{bulten.aciklama}</p>}
      </div>
      <main className="wrap iletisim bulten">
        {/* Metinler girilmemişse (üretimde ilk kurulum) boş etiketli form çizilmez. */}
        {bultenMetinleriVar(m) && (
          <BultenForm m={m} locale={locale} aydinlatmaHref={localizedPath('aydinlatma', locale)} />
        )}
        {/* VAPID anahtarları ya da bildirim metinleri yoksa bölüm hiç çizilmez. */}
        {pushHazir() && pushMetinleriVar(m) && (
          <BultenPush m={m} locale={locale} vapidKey={process.env.VAPID_PUBLIC_KEY!} />
        )}
      </main>
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
