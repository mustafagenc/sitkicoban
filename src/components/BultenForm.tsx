'use client'

import { startTransition, useActionState, useState, useSyncExternalStore } from 'react'

import { bulteneKatil, type BultenState } from '@/app/(frontend)/[locale]/bulten/actions'
import { KONULAR, epostaGecerli, type BultenKonu } from '@/lib/bulten/form'
import type { Bulten } from '@/payload-types'

import { LOGO_SRC } from './logo'

type M = NonNullable<Bulten['metinler']>
type Fields = 'eposta' | 'konu' | 'onay'
type Result = BultenState & { eposta?: string }

const noop = () => () => {}

/** Sayfa tarayıcıda çizildiği an (ms). Sunucuda 0; "çok hızlı gönderim" denetimi için (iletişim formundaki gibi). */
let renderedAt = 0
const getRenderedAt = () => renderedAt || (renderedAt = Date.now())

const fill = (tpl: string | null | undefined, vars: Record<string, string>) =>
  Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), tpl ?? '')

export const KONU_ADI: Record<BultenKonu, keyof M> = {
  yazilar: 'konuYazilar',
  kitaplar: 'konuKitaplar',
  eserler: 'konuEserler',
  videolar: 'konuVideolar',
}

/**
 * Bülten abonelik formu: e-posta, konular (varsayılan hepsi), açık rıza. Gönderimde onay e-postası gider;
 * abonelik yalnızca e-postadaki bağlantıyla başlar. Sayfa statik kalır; Resend'e yalnızca eylem erişir.
 */
export function BultenForm({ m, locale, aydinlatmaHref }: { m: M; locale: string; aydinlatmaHref: string }) {
  const [n, setN] = useState(0)
  return <Inner key={n} m={m} locale={locale} aydinlatmaHref={aydinlatmaHref} onReset={() => setN((x) => x + 1)} />
}

function Inner({
  m,
  locale,
  aydinlatmaHref,
  onReset,
}: {
  m: M
  locale: string
  aydinlatmaHref: string
  onReset: () => void
}) {
  const t = useSyncExternalStore(noop, getRenderedAt, () => 0)
  const [eposta, setEposta] = useState('')
  const [konular, setKonular] = useState<BultenKonu[]>([...KONULAR])
  const [onay, setOnay] = useState(false)
  const [errs, setErrs] = useState<Partial<Record<Fields, boolean>>>({})

  const [state, formAction, pending] = useActionState<Result, FormData>(async (prev, fd) => {
    const r = await bulteneKatil(prev, fd)
    return { ...r, eposta: String(fd.get('eposta') ?? '').trim() }
  }, { status: 'idle' })

  const bad = {
    eposta: (v = eposta) => !epostaGecerli(v.trim()),
    konu: (v = konular) => v.length === 0,
    onay: (v = onay) => !v,
  }

  // Eylem burada (geçiş içinde) çağrılır: React `<form action>` ile gönderilen formu eylem sonrası sıfırlar ve
  // denetimli onay/konu kutuları durumda işaretli kalırken DOM'da boşalır (yeniden gönderimde gitmezdi).
  // Olay engellenip geçiş burada başlayınca React formu sıfırlamaz. `action` yine verilir: JS yüklenmeden
  // gönderim tarayıcıda hata verir; yoksa form GET ile gider ve e-posta adres çubuğuna düşerdi.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next = { eposta: bad.eposta(), konu: bad.konu(), onay: bad.onay() }
    setErrs(next)
    const first = (['eposta', 'konu', 'onay'] as const).find((f) => next[f])
    if (first) {
      const el = e.currentTarget.elements.namedItem(first)
      ;((el instanceof RadioNodeList ? el[0] : el) as HTMLElement | null)?.focus()
      return
    }
    const fd = new FormData(e.currentTarget)
    startTransition(() => formAction(fd))
  }

  if (state.status === 'ok') {
    return (
      <section className="card" id="card">
        <div className="done" role="status">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="" />
          <h2>{m.formBasariBaslik}</h2>
          <p>{fill(m.formBasariMetin, { eposta: state.eposta ?? '' })}</p>
          <button type="button" onClick={onReset}>
            {m.formYeniden}
          </button>
        </div>
      </section>
    )
  }

  const toggle = (k: BultenKonu, on: boolean) => {
    const v = on ? KONULAR.filter((x) => x === k || konular.includes(x)) : konular.filter((x) => x !== k)
    setKonular(v)
    if (errs.konu) setErrs((e) => ({ ...e, konu: bad.konu(v) }))
  }

  return (
    <section className="card" id="card">
      <form action={formAction} onSubmit={onSubmit} noValidate>
        <h2>{m.formBaslik}</h2>
        {m.formAciklama && <p>{m.formAciklama}</p>}
        <div className={`field${errs.eposta ? ' err' : ''}`}>
          <label htmlFor="eposta">{m.formEposta}</label>
          <input
            id="eposta"
            name="eposta"
            type="email"
            autoComplete="email"
            required
            value={eposta}
            onChange={(e) => {
              setEposta(e.target.value)
              if (errs.eposta) setErrs((x) => ({ ...x, eposta: bad.eposta(e.target.value) }))
            }}
            onBlur={(e) => e.target.value && setErrs((x) => ({ ...x, eposta: bad.eposta(e.target.value) }))}
            aria-invalid={errs.eposta || undefined}
            aria-describedby={errs.eposta ? 'msg-eposta' : undefined}
          />
          {errs.eposta && (
            <div className="msg" id="msg-eposta" role="alert">
              {m.formEpostaHata}
            </div>
          )}
        </div>
        <fieldset className={`konular${errs.konu ? ' err' : ''}`} aria-describedby={errs.konu ? 'msg-konu' : undefined}>
          <legend>{m.formKonular}</legend>
          <div className="secenekler">
            {KONULAR.map((k) => (
              <label key={k} className="secenek">
                <input
                  type="checkbox"
                  name="konu"
                  value={k}
                  checked={konular.includes(k)}
                  onChange={(e) => toggle(k, e.target.checked)}
                />
                <span>{m[KONU_ADI[k]]}</span>
              </label>
            ))}
          </div>
          {errs.konu && (
            <div className="msg" id="msg-konu" role="alert">
              {m.formKonuHata}
            </div>
          )}
        </fieldset>
        <input type="hidden" name="t" value={t} />
        <input type="hidden" name="locale" value={locale} />
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" />
        <label className={`check${errs.onay ? ' err' : ''}`}>
          <input
            type="checkbox"
            name="onay"
            required
            checked={onay}
            onChange={(e) => {
              setOnay(e.target.checked)
              if (errs.onay) setErrs((x) => ({ ...x, onay: bad.onay(e.target.checked) }))
            }}
            aria-invalid={errs.onay || undefined}
            aria-describedby={errs.onay ? 'msg-onay' : undefined}
          />
          <span>
            {m.formOnay} <a href={aydinlatmaHref}>{m.formAydinlatma}</a>
            {errs.onay && (
              <>
                {' '}
                <b id="msg-onay" role="alert">
                  {m.formOnayHata}
                </b>
              </>
            )}
          </span>
        </label>
        <button className="send" type="submit" disabled={pending}>
          {pending ? m.formGonderiliyor : m.formGonder} <span className="arr" aria-hidden="true">→</span>
        </button>
        {state.status === 'error' && (
          <p className="status" role="alert">
            {m.formHata}
          </p>
        )}
        {state.status === 'unavailable' && (
          <p className="status" role="alert">
            {m.formKullanilamaz}
          </p>
        )}
      </form>
    </section>
  )
}
