'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

import { bultenOnayla, type BultenState } from '@/app/(frontend)/[locale]/bulten/actions'
import type { Bulten } from '@/payload-types'

import { LOGO_SRC } from './logo'

const noop = () => () => {}

/**
 * Onay sayfasının içeriği. Belirteç (`?t=`) tarayıcıda okunur (sayfa statik kalır) ve sunucu eylemiyle
 * onaylanır. Sunucuda ve ilk çizimde "onaylanıyor" görünür.
 */
export function BultenOnay({ m, bultenHref }: { m: NonNullable<Bulten['metinler']>; bultenHref: string }) {
  const hazir = useSyncExternalStore(noop, () => true, () => false)
  const t = useSyncExternalStore(noop, () => new URLSearchParams(location.search).get('t') ?? '', () => '')
  const [sonuc, setSonuc] = useState<BultenState['status'] | null>(null)

  useEffect(() => {
    if (!t) return
    let iptal = false
    bultenOnayla(t)
      .then((r) => !iptal && setSonuc(r.status))
      .catch(() => !iptal && setSonuc('error'))
    return () => {
      iptal = true
    }
  }, [t])

  const durum = !hazir ? null : !t ? 'error' : sonuc

  if (durum === 'ok') {
    return (
      <div className="done" role="status">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_SRC} alt="" />
        <h2>{m.onayBasariBaslik}</h2>
        <p>{m.onayBasariMetin}</p>
      </div>
    )
  }
  if (durum === 'error' || durum === 'unavailable') {
    return (
      <div className="done" role="alert">
        <p>{durum === 'error' ? m.onayHata : m.onayKullanilamaz}</p>
        <a className="back" href={bultenHref}>
          {m.onayBultenSayfasi}
        </a>
      </div>
    )
  }
  return (
    <div className="done" role="status" aria-busy="true">
      <p>{m.onayBekleniyor}</p>
    </div>
  )
}
