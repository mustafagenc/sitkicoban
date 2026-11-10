'use server'

import { getPayload } from 'payload'

import { pushHazir, pushHostuGecerli, validatePush } from '@/lib/bulten/push'
import config from '@/payload.config'

export type PushState = { status: 'ok' | 'error' | 'unavailable' }

/**
 * Tarayıcı bildirimi aboneliğini kaydeder (endpoint'e göre ekler ya da günceller). Endpoint bilinen bir push
 * servisinin https adresi olmalı, anahtarlar geçerli olmalı, dil ve en az bir konu verilmeli; aksi "error".
 * VAPID ayarlı değilse "unavailable". Veritabanına yalnızca bu eylem erişir (sayfa görüntülemesi değil).
 * Hiçbir durumda hata fırlatmaz.
 */
export async function pushKaydet(sub: unknown, dil: unknown, konular: unknown): Promise<PushState> {
  try {
    if (!pushHazir()) return { status: 'unavailable' }
    const v = validatePush(sub, dil, konular)
    if (!v) return { status: 'error' }

    const payload = await getPayload({ config })
    const bul = async () =>
      (
        await payload.find({
          collection: 'push-abonelikleri',
          where: { endpoint: { equals: v.endpoint } },
          limit: 1,
          depth: 0,
          pagination: false,
          overrideAccess: true,
        })
      ).docs[0]
    const guncelle = (id: number) =>
      payload.update({ collection: 'push-abonelikleri', id, data: v, depth: 0, overrideAccess: true })

    const mevcut = await bul()
    if (mevcut) {
      await guncelle(mevcut.id)
      return { status: 'ok' }
    }
    try {
      await payload.create({ collection: 'push-abonelikleri', data: v, depth: 0, overrideAccess: true })
    } catch (e) {
      // Aynı endpoint eşzamanlı iki istekle gelmiş olabilir (benzersizlik ihlali): kaydı güncelle.
      const yarisan = await bul()
      if (!yarisan) throw e
      await guncelle(yarisan.id)
    }
    return { status: 'ok' }
  } catch (e) {
    console.error('Bildirim aboneliği kaydedilemedi', e)
    return { status: 'error' }
  }
}

/** Bildirim aboneliğini endpoint'e göre siler (yoksa da "ok"). Geçersiz endpoint → "error". Hata fırlatmaz. */
export async function pushSil(endpoint: unknown): Promise<PushState> {
  try {
    if (!pushHazir()) return { status: 'unavailable' }
    if (!pushHostuGecerli(endpoint)) return { status: 'error' }
    const payload = await getPayload({ config })
    await payload.delete({
      collection: 'push-abonelikleri',
      where: { endpoint: { equals: endpoint } },
      depth: 0,
      overrideAccess: true,
    })
    return { status: 'ok' }
  } catch (e) {
    console.error('Bildirim aboneliği silinemedi', e)
    return { status: 'error' }
  }
}
