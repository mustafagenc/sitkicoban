import { afterEach, describe, expect, it } from 'vitest'

import { siteUrl } from '@/lib/site'

const KEYS = ['SITE_URL', 'VERCEL_ENV', 'VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_URL'] as const
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]))
const set = (vals: Partial<Record<(typeof KEYS)[number], string>>) => {
  for (const k of KEYS) delete process.env[k]
  Object.assign(process.env, vals)
}

describe('siteUrl', () => {
  afterEach(() => {
    for (const k of KEYS) if (saved[k] === undefined) delete process.env[k]
    else process.env[k] = saved[k]
  })

  it('prefers SITE_URL and drops a trailing slash', () => {
    set({ SITE_URL: 'https://sitkicoban.com/', VERCEL_URL: 'x.vercel.app' })
    expect(siteUrl()).toBe('https://sitkicoban.com')
  })

  it('uses the production domain in production and the deployment URL in previews', () => {
    set({ VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'sitkicoban.com', VERCEL_URL: 'abc.vercel.app' })
    expect(siteUrl()).toBe('https://sitkicoban.com')
    set({ VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'sitkicoban.com', VERCEL_URL: 'abc.vercel.app' })
    expect(siteUrl()).toBe('https://abc.vercel.app')
  })

  it('falls back to localhost', () => {
    set({})
    expect(siteUrl()).toBe('http://localhost:3000')
  })
})
