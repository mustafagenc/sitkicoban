import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/** Vercel Blob mağaza adresi: kanonik /media/* isteklerini kendi alan adımızdan sunmak için. */
function blobHedefi(): string | null {
  const m = /^vercel_blob_rw_([a-z0-9]+)_/i.exec(process.env.BLOB_READ_WRITE_TOKEN ?? '')
  return m ? `https://${m[1].toLowerCase()}.public.blob.vercel-storage.com` : null
}

const nextConfig: NextConfig = {
  images: {
    // /_next/image ile küçültülecek kaynaklar: yerel medya ve logo, Vercel Blob.
    localPatterns: [{ pathname: '/media/**' }, { pathname: '/imza.png' }],
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  // Blob açıkken /media/<dosya> istekleri kendi alan adımızdan Blob'a yönlendirilir (sitemap, JSON-LD ve OG uyumu).
  async rewrites() {
    const hedef = blobHedefi()
    return {
      afterFiles: hedef ? [{ source: '/media/:dosya*', destination: `${hedef}/:dosya*` }] : [],
    }
  },
  // Eski statik adresler (.html, eski img yolu) kalıcı olarak (308) kanonik yollarına yönlendirilir.
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/:locale(en|ar)/index.html', destination: '/:locale', permanent: true },
      {
        source: '/:sayfa(eserler|kitaplar|yazilar|videolar|hayati|iletisim).html',
        destination: '/:sayfa',
        permanent: true,
      },
      { source: '/img/favicon.svg', destination: '/favicon.svg', permanent: true },
    ]
  },
  // Service worker (tarayıcı bildirimleri) her kayıtta sunucudan doğrulansın: eski sürüm takılı kalmasın.
  // AASA dosyaları uzantısız olduğu için Apple'ın beklediği application/json başlığıyla sunulur.
  async headers() {
    const aasaHeaders = [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Cache-Control', value: 'public, max-age=86400' },
    ]
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, max-age=0, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
      { source: '/apple-app-site-association', headers: aasaHeaders },
      { source: '/.well-known/apple-app-site-association', headers: aasaHeaders },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
