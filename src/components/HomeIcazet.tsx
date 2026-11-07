import { LOGO_SRC } from './logo'
import type { Hoca } from './hayati'
import type { UiMetinleri } from '@/payload-types'

/* İcazet silsilesi (panelden): hocalar sırayla, ortada imza. İki hocadan fazlasında imza ilk yarıdan sonra durur. */
export function HomeIcazet({ hocalar, ui, ad }: { hocalar: Hoca[]; ui: UiMetinleri; ad: string }) {
  if (!hocalar.length) return null
  const orta = Math.ceil(hocalar.length / 2)
  const kart = (h: Hoca) => (
    <div className="hoca" key={h.id}>
      {h.imza && (
        <div className="hoca-imza">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={h.imza.src} alt={h.imza.alt} />
        </div>
      )}
      <h3>{h.ad}</h3>
      <div className="hat">{h.kalemler}</div>
      <p>{h.aciklama}</p>
    </div>
  )
  return (
    <section className="icazet">
      <div className="wrap">
        <div className="orn" style={{ marginBottom: 10 }}>
          ❖
        </div>
        {(ui.icazetEyebrow || ui.icazetBaslik) && (
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            {ui.icazetEyebrow && <div className="eyebrow">{ui.icazetEyebrow}</div>}
            {ui.icazetBaslik && <h2 style={{ fontSize: 40, marginTop: 6 }}>{ui.icazetBaslik}</h2>}
          </div>
        )}
        <div className="silsile">
          {hocalar.slice(0, orta).map(kart)}
          <div className="center-sig">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="" />
            <div className="lbl">{ad.toLocaleUpperCase('tr')}</div>
          </div>
          {hocalar.slice(orta).map(kart)}
        </div>
      </div>
    </section>
  )
}
