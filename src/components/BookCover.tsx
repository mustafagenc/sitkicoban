import type { Book } from './books'
import { AUTHOR_FALLBACK } from './books'
import { duyarli } from '@/lib/img'

/** Kitap kapağı: görsel varsa görsel, yoksa yazı kapak (.tcover). */
export function BookCover({ kitap }: { kitap: Book }) {
  if (kitap.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...duyarli(kitap.src, '(max-width: 860px) 60vw, 340px', 828)}
        alt={kitap.baslik}
        className={kitap.contain ? 'contain' : undefined}
        loading="lazy"
      />
    )
  }
  return (
    <div className="tcover">
      <span className="o">❖</span>
      <span className="t">{kitap.baslik}</span>
      <span className="a">{kitap.asilYazar || AUTHOR_FALLBACK}</span>
    </div>
  )
}
