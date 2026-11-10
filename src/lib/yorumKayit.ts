/** Yorum kaydı (yalnızca sunucuda): sıklık sınırı ve "bekliyor" olarak yazma. */

import { createHash } from 'node:crypto'

import type { Payload } from 'payload'

import { YORUM_LIMITLERI, type YorumData } from '@/lib/yorum'

const PENCERE_MS = 10 * 60 * 1000

/** IP adresi saklanmaz: yalnızca gizli anahtarla tuzlanmış özetinin bir kısmı (sıklık sınırı için). */
export function ipOzeti(ip: string | null | undefined): string | null {
  if (!ip) return null
  return createHash('sha256')
    .update(`${process.env.PAYLOAD_SECRET ?? ''}:${ip}`)
    .digest('hex')
    .slice(0, 32)
}

export type YorumKayitSonucu = 'ok' | 'invalid' | 'limit'

/**
 * Doğrulanmış yorumu "bekliyor" durumunda kaydeder. Yazı yayında değilse ya da yoksa "invalid"; son 10 dakikada
 * aynı e-postadan ya da aynı IP'den `onDakikada` yorum geldiyse "limit". Bu bir ziyaretçi eylemidir (sayfa
 * gösterimi değil): veritabanına doğrudan sorulur.
 */
export async function yorumKaydet(
  payload: Payload,
  data: YorumData,
  opts: { now: number; ip?: string | null },
): Promise<YorumKayitSonucu> {
  const yazi = await payload.find({
    collection: 'yazilar',
    where: { and: [{ slug: { equals: data.yazi } }, { yayinda: { equals: true } }] },
    select: { slug: true },
    depth: 0,
    limit: 1,
    pagination: false,
  })
  const yaziId = yazi.docs[0]?.id
  if (!yaziId) return 'invalid'

  const ozet = ipOzeti(opts.ip)
  const { totalDocs } = await payload.count({
    collection: 'yorumlar',
    where: {
      and: [
        { createdAt: { greater_than: new Date(opts.now - PENCERE_MS).toISOString() } },
        { or: [{ eposta: { equals: data.eposta } }, ...(ozet ? [{ ipOzeti: { equals: ozet } }] : [])] },
      ],
    },
    overrideAccess: true,
  })
  if (totalDocs >= YORUM_LIMITLERI.onDakikada) return 'limit'

  await payload.create({
    collection: 'yorumlar',
    data: { yazi: yaziId, dil: data.dil, ad: data.ad, eposta: data.eposta, metin: data.metin, durum: 'bekliyor', ipOzeti: ozet },
    overrideAccess: true,
  })
  return 'ok'
}
