import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'

import { BioToc } from '@/components/BioToc'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { portreUrl, sayfaHref, toHocalar, type Hoca } from '@/components/hayati'
import { LOGO_SRC } from '@/components/logo'
import { isLocale } from '@/i18n/config'
import { getAnasayfa, getHayati, getHocalar, getSiteAyarlari, getUi } from '@/lib/data'
import { RichText, sectionIds, type Blocks } from '@/lib/richtext'

import '../../styles/hayati.css'

const ROMEN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const ui = await getUi(locale)
  return { title: `${ui.navHayati} · Sıtkı Çoban` }
}

function hocaKartlari(hocalar: Hoca[]): Blocks {
  return {
    hocaKartlari: () =>
      hocalar.length > 0 ? (
        <div className="icazet">
          {hocalar.map((h) => (
            <div className="ic" key={h.id}>
              <div className="k">{h.kalemler}</div>
              <b>{h.ad}</b>
              {h.sayfaAciklama && <span>{h.sayfaAciklama}</span>}
            </div>
          ))}
        </div>
      ) : null,
  }
}

export default async function HayatiPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, anasayfa, hayati, hocalarDocs] = await Promise.all([
    getUi(locale),
    getSiteAyarlari(locale),
    getAnasayfa(locale),
    getHayati(locale),
    getHocalar(locale),
  ])
  const portre = portreUrl(hayati)
  const bolumler = hayati.bolumler ?? []
  const ids = sectionIds(bolumler.map((b) => b.baslik))
  const kunye = hayati.kunye ?? []
  const bloklar = hocaKartlari(toHocalar(hocalarDocs))

  return (
    <>
      <Header locale={locale} ui={ui} activeKey="hayati" />
      <main className="wrap hayati">
        <section className={portre ? 'intro' : 'intro noportre'}>
          {portre && (
            <div
              className="portrait"
              role="img"
              aria-label={ui.hayatiPortreAlt ?? undefined}
              style={{ backgroundImage: `url("${portre}")` }}
            />
          )}
          <div>
            {ui.navHayati && <div className="eyebrow">{ui.navHayati}</div>}
            <h1>{anasayfa.heroBaslik}</h1>
            {anasayfa.heroEyebrow && <div className="roles">{anasayfa.heroEyebrow}</div>}
            {hayati.girisCumlesi && <p className="lead">{hayati.girisCumlesi}</p>}
            {kunye.length > 0 && (
              <dl className="facts">
                {kunye.map((k, n) => (
                  <div className="fact" key={k.id ?? n}>
                    <dt>{k.etiket}</dt>
                    <dd>
                      {k.deger.split('\n').map((satir, i) => (
                        <Fragment key={i}>
                          {i > 0 && <br />}
                          {satir}
                        </Fragment>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>

        {bolumler.length > 0 && (
          <div className="body">
            <BioToc items={bolumler.map((b, n) => ({ id: ids[n], text: b.baslik }))} label={ui.hayatiBuSayfada ?? ''} />
            <div className="prose">
              {bolumler.map((b, n) => (
                <section id={ids[n]} key={b.id ?? n}>
                  <h2>
                    <span className="n">{ROMEN[n] ?? n + 1}</span>
                    {b.baslik}
                  </h2>
                  <RichText data={b.govde} locale={locale} blocks={bloklar} />
                  {(b.baglantilar ?? []).map((l, i) => (
                    <a className="more" key={l.id ?? i} href={sayfaHref(l.sayfa, locale)}>
                      {l.etiket}
                    </a>
                  ))}
                </section>
              ))}
            </div>
          </div>
        )}

        {hayati.kapanis && (
          <section className="closing">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="" />
            <p>{hayati.kapanis}</p>
          </section>
        )}
      </main>
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
