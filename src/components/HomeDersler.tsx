'use client'

import { useEffect, useState } from 'react'

import { LOGO_SRC } from './logo'

/*
 * Meşk ve Dersler (şimdilik sabit, Türkçe). Bitiş tarihi (data-bitis) geçen kart istemcide gizlenir;
 * kart kalmazsa bölüm hiç görünmez. Afiş tıklanınca tam ekran açılır (tıklama ya da Esc kapatır).
 */

const ILETISIM_MESK = '/tasarim/iletisim.html?konu=Meşk'

type Afis = { src: string; alt: string }
type Ders = {
  bitis: string
  afis: Afis | null
  kurum: string
  baslik: React.ReactNode
  gun: string
  saat: string
  yer: string
  kontenjan?: string
}

const DERSLER: Ders[] = [
  {
    bitis: '2027-01-31',
    afis: {
      src: '/tasarim/img/duyuru-imu-mesk.jpg',
      alt: "Bir Medeniyet Çizgisi: Hüsn-i Hat, Nokta'nın Seyri afişi",
    },
    kurum: 'İstanbul Medeniyet Üniversitesi',
    baslik: (
      <>
        Hüsn-i Hat Meşkleri
        <br />
        <i style={{ fontSize: '.8em', color: 'var(--ink-soft)' }}>Nokta&apos;nın Seyri</i>
      </>
    ),
    gun: 'Her Perşembe',
    saat: '16.30–18.00',
    yer: 'Kuzey Yerleşke, B Blok Derslik 106',
    kontenjan: 'Kontenjan: 25 kişi',
  },
  {
    bitis: '2027-06-30',
    afis: null,
    kurum: 'Çamlıca Kız Anadolu İmam Hatip Lisesi',
    baslik: 'Hat Dersi',
    gun: 'Her Cumartesi',
    saat: '09.00–11.00',
    yer: 'Çamlıca Kız Anadolu İmam Hatip Lisesi, Üsküdar',
  },
]

const ICON = {
  saat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  yer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),
  kisi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </svg>
  ),
}

export function HomeDersler() {
  // Statik üretimde tüm kartlar basılır; bugünün tarihi istemcide bilinince süresi geçenler gizlenir.
  const [bugun, setBugun] = useState<string | null>(null)
  const [afis, setAfis] = useState<Afis | null>(null)

  useEffect(() => {
    setBugun(new Date().toISOString().slice(0, 10))
  }, [])

  useEffect(() => {
    if (!afis) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAfis(null)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [afis])

  const gecerli = DERSLER.filter((d) => !bugun || d.bitis >= bugun)
  if (!gecerli.length) return null

  return (
    <>
      <section className="dersler" id="dersler" lang="tr" dir="ltr">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">Meşk ve Dersler</div>
              <h2>Bu dönem dersler</h2>
              <p>Sıtkı Çoban&apos;ın hüsn-i hat meşk ettirdiği güncel dersler.</p>
            </div>
          </div>
          <div className="ders-list">
            {gecerli.map((d) => (
              <article key={d.kurum} className="ders" data-bitis={d.bitis}>
                {d.afis ? (
                  <button
                    className="afis"
                    type="button"
                    aria-label="Afişi büyüt"
                    onClick={() => setAfis(d.afis)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.afis.src} alt={d.afis.alt} />
                  </button>
                ) : (
                  <div className="afis bos">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={LOGO_SRC} alt="" />
                  </div>
                )}
                <div>
                  <div className="kurum">{d.kurum}</div>
                  <h3>{d.baslik}</h3>
                  <ul>
                    <li>
                      {ICON.saat}
                      <span>
                        <b>{d.gun}</b> · {d.saat}
                      </span>
                    </li>
                    <li>
                      {ICON.yer}
                      <span>{d.yer}</span>
                    </li>
                    {d.kontenjan && (
                      <li>
                        {ICON.kisi}
                        <span>{d.kontenjan}</span>
                      </li>
                    )}
                  </ul>
                  <a className="git" href={ILETISIM_MESK}>
                    Bilgi almak için yazın →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <div className="afis-lb" id="afisLb" hidden={!afis} onClick={() => setAfis(null)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {afis && <img src={afis.src} alt={afis.alt} />}
      </div>
    </>
  )
}
