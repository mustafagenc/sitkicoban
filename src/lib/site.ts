/**
 * Canonical public origin, without a trailing slash. Server-only (warm-up, sitemap, robots), so it is
 * a plain `SITE_URL`, not `NEXT_PUBLIC_*`. On Vercel it falls back to the deployment's own address:
 * the production domain in production, the deployment URL in previews.
 */
export const siteUrl = (): string => {
  const env = process.env
  const url =
    env.SITE_URL ||
    (env.VERCEL_ENV === 'production' && env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '') ||
    'http://localhost:3000'
  return url.replace(/\/$/, '')
}
