/** Canonical public origin, without a trailing slash. */
export const siteUrl = (): string => (process.env.NEXT_PUBLIC_SITE_URL || 'https://sitkicoban.com').replace(/\/$/, '')
