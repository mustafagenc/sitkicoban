// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Sunucu eylemleri: yalnızca gönderilen FormData kaydedilir, dönen durum testte seçilir.
const sendContact = vi.fn()
const bulteneKatil = vi.fn()
vi.mock('@/app/(frontend)/[locale]/iletisim/actions', () => ({ sendContact: (...a: unknown[]) => sendContact(...a) }))
vi.mock('@/app/(frontend)/[locale]/bulten/actions', () => ({ bulteneKatil: (...a: unknown[]) => bulteneKatil(...a) }))

import { BultenForm } from '@/components/BultenForm'
import { ContactForm } from '@/components/ContactForm'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// Metinler: her anahtar kendi adını döndürür.
const m = new Proxy({}, { get: (_t, k) => String(k) }) as never

let el: HTMLDivElement
let root: Root
beforeEach(() => {
  el = document.createElement('div')
  document.body.appendChild(el)
  root = createRoot(el)
})
afterEach(async () => {
  await act(async () => root.unmount())
  el.remove()
  sendContact.mockReset()
  bulteneKatil.mockReset()
})

const q = <T extends Element>(s: string) => el.querySelector(s) as T
const gonder = async () => {
  await act(async () => q<HTMLFormElement>('form').requestSubmit())
  await act(async () => {})
}

describe('ContactForm', () => {
  const doldur = async () => {
    await act(async () => {
      fireEvent.change(q('#ad'), { target: { value: 'Ali Veli' } })
      fireEvent.change(q('#eposta'), { target: { value: 'ali@example.com' } })
      fireEvent.change(q('#konu'), { target: { value: 'Genel' } })
      fireEvent.change(q('#mesaj'), { target: { value: 'Merhaba' } })
      fireEvent.click(q('input[name=onay]'))
    })
  }
  const ciz = () =>
    act(async () =>
      root.render(<ContactForm m={m} locale="tr" konular={[{ ad: 'Genel' }]} aydinlatmaHref="/iletisim/aydinlatma" />),
    )

  it('hata dönünce girilen değerler ve onay korunur; yeniden gönderim aynı değerleri taşır', async () => {
    sendContact.mockResolvedValue({ status: 'error' })
    await ciz()
    await doldur()
    await gonder()

    expect(sendContact).toHaveBeenCalledTimes(1)
    expect(q('[role=alert].status')?.textContent).toBe('formHata')
    expect(q<HTMLInputElement>('#ad').value).toBe('Ali Veli')
    expect(q<HTMLInputElement>('#eposta').value).toBe('ali@example.com')
    expect(q<HTMLSelectElement>('#konu').value).toBe('Genel')
    expect(q<HTMLTextAreaElement>('#mesaj').value).toBe('Merhaba')
    expect(q<HTMLInputElement>('input[name=onay]').checked).toBe(true)

    await gonder()
    expect(sendContact).toHaveBeenCalledTimes(2)
    const fd = sendContact.mock.calls[1][1] as FormData
    expect(fd.get('ad')).toBe('Ali Veli')
    expect(fd.get('eposta')).toBe('ali@example.com')
    expect(fd.get('mesaj')).toBe('Merhaba')
    expect(fd.get('onay')).toBe('on')
  })

  it('başarıda form yerine başarı metni çıkar; "yeni mesaj" boş form açar', async () => {
    sendContact.mockResolvedValue({ status: 'ok' })
    await ciz()
    await doldur()
    await gonder()
    expect(q('form')).toBeNull()
    expect(q('[role=status] h2')?.textContent).toBe('formBasariBaslik')

    await act(async () => fireEvent.click(q('[role=status] button')))
    expect(q<HTMLInputElement>('#ad').value).toBe('')
    expect(q<HTMLInputElement>('input[name=onay]').checked).toBe(false)
  })
})

describe('BultenForm', () => {
  const ciz = () => act(async () => root.render(<BultenForm m={m} locale="tr" aydinlatmaHref="/iletisim/aydinlatma" />))

  it('hata dönünce e-posta, konular ve onay korunur; yeniden gönderim aynı değerleri taşır', async () => {
    bulteneKatil.mockResolvedValue({ status: 'error' })
    await ciz()
    await act(async () => {
      fireEvent.change(q('#eposta'), { target: { value: 'ali@example.com' } })
      fireEvent.click(q('input[name=konu][value=videolar]'))
      fireEvent.click(q('input[name=onay]'))
    })
    await gonder()

    expect(bulteneKatil).toHaveBeenCalledTimes(1)
    expect(q('[role=alert].status')?.textContent).toBe('formHata')
    expect(q<HTMLInputElement>('#eposta').value).toBe('ali@example.com')
    expect(q<HTMLInputElement>('input[name=konu][value=videolar]').checked).toBe(false)
    expect(q<HTMLInputElement>('input[name=konu][value=yazilar]').checked).toBe(true)
    expect(q<HTMLInputElement>('input[name=onay]').checked).toBe(true)

    await gonder()
    expect(bulteneKatil).toHaveBeenCalledTimes(2)
    const fd = bulteneKatil.mock.calls[1][1] as FormData
    expect(fd.get('eposta')).toBe('ali@example.com')
    expect(fd.getAll('konu')).toEqual(['yazilar', 'kitaplar', 'eserler'])
    expect(fd.get('onay')).toBe('on')
  })

  it('başarıda form yerine başarı metni çıkar', async () => {
    bulteneKatil.mockResolvedValue({ status: 'ok' })
    await ciz()
    await act(async () => {
      fireEvent.change(q('#eposta'), { target: { value: 'ali@example.com' } })
      fireEvent.click(q('input[name=onay]'))
    })
    await gonder()
    expect(q('form')).toBeNull()
    expect(q('[role=status] h2')?.textContent).toBe('formBasariBaslik')
  })
})
