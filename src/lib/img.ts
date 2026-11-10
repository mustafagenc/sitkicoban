/**
 * Next.js görsel optimizasyonu (/_next/image): görseli istenen genişliğe küçültüp WebP/AVIF olarak
 * sunar. Var olan <img> yerleşimleri bozulmasın diye bileşen değil yalnızca adres üretilir.
 * Genişlikler next.config'in varsayılan imageSizes/deviceSizes listelerindendir; orijinalden büyük
 * istenen genişlikte Next görseli büyütmez. Büyütmeli görüntüleyici (WorkLightbox) orijinali kullanır.
 */
const GENISLIKLER = [256, 384, 640, 828, 1200, 1920] as const

/** Yalnızca next.config'de izin verilen kaynaklar küçültülür: yerel dosyalar ve Vercel Blob. */
const kucultulebilir = (src: string): boolean =>
  src.startsWith('/') || /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(src)

export function optimized(src: string, w: number = 828): string {
  if (!src || !kucultulebilir(src)) return src
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`
}

export function srcSet(src: string, en: number = 1920): string | undefined {
  if (!src || !kucultulebilir(src)) return undefined
  return GENISLIKLER.filter((w) => w <= en)
    .map((w) => `${optimized(src, w)} ${w}w`)
    .join(', ')
}

/** <img> için hazır öznitelikler: küçük varsayılan kaynak, srcset ve sizes. */
export function duyarli(src: string, sizes: string, en?: number) {
  return { src: optimized(src, 828), srcSet: srcSet(src, en), sizes }
}
