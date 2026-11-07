import { TASARIM_LINKS } from '@/i18n/config'

/*
 * Ana sayfanın şimdilik sabit bölümleri (Video; İcazet HomeIcazet.tsx'te, Yazılar HomeYazilar.tsx'te, Dersler HomeDersler.tsx'te, Hayatı HomeHayati.tsx'te).
 * Bu aşamada tüm dillerde Türkçe gösterilir; bu yüzden lang="tr" dir="ltr" taşırlar.
 * Görseller public/tasarim/img kopyasından, bağlantılar tasarım sayfalarına gider.
 */

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
