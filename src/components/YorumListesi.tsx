import type { Locale } from '@/i18n/config'
import type { OnayliYorum } from '@/lib/data'
import type { YorumMetinleri } from '@/payload-types'

type M = NonNullable<YorumMetinleri['metinler']>

/** Yorum tarihi: gün, ay, yıl (sayfanın dilinde, Türkiye saatiyle). */
export function yorumTarihi(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' }).format(d)
}

/**
 * Onaylı yorumlar (her dilde hepsi). Metinler düz yazı olarak çizilir: satır sonları korunur, bağlantılar
 * tıklanamaz. Her yorum kendi dilinde (`lang`) ve yönünde (`dir="auto"`) çizilir; Arapça yorum LTR sayfada da sağdan sola akar.
 */
export function YorumListesi({ yorumlar, m, locale }: { yorumlar: OnayliYorum[]; m: M; locale: Locale }) {
  if (yorumlar.length === 0) return m.bos ? <p className="bos">{m.bos}</p> : null
  return (
    <ol className="liste">
      {yorumlar.map((y) => {
        const tarih = yorumTarihi(y.createdAt, locale)
        return (
          <li key={y.id} className="yorum" lang={y.dil}>
            <div className="ust">
              <b dir="auto">{y.ad}</b>
              {tarih && (
                <time dateTime={y.createdAt} lang={locale}>
                  {tarih}
                </time>
              )}
            </div>
            <p className="metin" dir="auto">
              {y.metin}
            </p>
            {y.cevap && (
              <div className="cevap" lang={locale}>
                <small>{m.cevapEtiket}</small>
                <p className="metin" dir="auto">
                  {y.cevap}
                </p>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
