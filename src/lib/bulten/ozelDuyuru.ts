/**
 * Panelden serbest duyuru gönderimi (Duyurular koleksiyonu). İçerik duyurusuyla aynı kanallar: her dil için
 * bir Resend Broadcast ve tarayıcı bildirimleri. Bağlantı yalnızca sitenin kendi sayfası olabilir.
 */
import type { Payload } from 'payload'

import { LOCALES, localizedPath, yaziPath, type Locale } from '@/i18n/config'
import type { Baglanti } from '@/collections/Duyurular'

import type { DuyuruKaynagi } from './duyuru'
import { isKonu } from './form'
import {
  epostaOlustur,
  epostalariGonder,
  hataMetni,
  kisalt,
  medyaAdresi,
  mutlak,
  pushlariGonder,
  yazi,
  type PushGovdesi,
} from './gonder'
import { bultenHazir } from './resend'
import { pushHazir } from './push'

type DuyuruKaydi = {
  baslik?: unknown
  metin?: unknown
  gorsel?: unknown
  baglanti?: unknown
  yazi?: unknown
  dugme?: unknown
}

/** Seçilen bağlantının o dildeki mutlak adresi; bağlantı yoksa (ya da yazı yayında değilse) null. */
export function baglantiAdresi(d: DuyuruKaydi, locale: Locale): string | null {
  const b = d.baglanti as Baglanti | undefined
  if (!b || b === 'yok') return null
  if (b === 'yazi') {
    const y = d.yazi as { slug?: unknown; yayinda?: unknown } | null | undefined
    const slug = y && typeof y === 'object' ? yazi(y.slug) : ''
    return slug && y?.yayinda === true ? mutlak(yaziPath(slug, locale)) : null
  }
  return mutlak(localizedPath(b, locale))
}

/** Metni boş satırlardan paragraflara böler. */
export const paragraflar = (metin: string): string[] =>
  metin
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)

/** Bir dilin (Türkçe yedekli) kaydından e-posta ve bildirim gövdesi. */
export function ozelDuyuruIcerigi(d: DuyuruKaydi, m: { duyuruGor?: unknown; duyuruAyril?: unknown }, locale: Locale) {
  const baslik = yazi(d.baslik)
  const metin = yazi(d.metin)
  const url = baglantiAdresi(d, locale)
  const eposta = baslik
    ? epostaOlustur(
        {
          subject: baslik,
          baslik,
          paragraflar: paragraflar(metin),
          gorsel: medyaAdresi(d.gorsel),
          url,
          dugme: yazi(d.dugme) || yazi(m.duyuruGor),
          ayril: yazi(m.duyuruAyril),
        },
        locale,
      )
    : null
  const push: PushGovdesi = { title: baslik, body: kisalt(metin, 140), url: url ?? mutlak(localizedPath('home', locale)) }
  return { eposta, push }
}

/**
 * Kaydı önce "gönderildi" olarak işaretler (yalnızca hâlâ gönderim bekliyorsa), sonra gönderir; sonucu kayda
 * yazar. İşaretleme başarısızsa ya da başka bir istek üstlenmişse hiçbir şey gönderilmez. Hata fırlatmaz.
 */
export async function ozelDuyuruGonder(payload: Payload, id: number | string): Promise<void> {
  const etiket = `duyurular#${id}`
  if (!bultenHazir() && !pushHazir()) {
    console.log(`[duyuru] ${etiket}: bülten ayarlı değil, gönderilmedi`)
    return
  }
  const baglam = { duyuruYok: true, disableRevalidate: true }
  try {
    const sonuc = await payload.update({
      collection: 'duyurular',
      where: { and: [{ id: { equals: id } }, { gonder: { equals: true } }, { gonderildi: { exists: false } }] },
      data: { gonder: false, gonderildi: new Date().toISOString() },
      context: baglam,
      overrideAccess: true,
      depth: 0,
    })
    if (sonuc.errors.length > 0 || sonuc.docs.length !== 1) return
  } catch (err) {
    console.error(`[duyuru] ${etiket}: kayıt güncellenemedi, gönderilmedi:`, hataMetni(err))
    return
  }

  let kanallar: string[] = []
  let konu: DuyuruKaynagi | null = null
  const epostalar = {} as Record<Locale, ReturnType<typeof ozelDuyuruIcerigi>['eposta']>
  const govdeler = {} as Record<Locale, PushGovdesi>
  try {
    for (const l of LOCALES) {
      const d = await payload.findByID({ collection: 'duyurular', id, locale: l, fallbackLocale: 'tr', depth: 1, overrideAccess: true })
      const b = await payload.findGlobal({ slug: 'bulten', locale: l, fallbackLocale: false, depth: 0, overrideAccess: true })
      const ic = ozelDuyuruIcerigi(d as unknown as DuyuruKaydi, b.metinler ?? {}, l)
      epostalar[l] = ic.eposta
      govdeler[l] = ic.push
      kanallar = (d.kanallar as string[] | null | undefined) ?? []
      konu = isKonu(d.kitle) ? d.kitle : null
    }
  } catch (err) {
    console.error(`[duyuru] ${etiket}: içerik okunamadı:`, hataMetni(err))
    return
  }

  const [eposta, push] = await Promise.all([
    kanallar.includes('eposta') ? epostalariGonder(etiket, epostalar, konu, (l) => `Duyuru #${id} (${l}) ${govdeler[l].title}`) : 0,
    kanallar.includes('bildirim')
      ? pushlariGonder(payload, etiket, govdeler, konu).catch((err) => {
          console.error(`[duyuru] ${etiket} push:`, hataMetni(err))
          return { gonderilen: 0, toplam: 0 }
        })
      : { gonderilen: 0, toplam: 0 },
  ])
  const ozet = [
    kanallar.includes('eposta') ? `E-posta: ${eposta} dil` : null,
    kanallar.includes('bildirim') ? `Bildirim: ${push.gonderilen}/${push.toplam} tarayıcı` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  console.log(`[duyuru] ${etiket}: ${ozet}`)
  await payload
    .update({ collection: 'duyurular', id, data: { sonuc: ozet }, context: baglam, overrideAccess: true, depth: 0 })
    .catch((err) => console.error(`[duyuru] ${etiket}: sonuç yazılamadı:`, hataMetni(err)))
}
