import Link from 'next/link'
import { Fragment } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { WorkDetailStage } from '@/components/WorkDetailStage'
import { HATTAT_ETIKETI, tarih, toWorks, workAciklama, workAlt } from '@/components/works'
import { LOCALES, eserPath, isLocale, localizedPath } from '@/i18n/config'
import { getEser, getEserSluglari, getEserler, getSiteAyarlari, getUi } from '@/lib/data'
import { JsonLd, eserTekil } from '@/lib/jsonld'
import { sayfaMeta } from '@/lib/seo'

import '../../../styles/eser-detay.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await getEserSluglari()
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale) || !(await getEserSluglari()).includes(slug)) return {}
  const doc = await getEser(slug, locale)
  const work = doc ? toWorks([doc])[0] : undefined
  if (!work) return {}
  const hatBilgisi = [...work.yaziTurleri, work.tur].filter(Boolean).join(' · ')
  const baslik = hatBilgisi ? `${work.baslik} (${hatBilgisi})` : work.baslik
  return sayfaMeta({
    locale,
    yol: (l) => eserPath(slug, l),
    baslik,
    aciklama: workAciklama(work, locale),
    gorsel: {
      url: work.kanonikSrc,
      width: work.width ?? undefined,
      height: work.height ?? undefined,
      alt: workAlt(work, locale),
    },
  })
}

export default async function EserDetayPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  if (!(await getEserSluglari()).includes(slug)) notFound()
  const doc = await getEser(slug, locale)
  if (!doc) notFound()

  const [ui, ayarlar, hepsiDocs] = await Promise.all([
    getUi(locale),
    getSiteAyarlari(locale),
    getEserler(locale),
  ])

  const works = toWorks(hepsiDocs)
  const idx = works.findIndex((w) => w.slug === slug)
  const work = idx >= 0 ? works[idx] : toWorks([doc])[0]
  if (!work) notFound()

  const onceki = idx > 0 ? works[idx - 1] : undefined
  const sonraki = idx >= 0 && idx < works.length - 1 ? works[idx + 1] : undefined
  const listHref = localizedPath('eserler', locale)
  const etiketler = [...work.yaziTurleri, work.tur].filter((s): s is string => Boolean(s))

  const kunyeSatirlari = (
    [
      [ui.eserTarih, work.yil ? tarih(work.yil) : null],
      [ui.olcu, work.olcu],
      [ui.malzeme, work.malzeme],
      [ui.tezhip, work.tezhip],
      [ui.ebru, work.ebru],
    ] as const
  ).filter((a): a is [string | null | undefined, string] => Boolean(a[1]?.trim()))

  type Gezinti = { href: string; etiket: string | null | undefined; baslik: string; sonraki?: boolean }
  const tumu: Gezinti = { href: listHref, etiket: ui.navEserler, baslik: ui.tumEserlerOk ?? '' }
  const oncekiLink: Gezinti | undefined = onceki && {
    href: eserPath(onceki.slug, locale),
    etiket: ui.onceki,
    baslik: onceki.baslik,
  }
  const sonrakiLink: Gezinti | undefined = sonraki && {
    href: eserPath(sonraki.slug, locale),
    etiket: ui.sonraki,
    baslik: sonraki.baslik,
    sonraki: true,
  }
  const gezinti: Gezinti[] =
    oncekiLink || sonrakiLink
      ? [oncekiLink ?? tumu, sonrakiLink ?? { ...tumu, sonraki: true }]
      : [{ ...tumu, sonraki: true }]

  return (
    <div className="eser-detay-sayfa">
      <Header locale={locale} ui={ui} activeKey="eserler" eserSlug={slug} />
      <JsonLd data={eserTekil(work, locale)} />

      <main className="eser-detay">
        <article className="wrap">
          <div className="crumb">
            <Link href={listHref}>{ui.eserlerBaslik}</Link>
            {work.yaziTurleri.length > 0 && <> · {work.yaziTurleri.join(' · ')}</>}
          </div>

          <figure className="eser-izgara" style={{ margin: 0 }}>
            <WorkDetailStage
              work={work}
              works={works}
              index={idx >= 0 ? idx : 0}
              ui={ui}
              locale={locale}
            />

            <figcaption className="eser-bilgi">
              <h1>{work.baslik}</h1>
              <div className="eser-hattat">{HATTAT_ETIKETI[locale]}</div>

              {etiketler.length > 0 && (
                <div className="eser-etiketler">
                  {etiketler.map((etiket, k) => (
                    <span className="eser-etiket" key={`${k}-${etiket}`}>
                      {etiket}
                    </span>
                  ))}
                </div>
              )}

              {work.metin && (
                <blockquote className="eser-ar" lang="ar">
                  {work.metin}
                </blockquote>
              )}

              {work.anlam && <p className="eser-anlam">“{work.anlam}”</p>}
              {work.kaynak && <div className="eser-kaynak">{work.kaynak}</div>}
              {work.aciklama && <p className="eser-aciklama">{work.aciklama}</p>}

              {kunyeSatirlari.length > 0 && (
                <dl className="eser-kunye">
                  {kunyeSatirlari.map(([k, v]) => (
                    <Fragment key={k ?? v}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </Fragment>
                  ))}
                </dl>
              )}

              <Link
                className="eser-sor"
                href={`${localizedPath('iletisim', locale)}?eser=${encodeURIComponent(work.baslik)}`}
              >
                {ui.eserSor}
              </Link>
            </figcaption>
          </figure>

          <nav className="eser-gezinti" aria-label={ui.navEserler ?? undefined}>
            {gezinti.map((g) => (
              <Link key={g.href} className={g.sonraki ? 'next' : undefined} href={g.href}>
                <small>{g.etiket}</small>
                <b>{g.baslik}</b>
              </Link>
            ))}
          </nav>
        </article>
      </main>

      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </div>
  )
}
