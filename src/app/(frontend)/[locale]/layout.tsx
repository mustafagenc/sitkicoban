import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { ThemeScript } from '@/components/ThemeScript'
import { dir, LOCALES, type Locale } from '@/i18n/config'

import { fontVars } from '../fonts'
import '../styles/ortak.css'

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Sıtkı Çoban',
  description: 'Hattat Sıtkı Çoban',
  icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
}

const isLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s)

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
