'use server'

import { LOCALES, localizedPath } from '@/i18n/config'
import { KONULAR, validateBulten } from '@/lib/bulten/form'
import { onayEpostasi } from '@/lib/bulten/onayEpostasi'
import {
  ONAY_ARALIGI_SN,
  ONAY_OZELLIGI,
  belirteciCoz,
  bultenHazir,
  onayBelirteci,
  onayOzelligiHazir,
  resendIstemcisi,
  segmentId,
  topicIds,
} from '@/lib/bulten/resend'
import { getBulten } from '@/lib/data'
import { siteUrl } from '@/lib/site'

export type BultenState = { status: 'idle' | 'ok' | 'error' | 'unavailable' }

type Hata = { name?: string; message?: string } | null
const bulunamadi = (e: Hata) => e?.name === 'not_found'

/**
 * Bülten aboneliği (çift onayın ilk adımı). Yeni adres Resend'de onaysız (`unsubscribed: true`) kişi olarak,
 * dilinin segmentinde ve seçtiği konulara `opt_in` ile açılır; zaten var olan kişinin durumu değiştirilmez
 * (onaylı bir abone başkasının girdiği adresle düşürülemez). Ardından onay bağlantılı e-posta gider; aynı
 * adrese 10 dakika içinde ikinci onay gitmez (sessizce "ok"). Spam → sessiz "ok"; geçersiz → "error";
 * bülten kapalı → "unavailable". Hiçbir durumda hata fırlatmaz; sayfa görüntülemede değil, yalnızca bu
 * eylemde dış erişim olur.
 */
export async function bulteneKatil(_prev: BultenState, formData: FormData): Promise<BultenState> {
  try {
    const result = validateBulten(formData, Date.now())
    if (!result.ok) return { status: result.reason === 'spam' ? 'ok' : 'error' }
    const { eposta, locale, konular } = result.data
    if (!bultenHazir()) return { status: 'unavailable' }

    const resend = resendIstemcisi()
    const simdi = Math.floor(Date.now() / 1000)
    await onayOzelligiHazir()

    const mevcut = await resend.contacts.get({ email: eposta })
    if (mevcut.error && !bulunamadi(mevcut.error)) {
      console.error('Bülten: kişi okunamadı', mevcut.error)
      return { status: 'error' }
    }
    if (mevcut.data) {
      const son = mevcut.data.properties?.[ONAY_OZELLIGI]?.value
      if (typeof son === 'number' && simdi - son < ONAY_ARALIGI_SN) return { status: 'ok' }
      const { error } = await resend.contacts.update({ email: eposta, properties: { [ONAY_OZELLIGI]: simdi } })
      if (error) {
        console.error('Bülten: kişi güncellenemedi', error)
        return { status: 'error' }
      }
    } else {
      const [seg, ids] = await Promise.all([segmentId(locale), topicIds()])
      const { error } = await resend.contacts.create({
        email: eposta,
        unsubscribed: true,
        segments: [{ id: seg }],
        topics: konular.map((k) => ({ id: ids[k], subscription: 'opt_in' as const })),
        properties: { [ONAY_OZELLIGI]: simdi },
      })
      if (error) {
        console.error('Bülten: kişi oluşturulamadı', error)
        return { status: 'error' }
      }
    }

    const m = (await getBulten(locale)).metinler ?? {}
    const t = onayBelirteci(eposta, locale, konular)
    const baglanti = `${siteUrl()}${localizedPath('bultenOnay', locale)}?t=${t}`
    const { subject, html, text } = onayEpostasi(m, locale, baglanti)
    const { error } = await resend.emails.send({ from: process.env.RESEND_FROM!, to: eposta, subject, html, text })
    if (error) {
      console.error('Bülten: onay e-postası gönderilemedi', error)
      return { status: 'error' }
    }
    return { status: 'ok' }
  } catch (e) {
    console.error('Bülten: beklenmeyen hata', e)
    return { status: 'error' }
  }
}

/**
 * Çift onayın ikinci adımı: imzalı belirteç çözülür, kişi abone yapılır (`unsubscribed: false`), konuları
 * belirteçtekilere eşitlenir (diğerleri `opt_out`) ve yalnızca belirtecin dilinin segmentinde kalır.
 * Geçersiz/süresi dolmuş belirteç → "error". Tekrar tıklamak zararsızdır. Hiçbir durumda hata fırlatmaz.
 */
export async function bultenOnayla(t: string): Promise<BultenState> {
  try {
    if (!bultenHazir()) return { status: 'unavailable' }
    const b = belirteciCoz(t)
    if (!b) return { status: 'error' }

    const resend = resendIstemcisi()
    const [seg, ids] = await Promise.all([segmentId(b.l), topicIds()])
    const konular = KONULAR.map((k) => ({
      id: ids[k],
      subscription: b.k.includes(k) ? ('opt_in' as const) : ('opt_out' as const),
    }))

    const guncel = await resend.contacts.update({ email: b.e, unsubscribed: false })
    if (bulunamadi(guncel.error)) {
      // Onay beklerken kişi silinmiş: belirteçteki tercihlerle yeniden açılır.
      const { error } = await resend.contacts.create({
        email: b.e,
        unsubscribed: false,
        segments: [{ id: seg }],
        topics: konular,
      })
      if (error) {
        console.error('Bülten onayı: kişi oluşturulamadı', error)
        return { status: 'error' }
      }
      return { status: 'ok' }
    }
    if (guncel.error) {
      console.error('Bülten onayı: kişi güncellenemedi', guncel.error)
      return { status: 'error' }
    }

    const tp = await resend.contacts.topics.update({ email: b.e, topics: konular })
    if (tp.error) {
      console.error('Bülten onayı: konular güncellenemedi', tp.error)
      return { status: 'error' }
    }
    const sg = await resend.contacts.segments.add({ email: b.e, segmentId: seg })
    if (sg.error) {
      console.error('Bülten onayı: segmente eklenemedi', sg.error)
      return { status: 'error' }
    }
    // Başka dilde abone olmuşsa o dilin duyuruları artık gitmesin (üyesi değilse hata yok sayılır).
    await Promise.all(
      LOCALES.filter((l) => l !== b.l).map(async (l) => {
        try {
          await resend.contacts.segments.remove({ email: b.e, segmentId: await segmentId(l) })
        } catch {
          // yok say
        }
      }),
    )
    return { status: 'ok' }
  } catch (e) {
    console.error('Bülten onayı: beklenmeyen hata', e)
    return { status: 'error' }
  }
}
