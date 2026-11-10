import { duyarli } from '@/lib/img'

/** Kolaj: 5 satır, her satırda 9 eser (tasarımdaki dizin formülüyle), kesintisiz kayma için iki kez. */
export function collageRows<T>(images: T[]): T[][] {
  const n = images.length
  if (!n) return []
  return Array.from({ length: 5 }, (_, r) => {
    const set = Array.from({ length: 9 }, (_, i) => images[(r * 4 + i * 5) % n])
    return [...set, ...set]
  })
}

/** Ana sayfa girişi: eser kolajı, imza, ad, roller, kısa tanıtım ve aşağı ok. */
export function HomeHero({
  images,
  roles,
  title,
  tag,
  downLabel,
}: {
  /** Tüm eser görselleri (kolaj); oran = en ÷ boy, yüklenmeden yer ayırmak için */
  images: { src: string; oran: number }[]
  roles?: string | null
  title?: string | null
  tag?: string | null
  downLabel: string
}) {
  return (
    <div className="hero">
      <div className="collage" aria-hidden="true">
        {collageRows(images).map((row, r) => (
          <div className="row" key={r}>
            {row.map(({ src, oran }, i) => (
              // Genişlik/yükseklik oranı verilir ki görsel yüklenince satır kaymasın (CSS yüksekliği belirler).
              // Gösterilen genişlik: oran × satır yüksekliği (masaüstü 15vw, mobil 19svh).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                {...duyarli(src, `(max-width: 860px) ${(oran * 19).toFixed(1)}vh, ${(oran * 15).toFixed(1)}vw`)}
                width={Math.round(oran * 300)}
                height={300}
                alt=""
                decoding="async"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="veil" />
      <div className="in">
        <div className="sig" role="img" aria-label={title ?? ''} />
        {title && <h1 lang="tr">{title}</h1>}
        {roles && <div className="roles">{roles}</div>}
        {tag && <div className="tag">{tag}</div>}
        <a className="down" href="#eserler" aria-label={downLabel}>
          ↓
        </a>
      </div>
    </div>
  )
}
