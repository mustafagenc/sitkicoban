import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import type { Locale } from '@/i18n/config'
import { getSiteAyarlari, getUi } from '@/lib/data'

// Geçici ana sayfa: yalnızca ortak düzen (Görev 9'da gerçek ana sayfa ile değişecek).
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale
  const [ui, ayarlar] = await Promise.all([getUi(locale), getSiteAyarlari(locale)])

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="home" />
      <main />
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
