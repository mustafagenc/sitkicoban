// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const send = vi.fn()
vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))
vi.mock('@/lib/data', () => ({
  getSiteAyarlari: vi.fn(async () => ({ formHedefEposta: 'hedef@example.com' })),
}))

import { sendContact } from '@/app/(frontend)/[locale]/iletisim/actions'
import { validateContact } from '@/lib/contact'

const NOW = 1_000_000
const valid = {
  ad: 'Ayşe Yılmaz',
  eposta: 'ayse@example.com',
  konu: 'Meşk',
  telefon: '',
  mesaj: 'Merhaba, meşk hakkında bilgi almak istiyorum.',
  onay: 'on',
  website: '',
  t: String(NOW - 10_000),
  locale: 'tr',
}
const form = (o: Record<string, string> = {}) => {
  const f = new FormData()
  for (const [k, v] of Object.entries({ ...valid, ...o })) f.set(k, v)
  return f
}

describe('validateContact', () => {
  it('accepts a valid message and trims values', () => {
    const r = validateContact({ ...valid, ad: '  Ayşe ' }, NOW)
    expect(r).toEqual({
      ok: true,
      data: { ad: 'Ayşe', eposta: 'ayse@example.com', konu: 'Meşk', telefon: undefined, mesaj: valid.mesaj },
    })
  })

  it('treats the honeypot, a missing timestamp and a fast submit as spam', () => {
    expect(validateContact({ ...valid, website: 'x' }, NOW)).toEqual({ ok: false, reason: 'spam' })
    expect(validateContact({ ...valid, t: '' }, NOW)).toEqual({ ok: false, reason: 'spam' })
    expect(validateContact({ ...valid, t: String(NOW - 1000) }, NOW)).toEqual({ ok: false, reason: 'spam' })
  })

  it('rejects bad fields as invalid', () => {
    for (const o of [
      { ad: '' },
      { ad: 'a'.repeat(101) },
      { eposta: 'yok' },
      { eposta: 'a'.repeat(200) + '@b.co' },
      { konu: '' },
      { mesaj: '' },
      { mesaj: 'a'.repeat(2001) },
      { onay: '' },
    ]) {
      expect(validateContact({ ...valid, ...o }, NOW)).toEqual({ ok: false, reason: 'invalid' })
    }
  })

  it('reads FormData too and keeps the optional phone', () => {
    const r = validateContact(form({ telefon: ' 0555 ' }), NOW)
    expect(r.ok && r.data.telefon).toBe('0555')
  })
})

describe('sendContact', () => {
  beforeEach(() => {
    send.mockReset()
    send.mockResolvedValue({ data: { id: '1' }, error: null })
    process.env.RESEND_API_KEY = 're_test'
    process.env.RESEND_FROM = 'Site <site@example.com>'
    vi.spyOn(Date, 'now').mockReturnValue(NOW)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.RESEND_API_KEY
    delete process.env.RESEND_FROM
  })

  it('answers ok without sending for spam', async () => {
    expect(await sendContact({ status: 'idle' }, form({ website: 'bot' }))).toEqual({ status: 'ok' })
    expect(await sendContact({ status: 'idle' }, form({ t: String(NOW - 1000) }))).toEqual({ status: 'ok' })
    expect(send).not.toHaveBeenCalled()
  })

  it('answers error for an invalid message', async () => {
    expect(await sendContact({ status: 'idle' }, form({ mesaj: 'a'.repeat(2001) }))).toEqual({ status: 'error' })
    expect(send).not.toHaveBeenCalled()
  })

  it('answers unavailable without RESEND_API_KEY', async () => {
    delete process.env.RESEND_API_KEY
    expect(await sendContact({ status: 'idle' }, form())).toEqual({ status: 'unavailable' })
    expect(send).not.toHaveBeenCalled()
  })

  it('sends once to the configured address with reply-to', async () => {
    expect(await sendContact({ status: 'idle' }, form())).toEqual({ status: 'ok' })
    expect(send).toHaveBeenCalledTimes(1)
    const arg = send.mock.calls[0][0]
    expect(arg).toMatchObject({
      from: 'Site <site@example.com>',
      to: 'hedef@example.com',
      replyTo: 'ayse@example.com',
      subject: '[sitkicoban.com] Meşk — Ayşe Yılmaz',
    })
    expect(arg.text).toContain(valid.mesaj)
  })

  it('answers error when sending rejects or reports an error, never throwing', async () => {
    send.mockRejectedValueOnce(new Error('boom'))
    expect(await sendContact({ status: 'idle' }, form())).toEqual({ status: 'error' })
    send.mockResolvedValueOnce({ data: null, error: { message: 'bad' } })
    expect(await sendContact({ status: 'idle' }, form())).toEqual({ status: 'error' })
  })
})
