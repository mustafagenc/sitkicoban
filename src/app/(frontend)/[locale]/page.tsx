import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { toBooks } from '@/components/books'
import { toDersler } from '@/components/dersler'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { HomeBooks } from '@/components/HomeBooks'
import { HomeDersler } from '@/components/HomeDersler'
import { HomeHero } from '@/components/HomeHero'
import { HomeHayati } from '@/components/HomeHayati'
// İcazet bölümü şimdilik kapalı; geri koymak için bu satırı ve aşağıdaki <HomeIcazet> satırını açın.
// import { HomeIcazet } from '@/components/HomeIcazet'
import { HomeVideo } from '@/components/HomeVideo'
import { HomeWorks } from '@/components/HomeWorks'
import { HomeYazilar } from '@/components/HomeYazilar'
// import { toHocalar } from '@/components/hayati' // İcazet bölümüyle birlikte açılır
import { toWorks } from '@/components/works'
import { anasayfaVideosu, toVideolar } from '@/components/videolar'
import { toYazilar, yaziliKitaplar } from '@/components/yazilar'
import { isLocale, localizedPath } from '@/i18n/config'
import {
  getAnasayfa,
  getAnasayfaEserleri,
  getAnasayfaKitaplari,
  getDersler,
  getEserler,
  getHayati,
  getHocalar,
  getSiteAyarlari,
  getUi,
  getVideolar,
  getYazilar,
} from '@/lib/data'

import '../styles/anasayfa.css'
import { sayfaMeta } from '@/lib/seo'
import { JsonLd, kisi } from '@/lib/jsonld'
import { portreUrl } from '@/components/hayati'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const anasayfa = await getAnasayfa(locale)
  return sayfaMeta({ locale, yol: (l) => localizedPath('home', l), aciklama: anasayfa.metaAciklama })
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [ui, ayarlar, anasayfa, eserler, secme, kitaplar, dersler, yazilarDocs, hayati, _hocalar, videoDocs] = await Promise.all([
    getUi(locale),
    getSiteAyarlari(locale),
    getAnasayfa(locale),
    getEserler(locale),
    getAnasayfaEserleri(locale),
    getAnasayfaKitaplari(locale),
    getDersler(locale),
    getYazilar(locale),
    getHayati(locale),
    getHocalar(locale),
    getVideolar(locale),
  ])
  const yazilar = toYazilar(yazilarDocs, ui, locale)
  const videolar = toVideolar(videoDocs, ui, locale)
  const anaVideo = anasayfaVideosu(videolar)

  return (
    // Ana sayfaya özgü ölçüler (.wrap 1180px, alt bilgi vb.) yalnızca .home altında geçerlidir.
    <div className="home">
      <Header locale={locale} ui={ui} activeKey="home" glintOnLoad={false} />
      <JsonLd
        data={kisi({
          locale,
          ayarlar,
          unvanlar: anasayfa.heroEyebrow,
          aciklama: anasayfa.metaAciklama ?? hayati.girisCumlesi,
          portre: portreUrl(hayati),
        })}
      />

      <HomeHero
        images={toWorks(eserler).map((w) => ({ src: w.src, oran: w.oran }))}
        roles={anasayfa.heroEyebrow}
        title={anasayfa.heroBaslik}
        tag={anasayfa.heroAciklama}
        downLabel={ui.asagiKaydir ?? ''}
      />

      <section id="eserler">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">{anasayfa.eserlerEyebrow}</div>
              <h2>{anasayfa.eserlerBaslik}</h2>
              {anasayfa.eserlerAciklama && <p>{anasayfa.eserlerAciklama}</p>}
            </div>
            <a className="btn" href={localizedPath('eserler', locale)}>
              {ui.tumEserlerOk}
            </a>
          </div>
          <HomeWorks works={toWorks(secme)} ui={ui} locale={locale} />
        </div>
      </section>

      {/* <HomeIcazet hocalar={toHocalar(hocalar)} ui={ui} ad={anasayfa.heroBaslik ?? ''} /> */}

      <section id="yazilar">
        <div className="wrap two">
          <HomeYazilar yazilar={yazilar} ui={ui} locale={locale} />
          <div>
            <div className="sec-head" style={{ marginBottom: 24 }}>
              <div>
                <div className="eyebrow">{anasayfa.kitaplarEyebrow}</div>
                <h2>{anasayfa.kitaplarBaslik}</h2>
              </div>
              <a className="btn" href={localizedPath('kitaplar', locale)}>
                {ui.tumuOk}
              </a>
            </div>
            <HomeBooks
              books={toBooks(kitaplar)}
              ui={ui}
              href={localizedPath('kitaplar', locale)}
              locale={locale}
              yazili={yaziliKitaplar(yazilar)}
            />
          </div>
        </div>
      </section>

      {anaVideo && <HomeVideo video={anaVideo} list={videolar} ui={ui} locale={locale} />}
      <HomeDersler dersler={toDersler(dersler)} ui={ui} locale={locale} />
      <HomeHayati hayati={hayati} ui={ui} locale={locale} eyebrow={ui.navHayati ?? ''} />

      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </div>
  )
}
