import { getPayload } from 'payload'
import { describe, expect, it } from 'vitest'

import config from '@/payload.config'

describe('boot', () => {
  it('boots against the test database with tr/en/ar localization', async () => {
    const payload = await getPayload({ config })
    expect(payload.config.localization && payload.config.localization.defaultLocale).toBe('tr')
    expect(payload.config.localization && payload.config.localization.localeCodes).toEqual([
      'tr',
      'en',
      'ar',
    ])
    expect(payload.config.i18n.fallbackLanguage).toBe('tr')
  })
})
