import { TASARIM_LINKS } from '@/i18n/config'

import { LOGO_SRC } from './logo'

/*
 * Ana sayfanın şimdilik sabit bölümleri (İcazet, Video, Hayatı; Yazılar HomeYazilar.tsx'te, Dersler HomeDersler.tsx'te).
 * Bu aşamada tüm dillerde Türkçe gösterilir; bu yüzden lang="tr" dir="ltr" taşırlar.
 * Görseller public/tasarim/img kopyasından, bağlantılar tasarım sayfalarına gider.
 */

const IMG = '/tasarim/img'

export function Icazet() {
  return (
    <section className="icazet" lang="tr" dir="ltr">
      <div className="wrap">
        <div className="orn" style={{ marginBottom: 10 }}>
          ❖
        </div>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div className="eyebrow">İcazet Silsilesi</div>
          <h2 style={{ fontSize: 40, marginTop: 6 }}>Dört kalemde icazet</h2>
        </div>
        <div className="silsile">
          <div className="hoca">
            <div className="hoca-imza">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/imza-hasan-celebi.png`} alt="Hasan Çelebi'nin imzası" />
            </div>
            <h3>Hasan Çelebi</h3>
            <div className="hat">Rik&apos;a · Ta&apos;lik</div>
            <p>Hat sanatının yaşayan efsanesinden rik&apos;a ve ta&apos;lik icazeti.</p>
          </div>
          <div className="center-sig">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="" />
            <div className="lbl">SITKI ÇOBAN</div>
          </div>
          <div className="hoca">
            <div className="hoca-imza">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/imza-erol-donmez.png`} alt="Abdulhadi Erol Dönmez'in imzası" />
            </div>
            <h3>Abdulhadi Erol Dönmez</h3>
            <div className="hat">Sülüs · Nesih</div>
            <p>Sülüs ve nesih kalemlerinde rehberliğinde olgunlaştı.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function VideoSection() {
  return (
    <section
      id="video"
      lang="tr"
      dir="ltr"
      style={{
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div className="wrap video-wrap">
        <div className="player">
          <div className="play">▶</div>
        </div>
        <div>
          <div className="eyebrow">Meşk</div>
          <h3>Ta&apos;lik meşki: harflerin ölçüsü</h3>
          <p>Klasik usulle meşk derslerinden kısa bir bölüm. Videolar site içinde oynatılır.</p>
          <div className="vlist">
            <div>
              Rik&apos;a meşki · Elif-be <span>12:40</span>
            </div>
            <div>
              Söyleşi · Hat ve edebiyat <span>24:05</span>
            </div>
            <div>
              Sülüs meşki · Vav <span>08:17</span>
            </div>
          </div>
          <a className="btn" style={{ marginTop: 20 }} href={TASARIM_LINKS.videolar}>
            Tüm videolar →
          </a>
        </div>
      </div>
    </section>
  )
}

export function Hayati() {
  return (
    <section
      id="hayati"
      lang="tr"
      dir="ltr"
      style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)' }}
    >
      <div className="wrap about">
        <div className="photo has-img" role="img" aria-label="Sıtkı Çoban, çalışma masasında" />
        <div>
          <div className="eyebrow">Hayatı</div>
          <h2>Hattat, müellif, muallim</h2>
          <p>
            Muğla&apos;nın Köyceğiz ilçesinde doğdu. Trakya Üniversitesi&apos;nde lisans, Sakarya
            Üniversitesi&apos;nde Türk Dili ve Edebiyatı alanında yüksek lisans yaptı.
          </p>
          <p>
            Halen İstanbul Çamlıca Kız İmam Hatip Lisesi&apos;nde edebiyat öğretmenliği yapıyor; okul
            dışında hat sanatına gönül veren öğrencilere klasik usulle meşk ettiriyor.
          </p>
          <div className="quote">Gelenekle çağdaş estetiğin zarif bir sentezi.</div>
          <a className="btn" href={TASARIM_LINKS.hayati}>
            Devamını oku →
          </a>
        </div>
      </div>
    </section>
  )
}
