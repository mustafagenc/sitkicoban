import type { UiMetinleri } from '@/payload-types'
import { localizedPath, type Locale } from '@/i18n/config'

import type { YaziItem } from './yazilar'

/** Ana sayfa "Son yazılar" sütunu: en son yayınlanan üç yazı (Kitaplar ile aynı .two ızgarasında, solda). */
export function HomeYazilar({ yazilar, ui, locale }: { yazilar: YaziItem[]; ui: UiMetinleri; locale: Locale }) {
  return (
    <div>
      <div className="sec-head" style={{ marginBottom: 24 }}>
        <div>
          <div className="eyebrow">{ui.yazilarEyebrow}</div>
          <h2>{ui.sonYazilarBaslik}</h2>
        </div>
        <a className="btn" href={localizedPath('yazilar', locale)}>
          {ui.tumuOk}
        </a>
      </div>
      {yazilar.slice(0, 3).map((y) => (
        <a key={y.id} className="post" href={y.href} style={{ display: 'block' }}>
          {y.kategori && <div className="cat">{y.kategori}</div>}
          <h3>{y.baslik}</h3>
          <p>{y.ozet}</p>
        </a>
      ))}
    </div>
  )
}
