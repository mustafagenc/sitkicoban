'use client'

import { useState, useSyncExternalStore } from 'react'

import type { UiMetinleri } from '@/payload-types'

import { PostMeta } from './PostMeta'
import type { YaziItem } from './yazilar'

/*
 * Yazılar sayfası: öne çıkan (en son) yazı, numaralı liste ve kategori çipleri.
 * Süzme istemcidedir; `?kitap=<kitap slug>` yalnızca o kitapla ilgili yazıları gösterir.
 */
export function PostList({
  posts,
  kategoriler,
  ui,
  listHref,
  rtl,
}: {
  posts: YaziItem[]
  /** Kategoriler, panel sırasıyla. */
  kategoriler: { id: number; ad: string }[]
  ui: UiMetinleri
  listHref: string
  rtl: boolean
}) {
  const [kat, setKat] = useState<number | null>(null)
  // Sunucuda (statik üretimde) süzgeç yoktur; tarayıcıda adres çubuğundaki ?kitap= okunur.
  const kitap = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(location.search).get('kitap'),
    () => null,
  )

  const kitapPosts = kitap ? posts.filter((p) => p.kitaplar.some((k) => k.slug === kitap)) : posts
  const kitapBaslik = kitap
    ? posts.flatMap((p) => p.kitaplar).find((k) => k.slug === kitap)?.baslik || null
    : null
  const sayi = (id: number) => kitapPosts.filter((p) => p.kategoriId === id).length
  const chips = kategoriler.filter((k) => sayi(k.id) > 0)
  const aktif = kat !== null && chips.some((c) => c.id === kat) ? kat : null
  const gorunur = (p: YaziItem) => kitapPosts.includes(p) && (aktif === null || p.kategoriId === aktif)

  const [ilk, ...rest] = posts
  const ilkGorunur = ilk && gorunur(ilk)
  const listeGorunur = rest.filter(gorunur)
  const arrow = rtl ? '←' : '→'

  return (
    <>
      {chips.length > 0 && (
        <div className="cats">
          {[null, ...chips].map((c) => (
            <button
              key={c?.id ?? '__all'}
              type="button"
              className={`chip${(c?.id ?? null) === aktif ? ' on' : ''}`}
              onClick={() => setKat(c?.id ?? null)}
            >
              {c ? c.ad : ui.tumu}
              <span className="n">{c ? sayi(c.id) : kitapPosts.length}</span>
            </button>
          ))}
        </div>
      )}

      {kitap && (
        <p className="suzgec">
          {kitapBaslik && ui.kitapSuzgeci && <span>{ui.kitapSuzgeci.replace('{baslik}', kitapBaslik)} </span>}
          <a href={listHref}>{ui.tumYazilar}</a>
        </p>
      )}

      {ilkGorunur && (
        <a className={`featured${ilk.kapak ? '' : ' noart'}`} href={ilk.href}>
          {ilk.kapak && (
            <div className="art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ilk.kapak.src} alt={ilk.kapak.alt} />
            </div>
          )}
          <div>
            <div className="eyebrow">{[ilk.kategori, ui.sonYazi].filter(Boolean).join(' · ')}</div>
            <h2>{ilk.baslik}</h2>
            <p>{ilk.ozet}</p>
            <PostMeta parts={[ilk.tarih, ilk.okuma]} />
            <span className="more">{ui.yaziyiOku}</span>
          </div>
        </a>
      )}

      <div className="list">
        {listeGorunur.map((p) => (
          <a key={p.id} className="post" href={p.href}>
            <div className="num">{String(posts.indexOf(p) + 1).padStart(2, '0')}</div>
            <div>
              {p.kategori && <div className="eyebrow">{p.kategori}</div>}
              <h3>{p.baslik}</h3>
              <p>{p.ozet}</p>
              <PostMeta parts={[p.tarih, p.okuma]} style={{ marginTop: 10 }} />
            </div>
            <div className="arrow" aria-hidden="true">
              {arrow}
            </div>
          </a>
        ))}
      </div>

      {!ilkGorunur && listeGorunur.length === 0 && <p className="bos">{ui.yazilarBos}</p>}
    </>
  )
}
