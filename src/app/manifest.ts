import type { MetadataRoute } from 'next'

// Web app manifest (/manifest.webmanifest): iPhone/iPad'de Web Push yalnızca ana ekrana eklenmiş,
// `standalone` açılan web uygulamasında çalışır. Durağan üretilir, veritabanına dokunmaz;
// yol noktalı olduğu için proxy'den geçmez. Renkler ortak.css'teki açık tema paletinden (--bg).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Sıtkı Çoban',
    short_name: 'Sıtkı Çoban',
    description: 'Hattat Sıtkı Çoban',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f3ead7',
    theme_color: '#f3ead7',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
