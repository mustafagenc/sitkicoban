import { existsSync } from 'node:fs'
import path from 'node:path'
import type { Payload } from 'payload'

import { slugify } from '@/lib/slug'
import { UI_KEYS } from '@/globals/UiMetinleri'
import { LOCALES } from '@/i18n/config'
import { readDesign } from './read-design'
import { UI_STRINGS } from './ui-metinleri'

/** Ana sayfa metinleri: Türkçe tasarımdaki metinlerle birebir; İngilizce ve Arapça yeni yazıldı. */
const ANASAYFA = {
  tr: {
    heroEyebrow: 'Hattat · Müellif · Muallim',
    heroBaslik: 'Sıtkı Çoban',
    heroAciklama: 'Klasik meşk geleneğinin günümüzdeki temsilcilerinden.',
    eserlerEyebrow: 'Seçme Eserler',
    eserlerBaslik: 'Kalemden levhaya',
    eserlerAciklama: "Sülüs, nesih, ta'lik ve rik'a hatlarından seçilmiş eserler.",
    kitaplarEyebrow: 'Kitaplar',
    kitaplarBaslik: 'Eserleri',
  },
  en: {
    heroEyebrow: 'Calligrapher · Author · Teacher',
    heroBaslik: 'Sıtkı Çoban',
    heroAciklama: 'A present-day representative of the classical meşk tradition.',
    eserlerEyebrow: 'Selected Works',
    eserlerBaslik: 'From pen to panel',
    eserlerAciklama: "Works selected from the thuluth, naskh, ta'liq and riq'a scripts.",
    kitaplarEyebrow: 'Books',
    kitaplarBaslik: 'His books',
  },
  ar: {
    heroEyebrow: 'خطّاط · مؤلّف · معلّم',
    heroBaslik: 'Sıtkı Çoban', // özel ad, çevrilmez (üst bilgideki ad gibi)
    heroAciklama: 'من أبرز ممثّلي تقاليد المَشْق الكلاسيكية في عصرنا.',
    eserlerEyebrow: 'أعمال مختارة',
    eserlerBaslik: 'من القلم إلى اللوحة',
    eserlerAciklama: 'أعمال مختارة من خطوط الثلث والنسخ والتعليق والرقعة.',
    kitaplarEyebrow: 'الكتب',
    kitaplarBaslik: 'مؤلّفاته',
  },
} satisfies Record<(typeof LOCALES)[number], Record<string, string>>

const CTX = { disableRevalidate: true }
const LOCALE = 'tr' as const

const HOME_WORKS = ['e-hilye.jpg', 'e-subhanallah.jpg', 'e-seyen-lillah.jpg', 'e-emrolundugun.jpg', 'e-sulus-2.jpg']
const HOME_BOOKS = ['kitap-eskimeyen.jpg', 'kitap-adi-guzel.jpg', 'kitap-lemezat.jpg']

const ROL: Record<string, 'yazar' | 'hazirlayan' | 'sadelestiren' | 'derleyen'> = {
  Yazar: 'yazar',
  Hazırlayan: 'hazirlayan',
  Sadeleştiren: 'sadelestiren',
  Derleyen: 'derleyen',
}

export type SeedResult = { eserler: number; kitaplar: number }

async function upsertByAd(payload: Payload, collection: 'eser-turleri' | 'yazi-turleri', ad: string, extra: { sira?: number } = {}) {
  const found = await payload.find({ collection, where: { ad: { equals: ad } }, locale: LOCALE, limit: 1, depth: 0 })
  if (found.docs[0]) return found.docs[0].id
  const created = await payload.create({ collection, data: { ad, ...extra }, locale: LOCALE, context: CTX })
  return created.id
}

async function upsertMedia(payload: Payload, root: string, filename: string, alt: string) {
  const mediaDir = path.resolve(process.cwd(), process.env.MEDIA_DIR || 'public/media')
  const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })
  const doc = found.docs[0]
  if (doc && existsSync(path.join(mediaDir, filename))) return doc.id
  if (doc) await payload.delete({ collection: 'media', id: doc.id, context: CTX }) // file went missing: recreate
  const created = await payload.create({
    collection: 'media',
    data: { alt },
    locale: LOCALE,
    filePath: path.resolve(process.cwd(), root, 'img', filename),
    context: CTX,
  })
  return created.id
}

/** Deterministic slugs in design order: repeated titles get -2, -3… like the slug hook does. */
function slugsFor(titles: string[]): string[] {
  const seen = new Map<string, number>()
  return titles.map((t) => {
    const base = slugify(t)
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  })
}

async function upsertBySlug(payload: Payload, collection: 'eserler' | 'kitaplar', slug: string, data: Record<string, unknown>) {
  const found = await payload.find({ collection, where: { slug: { equals: slug } }, locale: LOCALE, limit: 1, depth: 0 })
  const args = { data: { ...data, slug }, locale: LOCALE, context: CTX } as const
  if (found.docs[0]) {
    await payload.update({ collection, id: found.docs[0].id, ...args } as never)
  } else {
    await payload.create({ collection, ...args } as never)
  }
}

export async function seed(payload: Payload, opts: { root?: string } = {}): Promise<SeedResult> {
  const root = opts.root ?? 'tasarim'
  const design = readDesign(root)

  // Admin user (password of an existing user is never touched).
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set')
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0 })
  if (!existing.docs[0]) {
    await payload.create({ collection: 'users', data: { email, password }, context: CTX })
  }

  // Taxonomies, in first-seen order.
  const yaziIds = new Map<string, number | string>()
  const turIds = new Map<string, number | string>()
  for (const e of design.eserler) {
    for (const y of e.yazi) {
      if (!yaziIds.has(y)) yaziIds.set(y, await upsertByAd(payload, 'yazi-turleri', y, { sira: yaziIds.size }))
    }
    if (e.tur && !turIds.has(e.tur)) turIds.set(e.tur, await upsertByAd(payload, 'eser-turleri', e.tur))
  }

  // Works
  const eserSlugs = slugsFor(design.eserler.map((e) => e.t))
  for (const [i, e] of design.eserler.entries()) {
    const gorsel = await upsertMedia(payload, root, e.f, e.t)
    const homeIdx = HOME_WORKS.indexOf(e.f)
    await upsertBySlug(payload, 'eserler', eserSlugs[i], {
      baslik: e.t,
      gorsel,
      yaziTurleri: e.yazi.map((y) => yaziIds.get(y)),
      tur: e.tur ? turIds.get(e.tur) : null,
      yil: e.y ?? null,
      metin: e.ar ?? null,
      anlam: e.mean ?? null,
      kaynak: e.src ?? null,
      aciklama: e.desc ?? null,
      olcu: e.olcu ?? null,
      malzeme: e.malzeme ?? null,
      // The design uses "Bilgi girilecek" as a placeholder; the UI string covers empty values.
      tezhip: e.tezhip && e.tezhip !== 'Bilgi girilecek' ? e.tezhip : null,
      ebru: e.ebru ?? null,
      sira: i,
      anasayfadaGoster: homeIdx !== -1,
      anasayfaSira: homeIdx !== -1 ? homeIdx : null,
    })
  }

  // Books
  const kitapSlugs = slugsFor(design.kitaplar.map((k) => k.t))
  for (const [i, k] of design.kitaplar.entries()) {
    const kapak = k.img ? await upsertMedia(payload, root, k.img, `${k.t} kapağı`) : null
    const homeIdx = k.img ? HOME_BOOKS.indexOf(k.img) : -1
    await upsertBySlug(payload, 'kitaplar', kitapSlugs[i], {
      baslik: k.t,
      altBaslik: k.sub ?? null,
      rol: k.role ? ROL[k.role] : null,
      asilYazar: k.a ?? null,
      kapak,
      kapakSigdir: Boolean(k.contain),
      yayinevi: k.pub ?? null,
      yil: k.yil ?? null,
      sayfa: k.sayfa ?? null,
      isbn: k.isbn ?? null,
      aciklama: k.d ?? null,
      sira: i,
      anasayfadaGoster: homeIdx !== -1,
      anasayfaSira: homeIdx !== -1 ? homeIdx : null,
    })
  }

  // Globals
  // E-mail, phone and address do not appear in tasarim/iletisim.html, so they are left for the admin to fill.
  await payload.updateGlobal({
    slug: 'site-ayarlari',
    data: {
      instagram: 'https://www.instagram.com/hattatstkcoban/',
      facebook: 'https://www.facebook.com/s.tk.coban.619408',
    },
    locale: LOCALE,
    context: CTX,
  })

  for (const locale of LOCALES) {
    await payload.updateGlobal({
      slug: 'anasayfa',
      data: ANASAYFA[locale],
      locale,
      context: CTX,
    })
  }

  for (const locale of LOCALES) {
    await payload.updateGlobal({
      slug: 'ui-metinleri',
      data: Object.fromEntries(UI_KEYS.map((key) => [key, UI_STRINGS[key][locale]])),
      locale,
      context: CTX,
    })
  }

  return { eserler: design.eserler.length, kitaplar: design.kitaplar.length }
}
