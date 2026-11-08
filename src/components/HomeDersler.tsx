'use client'

import { useEffect, useState } from 'react'

import type { Locale } from '@/i18n/config'
import { localizedPath } from '@/i18n/config'
import type { UiMetinleri } from '@/payload-types'

import { aktifDersler, type Ders } from './dersler'
import { LOGO_SRC } from './logo'

/*
 * Meşk ve Dersler (panelden). Statik üretimde tüm kartlar basılır; bugünün tarihi istemcide bilinince
 * bitiş tarihi geçenler gizlenir, kart kalmazsa bölüm hiç görünmez. Afiş tıklanınca tam ekran açılır
 * (tıklama ya da Esc kapatır).
 */

type Afis = { src: string; alt: string }

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

export function HomeDersler({ dersler, ui, locale }: { dersler: Ders[]; ui: UiMetinleri; locale: Locale }) {
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

  const gecerli = bugun ? aktifDersler(dersler, bugun) : dersler
  if (!gecerli.length) return null

  return (
    <>
      <section className="dersler" id="dersler">
        <div className="wrap">
          <div className="sec-head">
            <div>
              {ui.derslerEyebrow && <div className="eyebrow">{ui.derslerEyebrow}</div>}
              {ui.derslerBaslik && <h2>{ui.derslerBaslik}</h2>}
              {ui.derslerAciklama && <p>{ui.derslerAciklama}</p>}
            </div>
          </div>
          <div className="ders-list">
            {gecerli.map((d) => (
              <article key={d.id} className="ders" data-bitis={d.bitis}>
                {d.afis ? (
                  <button
                    className="afis"
                    type="button"
                    aria-label={ui.afisiBuyut ?? undefined}
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
                  <h3>
                    {d.baslik}
                    {d.altBaslik && (
                      <>
                        <br />
                        <i style={{ fontSize: '.8em', color: 'var(--ink-soft)' }}>{d.altBaslik}</i>
                      </>
                    )}
                  </h3>
                  {d.aciklama && <p>{d.aciklama}</p>}
                  <ul>
                    <li>
                      {ICON.saat}
                      <span>
                        <b>{d.gun}</b>
                        {d.saat && <> · {d.saat}</>}
                      </span>
                    </li>
                    {d.yer && (
                      <li>
                        {ICON.yer}
                        <span>{d.yer}</span>
                      </li>
                    )}
                    {d.kontenjan && (
                      <li>
                        {ICON.kisi}
                        <span>
                          {ui.kontenjan ? `${ui.kontenjan}: ` : ''}
                          {d.kontenjan}
                        </span>
                      </li>
                    )}
                  </ul>
                  {ui.bilgiAlmakIcin && (
                    <a className="git" href={`${localizedPath('iletisim', locale)}?konu=mesk`}>
                      {ui.bilgiAlmakIcin}
                    </a>
                  )}
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
