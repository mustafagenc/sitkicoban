import { toBooks } from '@/components/books'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { HomeBooks } from '@/components/HomeBooks'
import { HomeDersler } from '@/components/HomeDersler'
import { HomeHero } from '@/components/HomeHero'
import { Hayati, Icazet, VideoSection, YazilarList } from '@/components/HomeStatic'
import { HomeWorks } from '@/components/HomeWorks'
import { toWorks } from '@/components/works'
import { localizedPath, type Locale } from '@/i18n/config'
import {
  getAnasayfa,
  getAnasayfaEserleri,
  getAnasayfaKitaplari,
  getEserler,
  getSiteAyarlari,
  getUi,
} from '@/lib/data'

import '../styles/anasayfa.css'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale
  const [ui, ayarlar, anasayfa, eserler, secme, kitaplar] = await Promise.all([
    getUi(locale),
    getSiteAyarlari(locale),
    getAnasayfa(locale),
    getEserler(locale),
    getAnasayfaEserleri(locale),
    getAnasayfaKitaplari(locale),
  ])

  return (
    // Ana sayfaya özgü ölçüler (.wrap 1180px, alt bilgi vb.) yalnızca .home altında geçerlidir.
    <div className="home">
      <Header locale={locale} ui={ui} activeKey="home" glintOnLoad={false} />

      <HomeHero
        images={toWorks(eserler).map((w) => w.src)}
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
              {ui.tumuOk}
            </a>
          </div>
          <HomeWorks works={toWorks(secme)} ui={ui} locale={locale} />
        </div>
      </section>

      <Icazet />

      <section id="yazilar">
        <div className="wrap two">
          <YazilarList />
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
            <HomeBooks books={toBooks(kitaplar)} ui={ui} href={localizedPath('kitaplar', locale)} />
          </div>
        </div>
      </section>

      <VideoSection />
      <HomeDersler />
      <Hayati />

      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </div>
  )
}
