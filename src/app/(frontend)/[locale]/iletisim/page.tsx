import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ContactForm } from '@/components/ContactForm'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { isLocale, localizedPath } from '@/i18n/config'
import { getIletisim, getSiteAyarlari, getUi } from '@/lib/data'

import '../../styles/iletisim.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const ui = await getUi(locale)
  return { title: ui.navIletisim ?? undefined }
}

export default async function IletisimPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, iletisim] = await Promise.all([getUi(locale), getSiteAyarlari(locale), getIletisim(locale)])
  const m = iletisim.metinler ?? {}
  const maddeler = iletisim.maddeler ?? []
  const konular = (iletisim.konular ?? []).map((k) => ({ ad: k.ad, anahtar: k.anahtar }))

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="iletisim" />
      <div className="page-head wrap">
        <div className="orn">❖</div>
        <h1>{ui.navIletisim}</h1>
        {iletisim.aciklama && <p>{iletisim.aciklama}</p>}
      </div>
      <main className="wrap iletisim">
        <div className="contact">
          <aside className="side">
            <h2>{m.iletisimNeIcin}</h2>
            {m.iletisimNot && <p>{m.iletisimNot}</p>}
            {maddeler.length > 0 && (
              <ul className="topics">
                {maddeler.map((m, i) => (
                  <li key={m.id ?? i}>
                    <span className="ic" aria-hidden="true">
                      ❖
                    </span>
                    <div>
                      <b>{m.baslik}</b>
                      <span>{m.metin}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="social">
              {ayarlar.instagram && (
                <a href={ayarlar.instagram} target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
                  </svg>
                  Instagram
                </a>
              )}
              {ayarlar.facebook && (
                <a href={ayarlar.facebook} target="_blank" rel="noopener">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14.5 21v-7.5h2.6l.4-3.2h-3V8.4c0-.9.3-1.6 1.6-1.6h1.6V4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.4H8.9v3.2h2.6V21" />
                  </svg>
                  Facebook
                </a>
              )}
              {ayarlar.youtube && (
                <a href={ayarlar.youtube} target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
                    <path d="M10.2 9.4v5.2l4.5-2.6z" fill="currentColor" />
                  </svg>
                  YouTube
                </a>
              )}
              {ayarlar.eposta && (
                <a href={`mailto:${ayarlar.eposta}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3.5 6l8.5 7 8.5-7" />
                  </svg>
                  {m.iletisimEposta}
                </a>
              )}
            </div>
          </aside>

          <ContactForm
            m={m}
            locale={locale}
            konular={konular}
            aydinlatmaHref={localizedPath('aydinlatma', locale)}
          />
        </div>
      </main>
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
