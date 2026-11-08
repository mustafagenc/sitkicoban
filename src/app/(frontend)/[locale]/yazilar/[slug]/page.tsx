import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PostMeta } from '@/components/PostMeta'
import { PostProgress } from '@/components/PostProgress'
import { formatTarih, okumaMetni, toYazilar, YAZAR } from '@/components/yazilar'
import { isLocale, localizedPath, LOCALES } from '@/i18n/config'
import { getSiteAyarlari, getUi, getYazi, getYaziSluglari, getYazilar } from '@/lib/data'
import { RichText } from '@/lib/richtext'
import type { YaziKategorileri } from '@/payload-types'

import '../../../styles/yazi.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await getYaziSluglari()
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale) || !(await getYaziSluglari()).includes(slug)) return {}
  const yazi = await getYazi(slug, locale)
  if (!yazi) return {}
  return { title: yazi.baslik, description: yazi.ozet }
}

export default async function YaziPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  // Bilinmeyen ya da yayından kalkmış adres: başka veriye dokunmadan 404.
  if (!(await getYaziSluglari()).includes(slug)) notFound()
  const yazi = await getYazi(slug, locale)
  if (!yazi) notFound()

  const [ui, ayarlar, hepsi] = await Promise.all([getUi(locale), getSiteAyarlari(locale), getYazilar(locale)])
  const sira = toYazilar(hepsi, ui, locale)
  const i = sira.findIndex((y) => y.slug === slug)
  // Liste yeniden eskiye sıralıdır: sonraki yazı bir öncekidir.
  const onceki = i >= 0 ? sira[i + 1] : undefined
  const sonraki = i > 0 ? sira[i - 1] : undefined
  const kategori =
    yazi.kategori && typeof yazi.kategori === 'object' ? (yazi.kategori as YaziKategorileri).ad : null
  const listHref = localizedPath('yazilar', locale)
  const kaynaklar = (yazi.kaynaklar ?? []).filter((k) => k.metin)
  type Gezinti = { href: string; etiket: string | null | undefined; baslik: string; sonraki?: boolean }
  const tumu: Gezinti = { href: listHref, etiket: ui.tumYazilar, baslik: ui.yazilarSayfasinaDon ?? '' }
  const oncekiLink: Gezinti | undefined = onceki && { href: onceki.href, etiket: ui.oncekiYazi, baslik: onceki.baslik }
  const sonrakiLink: Gezinti | undefined = sonraki && {
    href: sonraki.href,
    etiket: ui.sonrakiYazi,
    baslik: sonraki.baslik,
    sonraki: true,
  }
  // `.next` sağ sütundur: sonraki yazı (yoksa liste bağlantısı) hep sağda; en eski yazıda liste solda.
  const gezinti: Gezinti[] =
    oncekiLink || sonrakiLink
      ? [oncekiLink ?? tumu, sonrakiLink ?? { ...tumu, sonraki: true }]
      : [{ ...tumu, sonraki: true }]

  return (
    <>
      <PostProgress />
      <Header locale={locale} ui={ui} activeKey="yazilar" yaziSlug={slug} />
      <article className="wrap yazi">
        <div className="art-head">
          <div className="crumb">
            <a href={listHref}>{ui.yazilarBaslik}</a>
            {kategori && <> · {kategori}</>}
          </div>
          <h1>{yazi.baslik}</h1>
          {yazi.ozet && <p className="lead">{yazi.ozet}</p>}
          <PostMeta parts={[YAZAR, formatTarih(yazi.tarih, locale), okumaMetni(ui, yazi.okumaSuresi)]} />
        </div>
        <div className="orn" aria-hidden="true">
          ❖ ❖ ❖
        </div>

        <RichText data={yazi.govde} locale={locale} className="prose" />

        {kaynaklar.length > 0 && (
          <div className="sources">
            <h3>{ui.kaynaklarBaslik}</h3>
            <ol>
              {kaynaklar.map((k, n) => (
                <li key={k.id ?? n}>{k.metin}</li>
              ))}
            </ol>
          </div>
        )}

        <nav className="pn" aria-label={ui.yazilarGezinti ?? undefined}>
          {gezinti.map((g) => (
            <a key={g.href} className={g.sonraki ? 'next' : undefined} href={g.href}>
              <small>{g.etiket}</small>
              <b>{g.baslik}</b>
            </a>
          ))}
        </nav>
      </article>
      <Footer locale={locale} ui={ui} ayarlar={ayarlar} />
    </>
  )
}
