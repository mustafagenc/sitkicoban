'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { getYorumMetinleri } from '@/lib/data'
import { validateYorum, yorumMetinleriVar } from '@/lib/yorum'
import { yorumKaydet } from '@/lib/yorumKayit'
import config from '@/payload.config'

export type YorumState = { status: 'idle' | 'ok' | 'error' | 'unavailable' | 'limit' }

/** İstemcinin IP'si (Vercel ve yerel vekiller `x-forwarded-for` ilk değerine yazar). */
async function istemciIp(): Promise<string | null> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip')?.trim() || null
}

/**
 * Yazı yorum formu eylemi: doğrular, sıklığı sınırlar, yorumu "bekliyor" olarak kaydeder. Bildirim e-postası
 * gönderilmez (yorumlar panelden izlenir). Spam sessizce "ok" alır. Hiçbir durumda hata fırlatmaz.
 */
export async function yorumGonder(_prev: YorumState, formData: FormData): Promise<YorumState> {
  try {
    const now = Date.now()
    const result = validateYorum(formData, now)
    if (!result.ok) return { status: result.reason === 'spam' ? 'ok' : 'error' }

    const m = (await getYorumMetinleri(result.data.dil)).metinler
    if (!yorumMetinleriVar(m)) return { status: 'unavailable' }

    const payload = await getPayload({ config })
    const sonuc = await yorumKaydet(payload, result.data, { now, ip: await istemciIp() })
    return { status: sonuc === 'ok' ? 'ok' : sonuc === 'limit' ? 'limit' : 'error' }
  } catch (e) {
    console.error('Yorum formu: beklenmeyen hata', e)
    return { status: 'error' }
  }
}
