'use server'

import { Resend } from 'resend'

import { validateContact } from '@/lib/contact'
import { getSiteAyarlari } from '@/lib/data'

export type ContactState = { status: 'idle' | 'ok' | 'error' | 'unavailable' }

const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim()

/**
 * İletişim formu eylemi. Hedef adres önbellekli `getSiteAyarlari` üzerinden okunur
 * (sıcak önbellekte veritabanı sorgusu yok). Hiçbir durumda hata fırlatmaz.
 */
export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  try {
    const result = validateContact(formData, Date.now())
    if (!result.ok) return { status: result.reason === 'spam' ? 'ok' : 'error' }
    const { ad, eposta, konu, telefon, mesaj } = result.data

    const key = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM
    if (!key || !from) return { status: 'unavailable' }
    const ayarlar = await getSiteAyarlari('tr')
    const to = ayarlar.formHedefEposta
    if (!to) return { status: 'unavailable' }

    const text = [`Ad: ${ad}`, `E-posta: ${eposta}`, `Konu: ${konu}`, telefon ? `Telefon: ${telefon}` : null, '', mesaj]
      .filter((l): l is string => l !== null)
      .join('\n')
    const { error } = await new Resend(key).emails.send({
      from,
      to,
      replyTo: eposta,
      subject: `[sitkicoban.com] ${oneLine(konu)} — ${oneLine(ad)}`,
      text,
    })
    if (error) {
      console.error('İletişim formu: e-posta gönderilemedi', error)
      return { status: 'error' }
    }
    return { status: 'ok' }
  } catch (e) {
    console.error('İletişim formu: beklenmeyen hata', e)
    return { status: 'error' }
  }
}
