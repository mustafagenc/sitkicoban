'use server'

import { LOCALES, localizedPath } from '@/i18n/config'
import { KONULAR, bultenMetinleriVar, validateBulten } from '@/lib/bulten/form'
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

/** Kişinin `bulten_onay` değeri (Unix sn) ya da null. */
const onayDegeri = (properties: Record<string, { value?: unknown }> | undefined): number | null => {
  const v = properties?.[ONAY_OZELLIGI]?.value
  return typeof v === 'number' ? v : null
}

/**
 * Bülten aboneliği (çift onayın ilk adımı). Yeni adres Resend'de onaysız (`unsubscribed: true`) kişi olarak,
 * dilinin segmentinde ve seçtiği konulara `opt_in` ile açılır; zaten var olan kişinin durumu değiştirilmez
 * (onaylı bir abone başkasının girdiği adresle düşürülemez). Kişinin `bulten_onay` özelliğine bu isteğin
 * zamanı yazılır ve aynı değer imzalı belirtece girer: yalnızca en son gönderilen bağlantı onaylar. Onay
 * e-postası gönderilemezse özellik eski değerine döndürülür (hemen yeniden denenebilir). Aynı adrese 10 dakika
 * içinde ikinci onay gitmez (sessizce "ok"). Spam → sessiz "ok"; geçersiz → "error"; bülten kapalı ya da
 * metinleri girilmemiş → "unavailable". Hiçbir durumda hata fırlatmaz.
 */
export async function bulteneKatil(_prev: BultenState, formData: FormData): Promise<BultenState> {
  try {
    const result = validateBulten(formData, Date.now())
    if (!result.ok) return { status: result.reason === 'spam' ? 'ok' : 'error' }
    const { eposta, locale, konular } = result.data
    if (!bultenHazir()) return { status: 'unavailable' }
    const m = (await getBulten(locale)).metinler ?? {}
    if (!bultenMetinleriVar(m)) return { status: 'unavailable' }

    const resend = resendIstemcisi()
    const simdi = Math.floor(Date.now() / 1000)
    await onayOzelligiHazir()

    const mevcut = await resend.contacts.get({ email: eposta })
    if (mevcut.error && !bulunamadi(mevcut.error)) {
      console.error('Bülten: kişi okunamadı', mevcut.error)
      return { status: 'error' }
    }
    let onceki: number | null = null
    if (mevcut.data) {
      onceki = onayDegeri(mevcut.data.properties)
      if (onceki !== null && simdi - onceki < ONAY_ARALIGI_SN) return { status: 'ok' }
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

    // Belirteç adres çubuğunun parça kısmında (#t=): sunucuya, Referer'a ve ölçüm araçlarına gitmez.
    const t = onayBelirteci(eposta, locale, konular, simdi)
    const baglanti = `${siteUrl()}${localizedPath('bultenOnay', locale)}#t=${t}`
    const { subject, html, text } = onayEpostasi(m, locale, baglanti)
    let gonderildi = false
    try {
      const { error } = await resend.emails.send({ from: process.env.RESEND_FROM!, to: eposta, subject, html, text })
      if (error) console.error('Bülten: onay e-postası gönderilemedi', error)
      else gonderildi = true
    } catch (e) {
      console.error('Bülten: onay e-postası gönderilemedi', e)
    }
    if (!gonderildi) {
      // 10 dk kuralı başarısız bir gönderimi saymasın: zaman eski değerine döner (en iyi çaba).
      try {
        await resend.contacts.update({ email: eposta, properties: { [ONAY_OZELLIGI]: onceki } })
      } catch {
        // yok say
      }
      return { status: 'error' }
    }
    return { status: 'ok' }
  } catch (e) {
    console.error('Bülten: beklenmeyen hata', e)
    return { status: 'error' }
  }
}

/**
 * Çift onayın ikinci adımı: imzalı belirteç çözülür; belirteçteki zaman kişinin güncel `bulten_onay` değeriyle
 * aynı olmalıdır (yalnızca en son bağlantı geçerli, bağlantı tek kullanımlık). Kişi abone yapılır
 * (`unsubscribed: false`), konuları belirteçtekilere eşitlenir (diğerleri `opt_out`), yalnızca belirtecin dilinin
 * segmentinde kalır ve `bulten_onay` silinir: abonelikten çıkan biri eski bağlantıyla geri yazılamaz.
 * Zaten abone olan biri kullanılmış bağlantıya yeniden tıklarsa hiçbir şey değişmeden "ok". Silinmiş kişi
 * yeniden açılmaz. Geçersiz/süresi dolmuş/eski belirteç → "error". Hiçbir durumda hata fırlatmaz.
 */
export async function bultenOnayla(t: string): Promise<BultenState> {
  try {
    if (!bultenHazir()) return { status: 'unavailable' }
    const b = belirteciCoz(t)
    if (!b) return { status: 'error' }

    const resend = resendIstemcisi()
    const kisi = await resend.contacts.get({ email: b.e })
    if (kisi.error || !kisi.data) {
      if (!bulunamadi(kisi.error)) console.error('Bülten onayı: kişi okunamadı', kisi.error)
      return { status: 'error' }
    }
    if (onayDegeri(kisi.data.properties) !== b.n) {
      return { status: kisi.data.unsubscribed === false ? 'ok' : 'error' }
    }

    const [seg, ids] = await Promise.all([segmentId(b.l), topicIds()])
    const konular = KONULAR.map((k) => ({
      id: ids[k],
      subscription: b.k.includes(k) ? ('opt_in' as const) : ('opt_out' as const),
    }))

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
    // Son adım: abone yap ve bağlantıyı tüket. Önceki adımlar başarısız olursa bağlantı geçerli kalır.
    const guncel = await resend.contacts.update({
      email: b.e,
      unsubscribed: false,
      properties: { [ONAY_OZELLIGI]: null },
    })
    if (guncel.error) {
      console.error('Bülten onayı: kişi güncellenemedi', guncel.error)
      return { status: 'error' }
    }
    return { status: 'ok' }
  } catch (e) {
    console.error('Bülten onayı: beklenmeyen hata', e)
    return { status: 'error' }
  }
}
