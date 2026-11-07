'use client'

import { useActionState, useState, useSyncExternalStore } from 'react'

import { sendContact, type ContactState } from '@/app/(frontend)/[locale]/iletisim/actions'
import { EPOSTA_RE, LIMITS, onKonu as hazirKonu, type Konu } from '@/lib/contact'
import type { Iletisim } from '@/payload-types'

import { LOGO_SRC } from './logo'

type Fields = 'ad' | 'eposta' | 'konu' | 'mesaj' | 'onay'
type Result = ContactState & { ad?: string; eposta?: string }

const noop = () => () => {}

/** Sayfa tarayıcıda çizildiği an (ms). Sunucuda 0; "çok hızlı gönderim" denetimi için. */
let renderedAt = 0
const getRenderedAt = () => renderedAt || (renderedAt = Date.now())

const fill = (tpl: string | null | undefined, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), tpl ?? '')

/**
 * İletişim formu. `?konu=` (anahtar ya da ad; listede varsa) konuyu, `?eser=` konuyu (eser konusu) ve mesajı önceden doldurur;
 * adres çubuğu tarayıcıda okunur, sayfa statik kalır. Mesajlar yalnızca e-posta ile gider.
 */
export function ContactForm({
  m,
  locale,
  konular,
  aydinlatmaHref,
}: {
  m: NonNullable<Iletisim['metinler']>
  locale: string
  konular: Konu[]
  aydinlatmaHref: string
}) {
  const [n, setN] = useState(0)
  return (
    <Inner
      key={n}
      m={m}
      locale={locale}
      konular={konular}
      aydinlatmaHref={aydinlatmaHref}
      onReset={() => setN((x) => x + 1)}
    />
  )
}

function Inner({
  m,
  locale,
  konular,
  aydinlatmaHref,
  onReset,
}: {
  m: NonNullable<Iletisim['metinler']>
  locale: string
  konular: Konu[]
  aydinlatmaHref: string
  onReset: () => void
}) {
  const search = useSyncExternalStore(noop, () => location.search, () => '')
  const t = useSyncExternalStore(noop, getRenderedAt, () => 0)

  const params = new URLSearchParams(search)
  const eser = params.get('eser')?.slice(0, 200) || null
  const onKonu = hazirKonu(konular, { konu: params.get('konu'), eser })
  const onMesaj = eser ? `${fill(m.eserHakkinda, { eser })}\n\n` : ''

  // null: ziyaretçi dokunmadı, adresten gelen hazır değer geçerli.
  const [konu, setKonu] = useState<string | null>(null)
  const [mesaj, setMesaj] = useState<string | null>(null)
  const [ad, setAd] = useState('')
  const [eposta, setEposta] = useState('')
  const [telefon, setTelefon] = useState('')
  const [onay, setOnay] = useState(false)
  const [errs, setErrs] = useState<Partial<Record<Fields, boolean>>>({})

  const konuV = konu ?? onKonu
  const mesajV = mesaj ?? onMesaj

  const [state, formAction, pending] = useActionState<Result, FormData>(async (prev, fd) => {
    const r = await sendContact(prev, fd)
    return { ...r, ad: String(fd.get('ad') ?? '').trim().split(/\s+/)[0], eposta: String(fd.get('eposta') ?? '').trim() }
  }, { status: 'idle' })

  const bad = (f: Fields, v: string | boolean): boolean =>
    f === 'eposta'
      ? !EPOSTA_RE.test(String(v).trim()) || String(v).trim().length > LIMITS.eposta
      : f === 'onay'
        ? v !== true
        : String(v).trim() === ''
  const setErr = (f: Fields, v: string | boolean) => setErrs((e) => ({ ...e, [f]: bad(f, v) }))
  // Boş alan yalnızca gönderimde işaretlenir; yazılmış alan odaktan çıkınca denetlenir (tasarımdaki gibi).
  const blur = (f: Fields) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    e.target.value && setErr(f, e.target.value)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const values = { ad, eposta, konu: konuV, mesaj: mesajV, onay }
    const next: Partial<Record<Fields, boolean>> = {}
    let first: Fields | null = null
    for (const f of ['ad', 'eposta', 'konu', 'mesaj', 'onay'] as const) {
      next[f] = bad(f, values[f])
      if (next[f] && !first) first = f
    }
    setErrs(next)
    if (first) {
      e.preventDefault()
      ;(e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus()
    }
  }

  if (state.status === 'ok') {
    return (
      <section className="card" id="card">
        <div className="done" role="status">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="" />
          <h2>{m.formBasariBaslik}</h2>
          <p>{fill(m.formBasariMetin, { ad: state.ad ?? '', eposta: state.eposta ?? '' })}</p>
          <button type="button" onClick={onReset}>
            {m.formYeniMesaj}
          </button>
        </div>
      </section>
    )
  }

  const field = (f: Fields, msg: string | null | undefined) =>
    errs[f] ? (
      <div className="msg" id={`msg-${f}`} role="alert">
        {msg}
      </div>
    ) : null
  const aria = (f: Fields) => ({ 'aria-invalid': errs[f] || undefined, 'aria-describedby': errs[f] ? `msg-${f}` : undefined })

  return (
    <section className="card" id="card">
      <form action={formAction} onSubmit={onSubmit} noValidate>
        <h2>{m.formBaslik}</h2>
        <p>{m.formAciklama}</p>
        <div className="row">
          <div className={`field${errs.ad ? ' err' : ''}`}>
            <label htmlFor="ad">{m.formAd}</label>
            <input
              id="ad"
              name="ad"
              autoComplete="name"
              required
              maxLength={LIMITS.ad}
              value={ad}
              onChange={(e) => {
                setAd(e.target.value)
                if (errs.ad) setErr('ad', e.target.value)
              }}
              onBlur={blur('ad')}
              {...aria('ad')}
            />
            {field('ad', m.formAdHata)}
          </div>
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
                if (errs.eposta) setErr('eposta', e.target.value)
              }}
              onBlur={blur('eposta')}
              {...aria('eposta')}
            />
            {field('eposta', m.formEpostaHata)}
          </div>
        </div>
        <div className="row">
          <div className={`field${errs.konu ? ' err' : ''}`}>
            <label htmlFor="konu">{m.formKonu}</label>
            <select
              id="konu"
              name="konu"
              required
              value={konuV}
              onChange={(e) => {
                setKonu(e.target.value)
                if (errs.konu) setErr('konu', e.target.value)
              }}
              {...aria('konu')}
            >
              <option value="">{m.formKonuSec}</option>
              {konular.map((k) => (
                <option key={k.ad} value={k.ad}>
                  {k.ad}
                </option>
              ))}
            </select>
            {field('konu', m.formKonuHata)}
          </div>
          <div className="field">
            <label htmlFor="telefon">
              {m.formTelefon} <span className="opt">{m.formIstegeBagli}</span>
            </label>
            <input
              id="telefon"
              name="telefon"
              type="tel"
              autoComplete="tel"
              maxLength={LIMITS.telefon}
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
            />
          </div>
        </div>
        <div className={`field${errs.mesaj ? ' err' : ''}`} style={{ marginTop: 4 }}>
          <label htmlFor="mesaj">{m.formMesaj}</label>
          <textarea
            id="mesaj"
            name="mesaj"
            maxLength={LIMITS.mesaj}
            required
            value={mesajV}
            onChange={(e) => {
              setMesaj(e.target.value)
              if (errs.mesaj) setErr('mesaj', e.target.value)
            }}
            onBlur={blur('mesaj')}
            {...aria('mesaj')}
          />
          {field('mesaj', m.formMesajHata)}
          <span className="count" aria-hidden="true">
            {fill(m.formSayac, { n: mesajV.length, max: LIMITS.mesaj })}
          </span>
        </div>
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
              if (errs.onay) setErr('onay', e.target.checked)
            }}
            {...aria('onay')}
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
