/**
 * Yeni içerik duyurusu: her dil için bir Resend Broadcast (dil segmenti + içerik konusu) ve ilgili
 * konuya abone tarayıcılara Web Push. Yalnızca `duyuru.ts`'teki kanca, kayıt işlemi bittikten sonra çağırır.
 * E-postalarda satın alma bağlantısı HİÇBİR ZAMAN yoktur: kitap duyurusu sitedeki kitaplar sayfasına gider.
 */
import type { Payload } from 'payload'
import webpush from 'web-push'

import { LOCALES, dir, localizedPath, yaziPath, type Locale, type PageKey } from '@/i18n/config'
import { optimized } from '@/lib/img'
import { mediaUrl } from '@/lib/media'
import { siteUrl } from '@/lib/site'
import { youtubeId, youtubeThumb } from '@/lib/youtube'
import type { Bulten } from '@/payload-types'

import type { DuyuruKaynagi } from './duyuru'
import { esc } from './onayEpostasi'
import { pushHazir, pushHostuGecerli } from './push'
import { bultenHazir, resendIstemcisi, segmentId, topicIds } from './resend'

export type DuyuruIcerigi = { baslik: string; ozet: string; gorsel: string | null; url: string }
type Metinler = Partial<NonNullable<Bulten['metinler']>>

const SAYFA: Record<DuyuruKaynagi, PageKey> = {
  yazilar: 'yazilar',
  kitaplar: 'kitaplar',
  eserler: 'eserler',
  videolar: 'videolar',
}
const KONU_SABLONU = {
  yazilar: 'duyuruKonuYazi',
  kitaplar: 'duyuruKonuKitap',
  eserler: 'duyuruKonuEser',
  videolar: 'duyuruKonuVideo',
} as const satisfies Record<DuyuruKaynagi, keyof Metinler>

const PUSH_TTL_SN = 24 * 60 * 60
const PUSH_ESZAMANLI = 10

const yazi = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

/** Boşlukları sadeleştirip en çok `n` karaktere kısaltır. */
function kisalt(s: string, n: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length <= n ? t : `${t.slice(0, n - 1).trimEnd()}…`
}

const mutlak = (yol: string): string => (/^https?:\/\//.test(yol) ? yol : `${siteUrl()}${yol}`)

/** Medya kaydının (depth ≥ 1) e-postaya uygun, küçültülmüş ve mutlak adresi. */
function medyaAdresi(m: unknown): string | null {
  if (!m || typeof m !== 'object') return null
  const src = mediaUrl(m as { filename?: string | null; url?: string | null })
  return src ? mutlak(optimized(src, 640)) : null
}

/**
 * Bir dilin (Türkçe yedekli) kaydından duyuru içeriği. Adres sitedeki sayfadır: yazıda yazının kendisi,
 * diğerlerinde liste sayfası. `satinAlLinki` ve YouTube adresi bağlantı olarak hiçbir zaman kullanılmaz.
 */
export function duyuruIcerigi(kaynak: DuyuruKaynagi, doc: Record<string, unknown>, locale: Locale): DuyuruIcerigi {
  const baslik = yazi(doc.baslik)
  let ozet = ''
  let gorsel: string | null = null
  switch (kaynak) {
    case 'yazilar':
      ozet = yazi(doc.ozet)
      gorsel = medyaAdresi(doc.kapak)
      break
    case 'kitaplar':
      ozet = yazi(doc.aciklama) || yazi(doc.altBaslik)
      gorsel = medyaAdresi(doc.kapak)
      break
    case 'eserler':
      ozet = yazi(doc.anlam) || yazi(doc.aciklama)
      gorsel = medyaAdresi(doc.gorsel)
      break
    case 'videolar': {
      ozet = yazi(doc.aciklama) || yazi(doc.altBaslik)
      const yt = youtubeId(typeof doc.youtube === 'string' ? doc.youtube : null)
      gorsel = medyaAdresi(doc.kapak) ?? (yt ? youtubeThumb(yt) : null)
      break
    }
  }
  const slug = yazi(doc.slug)
  const yol = kaynak === 'yazilar' && slug ? yaziPath(slug, locale) : localizedPath(SAYFA[kaynak], locale)
  return { baslik, ozet: kisalt(ozet, 400), gorsel, url: mutlak(yol) }
}

/** `{baslik}` yer tutucusunu doldurur (`$` gibi özel karakterler olduğu gibi kalır). */
const doldur = (sablon: string, baslik: string) => sablon.split('{baslik}').join(baslik)

/**
 * Duyuru e-postası: sade HTML (site renkleri, izleme pikseli yok) ve düz metin. Tek içerik bağlantısı
 * sitedeki sayfadır; altta Resend'in abonelikten çıkma/tercihler bağlantısı. Dilin konu satırı
 * şablonu boşsa null (o dile gönderilmez).
 */
export function duyuruEpostasi(
  kaynak: DuyuruKaynagi,
  ic: DuyuruIcerigi,
  m: Metinler,
  locale: Locale,
): { subject: string; html: string; text: string } | null {
  const sablon = yazi(m[KONU_SABLONU[kaynak]])
  if (!sablon || !ic.baslik) return null
  const subject = doldur(sablon, ic.baslik)
  const dugme = yazi(kaynak === 'yazilar' ? m.duyuruOku : m.duyuruGor) || ic.url
  const ayril = yazi(m.duyuruAyril) || 'Unsubscribe'
  const d = dir(locale)
  const gorsel = ic.gorsel
    ? `<p style="margin:0 0 22px;"><a href="${esc(ic.url)}"><img src="${esc(ic.gorsel)}" alt="" width="496" style="display:block;width:100%;max-width:496px;height:auto;border:0;"></a></p>\n`
    : ''
  const ozet = ic.ozet ? `<p style="margin:0 0 26px;">${esc(ic.ozet)}</p>\n` : ''
  const html = `<!doctype html>
<html lang="${locale}" dir="${d}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f3ead7;color:#2b2118;font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ead7;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff8ea;border:1px solid #c9a96a;">
<tr><td dir="${d}" style="padding:36px 32px;text-align:${d === 'rtl' ? 'right' : 'left'};font-size:17px;line-height:1.6;">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#b08a3e;">Sıtkı Çoban</p>
<h1 style="margin:0 0 18px;font-weight:400;font-size:26px;color:#3a2a1a;">${esc(ic.baslik)}</h1>
${gorsel}${ozet}<p style="margin:0 0 8px;"><a href="${esc(ic.url)}" style="display:inline-block;background:#3a2a1a;color:#f3ead7;text-decoration:none;padding:12px 26px;">${esc(dugme)}</a></p>
</td></tr></table>
<p style="margin:18px 0 0;font-size:13px;color:#5f4f3d;"><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#5f4f3d;">${esc(ayril)}</a></p>
</td></tr></table>
</body>
</html>`
  const text = [ic.baslik, '', ic.ozet, '', `${dugme} ${ic.url}`, '', '--', `${ayril}: {{{RESEND_UNSUBSCRIBE_URL}}}`]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
  return { subject, html, text }
}

const hataMetni = (e: unknown) => (e instanceof Error ? e.message : String(e))

async function epostalariGonder(
  kaynak: DuyuruKaynagi,
  id: number | string,
  icerik: Record<Locale, DuyuruIcerigi>,
  metinler: Record<Locale, Metinler>,
): Promise<number> {
  if (!bultenHazir()) return 0
  let gonderilen = 0
  for (const l of LOCALES) {
    try {
      const e = duyuruEpostasi(kaynak, icerik[l], metinler[l], l)
      if (!e) continue
      const resend = resendIstemcisi()
      const res = await resend.broadcasts.create({
        name: `${kaynak} #${id} (${l}) ${icerik[l].baslik}`.slice(0, 200),
        segmentId: await segmentId(l),
        topicId: (await topicIds())[kaynak],
        from: process.env.RESEND_FROM as string,
        subject: e.subject,
        html: e.html,
        text: e.text,
        send: true,
      })
      if (res.error) throw new Error(res.error.message)
      gonderilen++
    } catch (err) {
      console.error(`[duyuru] ${kaynak}#${id} e-posta (${l}):`, hataMetni(err))
    }
  }
  return gonderilen
}

type PushKaydi = { id: number | string; endpoint: string; p256dh: string; auth: string; dil: Locale }

async function pushlariGonder(
  payload: Payload,
  kaynak: DuyuruKaynagi,
  id: number | string,
  icerik: Record<Locale, DuyuruIcerigi>,
  metinler: Record<Locale, Metinler>,
): Promise<{ gonderilen: number; toplam: number }> {
  if (!pushHazir()) return { gonderilen: 0, toplam: 0 }
  const vapidDetails = {
    subject: process.env.VAPID_SUBJECT as string,
    publicKey: process.env.VAPID_PUBLIC_KEY as string,
    privateKey: process.env.VAPID_PRIVATE_KEY as string,
  }
  const { docs } = await payload.find({
    collection: 'push-abonelikleri',
    where: { konular: { in: [kaynak] } },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const govde = Object.fromEntries(
    LOCALES.map((l) => {
      const ic = icerik[l]
      const sablon = yazi(metinler[l][KONU_SABLONU[kaynak]])
      return [l, JSON.stringify({ title: sablon ? doldur(sablon, ic.baslik) : ic.baslik, body: kisalt(ic.ozet, 140), url: ic.url })]
    }),
  ) as Record<Locale, string>

  let gonderilen = 0
  const kayitlar = docs as unknown as PushKaydi[]
  const gonder = async (k: PushKaydi) => {
    // Kayıtta doğrulanmış olsa da: sunucu yalnızca bilinen push servislerine istek atar.
    if (!pushHostuGecerli(k.endpoint)) return
    try {
      await webpush.sendNotification(
        { endpoint: k.endpoint, keys: { p256dh: k.p256dh, auth: k.auth } },
        govde[k.dil] ?? govde.tr,
        { TTL: PUSH_TTL_SN, vapidDetails, timeout: 10_000 },
      )
      gonderilen++
    } catch (err) {
      const durum = (err as { statusCode?: number }).statusCode
      if (durum === 404 || durum === 410) {
        // Abonelik tarayıcıda sona ermiş: kayıt silinir.
        await payload
          .delete({ collection: 'push-abonelikleri', id: k.id, overrideAccess: true, context: { disableRevalidate: true } })
          .catch((e) => console.error(`[duyuru] push kaydı silinemedi #${k.id}:`, hataMetni(e)))
      } else {
        console.error(`[duyuru] ${kaynak}#${id} push #${k.id} (${new URL(k.endpoint).hostname}):`, durum ?? hataMetni(err))
      }
    }
  }
  for (let i = 0; i < kayitlar.length; i += PUSH_ESZAMANLI) {
    await Promise.all(kayitlar.slice(i, i + PUSH_ESZAMANLI).map(gonder))
  }
  return { gonderilen, toplam: kayitlar.length }
}

/**
 * Kaydı önce işaretten düşürür (`duyur`/`yenidenDuyur` false, `duyuruldu` şimdi), sonra gönderir: bu
 * güncelleme başarısızsa ya da kayıt artık duyuru beklemiyorsa (başka bir istek üstlenmişse) hiçbir
 * şey gönderilmez. Kendi güncellemesi ne duyuruyu ne de önbellek yenilemeyi tetikler. Hata fırlatmaz.
 */
export async function duyuruGonder(payload: Payload, kaynak: DuyuruKaynagi, id: number | string): Promise<void> {
  const etiket = `${kaynak}#${id}`
  if (!bultenHazir() && !pushHazir()) {
    // Ne e-posta ne push ayarlı: kayıt işaretli kalır (henüz duyurulmadı).
    console.log(`[duyuru] ${etiket}: bülten ayarlı değil, gönderilmedi`)
    return
  }
  try {
    const sonuc = await payload.update({
      collection: kaynak,
      where: {
        and: [
          { id: { equals: id } },
          ...(kaynak === 'yazilar' ? [{ yayinda: { equals: true } }] : []),
          {
            or: [
              { and: [{ duyur: { equals: true } }, { duyuruldu: { exists: false } }] },
              { yenidenDuyur: { equals: true } },
            ],
          },
        ],
      },
      data: { duyur: false, yenidenDuyur: false, duyuruldu: new Date().toISOString() },
      context: { duyuruYok: true, disableRevalidate: true },
      overrideAccess: true,
      depth: 0,
    })
    if (sonuc.errors.length > 0 || sonuc.docs.length !== 1) {
      if (sonuc.errors.length > 0) console.error(`[duyuru] ${etiket}: kayıt güncellenemedi, gönderilmedi`, sonuc.errors[0]?.message)
      return
    }
  } catch (err) {
    console.error(`[duyuru] ${etiket}: kayıt güncellenemedi, gönderilmedi:`, hataMetni(err))
    return
  }

  const icerik = {} as Record<Locale, DuyuruIcerigi>
  const metinler = {} as Record<Locale, Metinler>
  try {
    for (const l of LOCALES) {
      const doc = await payload.findByID({ collection: kaynak, id, locale: l, fallbackLocale: 'tr', depth: 1, overrideAccess: true })
      icerik[l] = duyuruIcerigi(kaynak, doc as unknown as Record<string, unknown>, l)
      const b = await payload.findGlobal({ slug: 'bulten', locale: l, fallbackLocale: false, depth: 0, overrideAccess: true })
      metinler[l] = b.metinler ?? {}
    }
  } catch (err) {
    console.error(`[duyuru] ${etiket}: içerik okunamadı:`, hataMetni(err))
    return
  }

  const [eposta, push] = await Promise.all([
    epostalariGonder(kaynak, id, icerik, metinler),
    pushlariGonder(payload, kaynak, id, icerik, metinler).catch((err) => {
      console.error(`[duyuru] ${etiket} push:`, hataMetni(err))
      return { gonderilen: 0, toplam: 0 }
    }),
  ])
  console.log(`[duyuru] ${etiket}: e-posta ${eposta} dil, push ${push.gonderilen}/${push.toplam}`)
}
