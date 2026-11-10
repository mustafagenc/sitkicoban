'use client'

import { startTransition, useActionState, useState, useSyncExternalStore } from 'react'

import { yorumGonder, type YorumState } from '@/app/(frontend)/[locale]/yazilar/[slug]/actions'
import { EPOSTA_RE } from '@/lib/contact'
import { YORUM_LIMITLERI } from '@/lib/yorum'
import type { YorumMetinleri } from '@/payload-types'

import { LOGO_SRC } from './logo'

type M = NonNullable<YorumMetinleri['metinler']>
type Fields = 'ad' | 'eposta' | 'metin' | 'onay'

const noop = () => () => {}

/** Sayfa tarayıcıda çizildiği an (ms). Sunucuda 0; "çok hızlı gönderim" denetimi için (iletişim formundaki gibi). */
let renderedAt = 0
const getRenderedAt = () => renderedAt || (renderedAt = Date.now())

const fill = (tpl: string | null | undefined, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), tpl ?? '')

/**
 * Yazı yorum formu: ad, e-posta (yayınlanmaz), yorum, aydınlatma onayı. Yorum "onay bekliyor" olarak kaydedilir;
 * sitede yalnızca onaylandıktan sonra görünür. Sayfa statik kalır; veritabanına yalnızca eylem erişir.
 */
export function YorumForm({ m, locale, slug, aydinlatmaHref }: { m: M; locale: string; slug: string; aydinlatmaHref: string }) {
  const [n, setN] = useState(0)
  return <Inner key={n} m={m} locale={locale} slug={slug} aydinlatmaHref={aydinlatmaHref} onReset={() => setN((x) => x + 1)} />
}

function Inner({
  m,
  locale,
  slug,
  aydinlatmaHref,
  onReset,
}: {
  m: M
  locale: string
  slug: string
  aydinlatmaHref: string
  onReset: () => void
}) {
  const t = useSyncExternalStore(noop, getRenderedAt, () => 0)
  const [ad, setAd] = useState('')
  const [eposta, setEposta] = useState('')
  const [metin, setMetin] = useState('')
  const [onay, setOnay] = useState(false)
  const [errs, setErrs] = useState<Partial<Record<Fields, boolean>>>({})

  const [state, formAction, pending] = useActionState<YorumState, FormData>(yorumGonder, { status: 'idle' })

  const bad = (f: Fields, v: string | boolean): boolean =>
    f === 'eposta'
      ? !EPOSTA_RE.test(String(v).trim()) || String(v).trim().length > YORUM_LIMITLERI.eposta
      : f === 'onay'
        ? v !== true
        : String(v).trim() === ''
  const setErr = (f: Fields, v: string | boolean) => setErrs((e) => ({ ...e, [f]: bad(f, v) }))
  const blur = (f: Fields) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    e.target.value && setErr(f, e.target.value)

  // İletişim formundaki gibi: eylem geçiş içinde çağrılır ki React hata sonrası formu (onay kutusunu) sıfırlamasın.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const values = { ad, eposta, metin, onay }
    const next: Partial<Record<Fields, boolean>> = {}
    let first: Fields | null = null
    for (const f of ['ad', 'eposta', 'metin', 'onay'] as const) {
      next[f] = bad(f, values[f])
      if (next[f] && !first) first = f
    }
    setErrs(next)
    if (first) {
      ;(e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus()
      return
    }
    const fd = new FormData(e.currentTarget)
    startTransition(() => formAction(fd))
  }

  if (state.status === 'ok') {
    return (
      <div className="card" id="yorum-yaz">
        <div className="done" role="status">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="" />
          <h3>{m.formBasariBaslik}</h3>
          <p>{m.formBasariMetin}</p>
          <button type="button" onClick={onReset}>
            {m.formYeniYorum}
          </button>
        </div>
      </div>
    )
  }

  const msg = (f: Fields, text: string | null | undefined) =>
    errs[f] ? (
      <div className="msg" id={`yorum-msg-${f}`} role="alert">
        {text}
      </div>
    ) : null
  const aria = (f: Fields) => ({
    'aria-invalid': errs[f] || undefined,
    'aria-describedby': errs[f] ? `yorum-msg-${f}` : undefined,
  })
  const durumMetni =
    state.status === 'error' ? m.formHata : state.status === 'limit' ? m.formSinir : state.status === 'unavailable' ? m.formKullanilamaz : null

  return (
    <div className="card" id="yorum-yaz">
      <form action={formAction} onSubmit={onSubmit} noValidate>
        <h3>{m.formBaslik}</h3>
        {m.formAciklama && <p>{m.formAciklama}</p>}
        <div className="row">
          <div className={`field${errs.ad ? ' err' : ''}`}>
            <label htmlFor="yorum-ad">{m.formAd}</label>
            <input
              id="yorum-ad"
              name="ad"
              autoComplete="name"
              required
              maxLength={YORUM_LIMITLERI.ad}
              value={ad}
              onChange={(e) => {
                setAd(e.target.value)
                if (errs.ad) setErr('ad', e.target.value)
              }}
              onBlur={blur('ad')}
              {...aria('ad')}
            />
            {msg('ad', m.formAdHata)}
          </div>
          <div className={`field${errs.eposta ? ' err' : ''}`}>
            <label htmlFor="yorum-eposta">
              {m.formEposta} {m.formEpostaNot && <span className="opt">({m.formEpostaNot})</span>}
            </label>
            <input
              id="yorum-eposta"
              name="eposta"
              type="email"
              dir="ltr"
              autoComplete="email"
              required
              maxLength={YORUM_LIMITLERI.eposta}
              value={eposta}
              onChange={(e) => {
                setEposta(e.target.value)
                if (errs.eposta) setErr('eposta', e.target.value)
              }}
              onBlur={blur('eposta')}
              {...aria('eposta')}
            />
            {msg('eposta', m.formEpostaHata)}
          </div>
        </div>
        <div className={`field${errs.metin ? ' err' : ''}`}>
          <label htmlFor="yorum-metin">{m.formMetin}</label>
          <textarea
            id="yorum-metin"
            name="metin"
            dir="auto"
            required
            maxLength={YORUM_LIMITLERI.metin}
            value={metin}
            onChange={(e) => {
              setMetin(e.target.value)
              if (errs.metin) setErr('metin', e.target.value)
            }}
            onBlur={blur('metin')}
            {...aria('metin')}
          />
          {msg('metin', m.formMetinHata)}
          {m.formSayac && (
            <span className="count" aria-hidden="true">
              {fill(m.formSayac, { n: metin.length, max: YORUM_LIMITLERI.metin })}
            </span>
          )}
        </div>
        <input type="hidden" name="t" value={t} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="yazi" value={slug} />
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" />
        <label className={`check${errs.onay ? ' err' : ''}`}>
          <input
            type="checkbox"
            name="onay"
            required
            checked={onay}
            onChange={(e) => {
              setOnay(e.target.checked)
              if (errs.onay) setErr('onay', e.target.checked)
            }}
            {...aria('onay')}
          />
          <span>
            {m.formOnay} <a href={aydinlatmaHref}>{m.formAydinlatma}</a>
            {errs.onay && (
              <>
                {' '}
                <b id="yorum-msg-onay" role="alert">
                  {m.formOnayHata}
                </b>
              </>
            )}
          </span>
        </label>
        <button className="send" type="submit" disabled={pending}>
          {pending ? m.formGonderiliyor : m.formGonder} <span className="arr" aria-hidden="true">→</span>
        </button>
        {durumMetni && (
          <p className="status" role="alert">
            {durumMetni}
          </p>
        )}
      </form>
    </div>
  )
}
