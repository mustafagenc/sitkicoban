import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { ThemeScript } from '@/components/ThemeScript'
import { dir, isLocale, LOCALES } from '@/i18n/config'

import { fontVars } from '../fonts'
import '../styles/ortak.css'

// dynamicParams bilerek açık (varsayılan): `revalidateTag(..., { expire: 0 })` sonrası ISR girdisi
// "yok" sayılır; `dynamicParams = false` olsaydı Next yeniden üretmek yerine 404 dönerdi.
// Bilinmeyen diller zaten proxy'de elenir; buraya düşen olursa düzen ve sayfalar
// veriye dokunmadan notFound() verir (sayfalar düzenle eşzamanlı çalıştığı için onlarda da kontrol var).

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Sıtkı Çoban',
  description: 'Hattat Sıtkı Çoban',
  icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      data-theme="light"
      className={fontVars}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
