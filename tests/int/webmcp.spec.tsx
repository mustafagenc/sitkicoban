// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { WebMcp } from '@/components/WebMcp'

type Kayit = { name: string; annotations?: { readOnlyHint?: boolean }; execute: (i: Record<string, unknown>) => Promise<{ content: { text: string }[] }> }

const VERI = {
  eserler: [
    { baslik: 'Hilye-i Şerif', yaziTurleri: ['Sülüs', 'Nesih'] },
    { baslik: 'Tövbe', yaziTurleri: ["Ta'lik"] },
  ],
  kitaplar: [{ baslik: 'Kitap' }],
  yazilar: [
    { baslik: 'Zikir', kategori: 'Tefsir' },
    { baslik: 'Hat', kategori: 'Sanat' },
  ],
  dersler: [
    { baslik: 'Geçmiş', bitis: '2000-01-01T00:00:00.000Z' },
    { baslik: 'Güncel', bitis: '2999-01-01T00:00:00.000Z' },
  ],
  iletisim: { eposta: 'x@example.com' },
}

async function kur() {
  const kayitlar: Kayit[] = []
  let signal: AbortSignal | undefined
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: { registerTool: (t: Kayit, o?: { signal?: AbortSignal }) => { kayitlar.push(t); signal = o?.signal } },
  })
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true })
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(VERI))))
  const el = document.createElement('div')
  const root = createRoot(el)
  await act(async () => root.render(<WebMcp />))
  await act(async () => {})
  const cagir = async (ad: string, girdi: Record<string, unknown> = {}) =>
    JSON.parse((await kayitlar.find((k) => k.name === ad)!.execute(girdi)).content[0].text)
  return { kayitlar, cagir, root, signal: () => signal }
}

afterEach(() => {
  vi.unstubAllGlobals()
  delete (document as unknown as Record<string, unknown>).modelContext
})

describe('WebMcp', () => {
  it('registers five read-only tools and unregisters them on unmount', async () => {
    const { kayitlar, root, signal } = await kur()
    expect(kayitlar.map((k) => k.name).sort()).toEqual([
      'dersleri_goster',
      'eserleri_listele',
      'iletisim_bilgisi',
      'kitaplari_listele',
      'yazilari_listele',
    ])
    expect(kayitlar.every((k) => k.annotations?.readOnlyHint === true)).toBe(true)
    expect(signal()?.aborted).toBe(false)
    act(() => root.unmount())
    expect(signal()?.aborted).toBe(true)
  })

  it('filters works by script and posts by category (Turkish case-insensitive), and hides expired lessons', async () => {
    const { cagir } = await kur()
    expect((await cagir('eserleri_listele', { yazi_turu: 'sülüs' })).map((e: { baslik: string }) => e.baslik)).toEqual(['Hilye-i Şerif'])
    expect(await cagir('eserleri_listele')).toHaveLength(2)
    expect((await cagir('yazilari_listele', { kategori: 'TEFSİR' })).map((y: { baslik: string }) => y.baslik)).toEqual(['Zikir'])
    expect((await cagir('dersleri_goster')).map((d: { baslik: string }) => d.baslik)).toEqual(['Güncel'])
    expect(await cagir('iletisim_bilgisi')).toEqual({ eposta: 'x@example.com' })
  })

  it('does nothing where the API is missing', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const el = document.createElement('div')
    const root = createRoot(el)
    await act(async () => root.render(<WebMcp />))
    expect(fetchSpy).not.toHaveBeenCalled()
    act(() => root.unmount())
  })
})
