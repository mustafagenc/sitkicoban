// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/app/(frontend)/[locale]/bulten/push', () => ({ pushKaydet: vi.fn(), pushSil: vi.fn() }))

import { BildirimDaveti } from '@/components/BildirimDaveti'

const PROPS = {
  locale: 'tr',
  vapidKey: 'x',
  bultenYolu: '/bulten',
  metin: 'Bildirim ister misiniz?',
  evet: 'Bildirimleri aç',
  sonra: 'Daha sonra',
  bekle: 'Bir saniye…',
  acik: 'Açık',
  hata: 'Hata',
}

let izin: NotificationPermission = 'default'
let abonelik: unknown = null

beforeEach(() => {
  vi.useFakeTimers()
  izin = 'default'
  abonelik = null
  localStorage.clear()
  history.replaceState(null, '', '/')
  vi.stubGlobal('PushManager', function PushManager() {})
  vi.stubGlobal('Notification', {
    get permission() {
      return izin
    },
    requestPermission: vi.fn(async () => 'denied'),
  })
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { getRegistration: async () => ({ pushManager: { getSubscription: async () => abonelik } }) },
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  delete (navigator as unknown as Record<string, unknown>).serviceWorker
  document.body.innerHTML = ''
})

async function kur() {
  const el = document.createElement('div')
  document.body.appendChild(el)
  const root = createRoot(el)
  await act(async () => root.render(<BildirimDaveti {...PROPS} />))
  const bekle = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms)
    })
  }
  return { el, bekle }
}

describe('BildirimDaveti', () => {
  it('asks only after the delay, and "Daha sonra" hides it for 30 days', async () => {
    const { el, bekle } = await kur()
    expect(el.textContent).toBe('')
    await bekle(15_000)
    expect(el.textContent).toContain(PROPS.metin)
    const sonra = [...el.querySelectorAll('button')].find((b) => b.textContent === PROPS.sonra)!
    await act(async () => sonra.click())
    expect(el.textContent).toBe('')
    expect(Number(localStorage.getItem('bildirim-daveti'))).toBeGreaterThan(0)

    const ikinci = await kur()
    await ikinci.bekle(20_000)
    expect(ikinci.el.textContent).toBe('')
  })

  it('waits while the cookie banner is open', async () => {
    const cerez = document.createElement('div')
    cerez.className = 'cerez'
    document.body.appendChild(cerez)
    const { el, bekle } = await kur()
    await bekle(20_000)
    expect(el.textContent).toBe('')
    cerez.remove()
    await bekle(5_000)
    expect(el.textContent).toContain(PROPS.metin)
  })

  it('never shows on the newsletter pages, when permission was decided, or when already subscribed', async () => {
    history.replaceState(null, '', '/bulten/onay')
    let k = await kur()
    await k.bekle(20_000)
    expect(k.el.textContent).toBe('')

    history.replaceState(null, '', '/')
    izin = 'denied'
    k = await kur()
    await k.bekle(20_000)
    expect(k.el.textContent).toBe('')

    izin = 'default'
    abonelik = {}
    k = await kur()
    await k.bekle(20_000)
    expect(k.el.textContent).toBe('')
  })

  it('hides for good when the browser prompt is denied', async () => {
    const { el, bekle } = await kur()
    await bekle(15_000)
    const evet = [...el.querySelectorAll('button')].find((b) => b.textContent === PROPS.evet)!
    await act(async () => evet.click())
    expect(Notification.requestPermission).toHaveBeenCalled()
    expect(el.textContent).toBe('')
    expect(localStorage.getItem('bildirim-daveti')).not.toBeNull()
  })
})
