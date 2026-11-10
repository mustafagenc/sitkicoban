/**
 * "Abonelere duyur" alanları ve kaydetme kancası (yazılar, kitaplar, eserler, videolar). Gönderim
 * `gonder.ts`'te; burada yalnızca koşul ve zamanlama var, böylece Payload yapılandırması Resend ve
 * web-push'u yüklemez (gönderim modülü yalnızca gerektiğinde dinamik olarak alınır).
 */
import { after } from 'next/server'
import type { CollectionAfterChangeHook, Field } from 'payload'

import type { BultenKonu } from './form'

export type DuyuruKaynagi = BultenKonu

/** Kaydın sitede görünüp görünmediği: yalnızca yazıların `yayinda` alanı var; diğerleri kaydedilince yayındadır. */
export const yayinda = (kaynak: DuyuruKaynagi, doc: { yayinda?: unknown }): boolean =>
  kaynak === 'yazilar' ? doc.yayinda === true : true

type DuyuruDurumu = { duyur?: unknown; yenidenDuyur?: unknown; duyuruldu?: unknown }

/** İlk duyuru (hiç duyurulmamış ve kutu işaretli) ya da açıkça "yeniden duyur" istenmiş mi? */
export const duyuruIstendi = (doc: DuyuruDurumu): boolean =>
  (doc.duyur === true && !doc.duyuruldu) || doc.yenidenDuyur === true

/** Kenar çubuğu alanları (yerelleştirilmemiş). */
export const duyuruAlanlari = (): Field[] => [
  {
    name: 'duyur',
    label: 'Kaydedince abonelere duyur — bir kez',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      condition: (data) => !data?.duyuruldu,
      description:
        'Kayıt yayındaysa bu konuya abone olanlara e-posta ve tarayıcı bildirimi gider. Gönderildikten sonra kutu kendiliğinden kalkar (sayfayı yenileyince görünür). Satın alma bağlantısı hiçbir zaman gönderilmez.',
    },
  },
  {
    name: 'yenidenDuyur',
    label: 'Yeniden duyur',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      condition: (data) => !!data?.duyuruldu,
      description: 'Bu kayıt daha önce duyuruldu. İşaretleyip kaydederseniz abonelere bir kez daha gider.',
    },
  },
  {
    name: 'duyuruldu',
    label: 'Duyuruldu',
    type: 'date',
    admin: {
      position: 'sidebar',
      readOnly: true,
      date: { pickerAppearance: 'dayAndTime' },
      description: 'Abonelere son duyurunun gönderildiği zaman.',
    },
  },
]

// --- Zamanlama ---------------------------------------------------------------------------------------

type Is = () => Promise<void>

// Testler için: işler sıraya alınır ve `duyurulariBekle()` ile (kayıt işlemi bittikten sonra) çalıştırılır.
let elle = false
const kuyruk: Is[] = []

/** Testler için: true iken işler hemen çalışmaz, `duyurulariBekle()` çalıştırır. */
export function _elleCalistir(v: boolean): void {
  elle = v
}

/** Sıradaki (ve onların eklediği) bütün duyuru işlerini çalıştırıp bitmelerini bekler. */
export async function duyurulariBekle(): Promise<void> {
  while (kuyruk.length) await kuyruk.shift()!()
}

/**
 * Kanca, Payload'ın veritabanı işlemi (transaction) kapanmadan çalışır. Gönderim, kaydı işaretten
 * düşürerek başlar; bu güncelleme işlem kapandıktan sonra yapılmalı, yoksa dış işlemin yazdığı
 * `duyur: true` onu ezer. `after()` yanıt (ve commit) bittikten sonra çalışır; Next isteği dışında
 * (betikler) bir süre sonra olay döngüsünde çalıştırılır.
 */
export function zamanla(is: Is): void {
  if (elle) {
    kuyruk.push(is)
    return
  }
  try {
    after(is)
  } catch {
    setTimeout(() => void is(), 2000)
  }
}

/**
 * afterChange: kayıt yayında ve duyuru istenmişse gönderimi yanıt sonrasına zamanlar. Seed
 * (`disableRevalidate`) ve gönderimin kendi güncellemesi (`duyuruYok`) hiçbir zaman tetiklemez.
 */
export function duyuruHook(kaynak: DuyuruKaynagi): CollectionAfterChangeHook {
  return ({ doc, context, req }) => {
    if (context?.duyuruYok || context?.disableRevalidate) return doc
    if (!duyuruIstendi(doc) || !yayinda(kaynak, doc)) return doc
    const payload = req.payload
    const id = doc.id as number | string
    zamanla(async () => {
      try {
        const { duyuruGonder } = await import('./gonder')
        await duyuruGonder(payload, kaynak, id)
      } catch (e) {
        console.error(`[duyuru] ${kaynak}#${id}:`, e instanceof Error ? e.message : e)
      }
    })
    return doc
  }
}
