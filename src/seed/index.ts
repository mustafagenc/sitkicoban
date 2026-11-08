import path from 'node:path'
import type { Payload } from 'payload'

import { slugify } from '@/lib/slug'
import { UI_KEYS } from '@/globals/UiMetinleri'
import { LOCALES } from '@/i18n/config'
import { SEED_DERSLER } from './dersler'
import { SEED_HAYATI, SEED_HOCALAR, SEED_PORTRE } from './hayati'
import { SEED_ILETISIM } from './iletisim'
import { SEED_VIDEO_KATEGORILERI, SEED_VIDEOLAR } from './videolar'
import { SEED_YAZI_KATEGORILERI, SEED_YAZILAR } from './yazilar'
import { mediaDosyasiVar } from './media-var'
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

/** Çerez bildirimi (Google Analytics yalnızca izinle yüklenir). */
const CEREZ = {
  tr: {
    metin: 'Sitenin nasıl kullanıldığını anlamak için, izin verirseniz Google Analytics çerezleri kullanıyoruz. Reddederseniz hiçbir analiz çerezi yazılmaz.',
    kabul: 'Kabul ediyorum',
    reddet: 'Reddediyorum',
    aydinlatma: 'Aydınlatma metni',
    tercihler: 'Çerez tercihleri',
  },
  en: {
    metin: 'With your permission, we use Google Analytics cookies to understand how the site is used. If you decline, no analytics cookies are set.',
    kabul: 'Accept',
    reddet: 'Decline',
    aydinlatma: 'Privacy notice',
    tercihler: 'Cookie preferences',
  },
  ar: {
    metin: 'نستخدم ملفات تعريف الارتباط من Google Analytics بإذنك لفهم كيفية استخدام الموقع. إذا رفضت، فلن يُحفظ أي ملف تحليلي.',
    kabul: 'أوافق',
    reddet: 'أرفض',
    aydinlatma: 'نص الإفصاح',
    tercihler: 'تفضيلات ملفات تعريف الارتباط',
  },
} satisfies Record<(typeof LOCALES)[number], Record<string, string>>

/**
 * Her yazma işlemine yeni bir bağlam nesnesi: Payload ve eklentiler istek durumunu bağlama yazar
 * (ör. Blob eklentisi yüklenen dosyayı `context._payloadCloudStorage`'a koyar). Ortak bir nesne,
 * sonraki her görselde ilk dosyanın yeniden yüklenmesine yol açıyordu.
 */
const ctx = () => ({ disableRevalidate: true })
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

async function upsertByAd(payload: Payload, collection: 'eser-turleri' | 'yazi-turleri' | 'yazi-kategorileri' | 'video-kategorileri', ad: string, extra: { sira?: number } = {}) {
  const found = await payload.find({ collection, where: { ad: { equals: ad } }, locale: LOCALE, limit: 1, depth: 0 })
  if (found.docs[0]) return found.docs[0].id
  const created = await payload.create({ collection, data: { ad, ...extra }, locale: LOCALE, context: ctx() })
  return created.id
}

async function upsertMedia(payload: Payload, root: string, filename: string, alt: string) {
  const mediaDir = path.resolve(process.cwd(), process.env.MEDIA_DIR || 'public/media')
  const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })
  const doc = found.docs[0]
  // Kayıttaki url'ye güvenilmez (Blob açıkken her url Blob adresine çevrilir): dosyanın kendisine bakılır.
  if (doc && (await mediaDosyasiVar(doc, mediaDir))) return doc.id
  if (doc) await payload.delete({ collection: 'media', id: doc.id, context: ctx() }) // file went missing: recreate
  const created = await payload.create({
    collection: 'media',
    data: { alt },
    locale: LOCALE,
    filePath: path.resolve(process.cwd(), root, 'img', filename),
    context: ctx(),
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

async function upsertBySlug(payload: Payload, collection: 'eserler' | 'kitaplar' | 'yazilar', slug: string, data: Record<string, unknown>) {
  const found = await payload.find({ collection, where: { slug: { equals: slug } }, locale: LOCALE, limit: 1, depth: 0 })
  const args = { data: { ...data, slug }, locale: LOCALE, context: ctx() } as const
  if (found.docs[0]) {
    await payload.update({ collection, id: found.docs[0].id, ...args } as never)
  } else {
    await payload.create({ collection, ...args } as never)
  }
}

export async function seedYazilar(payload: Payload, opts: { root?: string } = {}): Promise<number> {
  const root = opts.root ?? 'tasarim'
  const kategoriIds = new Map<string, number | string>()
  for (const [i, ad] of SEED_YAZI_KATEGORILERI.entries()) {
    kategoriIds.set(ad, await upsertByAd(payload, 'yazi-kategorileri', ad, { sira: i }))
  }
  const yaziSlugs = slugsFor(SEED_YAZILAR.map((y) => y.baslik))
  // Seed hiçbir zaman içerik silmez: panelden eklenen yazılar korunur.
  for (const [i, y] of SEED_YAZILAR.entries()) {
    const kapak = y.kapak ? await upsertMedia(payload, root, y.kapak.file, y.kapak.alt) : null
    await upsertBySlug(payload, 'yazilar', yaziSlugs[i], {
      baslik: y.baslik,
      kategori: kategoriIds.get(y.kategori),
      ozet: y.ozet,
      govde: y.govde ?? null,
      tarih: `${y.tarih}T00:00:00.000Z`,
      okumaSuresiOtomatik: Boolean(y.govde),
      okumaSuresi: y.govde ? null : (y.dakika ?? null),
      kapak,
      kaynaklar: (y.kaynaklar ?? []).map((metin) => ({ metin })),
      yayinda: y.yayinda,
    })
  }
  return SEED_YAZILAR.length
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
    await payload.create({ collection: 'users', data: { email, password }, context: ctx() })
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

  // Lessons (key: kurum + baslik in tr)
  for (const [i, d] of SEED_DERSLER.entries()) {
    const afis = d.afis ? await upsertMedia(payload, root, d.afis.file, d.afis.alt) : null
    const data = {
      kurum: d.kurum,
      baslik: d.baslik,
      altBaslik: d.altBaslik ?? null,
      aciklama: d.aciklama ?? null,
      gun: d.gun,
      saat: d.saat,
      yer: d.yer,
      kontenjan: d.kontenjan ?? null,
      afis,
      bitis: `${d.bitis}T00:00:00.000Z`,
      sira: i,
    }
    const found = await payload.find({
      collection: 'dersler',
      where: { and: [{ kurum: { equals: d.kurum } }, { baslik: { equals: d.baslik } }] },
      locale: LOCALE,
      limit: 1,
      depth: 0,
    })
    if (found.docs[0]) {
      await payload.update({ collection: 'dersler', id: found.docs[0].id, data, locale: LOCALE, context: ctx() })
    } else {
      await payload.create({ collection: 'dersler', data, locale: LOCALE, context: ctx() })
    }
  }

  // Teachers (key: ad in tr) and the Hayatı global
  for (const [i, h] of SEED_HOCALAR.entries()) {
    const imza = await upsertMedia(payload, root, h.imza.file, h.imza.alt)
    const data = { ad: h.ad, kalemler: h.kalemler, aciklama: h.aciklama, sayfaAciklama: h.sayfaAciklama, imza, sira: i }
    const found = await payload.find({ collection: 'hocalar', where: { ad: { equals: h.ad } }, locale: LOCALE, limit: 1, depth: 0 })
    if (found.docs[0]) {
      await payload.update({ collection: 'hocalar', id: found.docs[0].id, data, locale: LOCALE, context: ctx() })
    } else {
      await payload.create({ collection: 'hocalar', data, locale: LOCALE, context: ctx() })
    }
  }
  await payload.updateGlobal({
    slug: 'hayati',
    data: { ...SEED_HAYATI, portre: await upsertMedia(payload, root, SEED_PORTRE.file, SEED_PORTRE.alt) } as never,
    locale: LOCALE,
    context: ctx(),
  })

  // Posts: 5 Tefsir articles with full Lexical bodies, cover images, and sources.
  await seedYazilar(payload, { root })

  // Videos (key: youtube id): categories first, then the one real video.
  const videoKatIds = new Map<string, number | string>()
  for (const [i, ad] of SEED_VIDEO_KATEGORILERI.entries()) {
    videoKatIds.set(ad, await upsertByAd(payload, 'video-kategorileri', ad, { sira: i }))
  }
  for (const v of SEED_VIDEOLAR) {
    const data = {
      baslik: v.baslik,
      altBaslik: v.altBaslik,
      youtube: v.youtube,
      kategori: videoKatIds.get(v.kategori),
      kanal: v.kanal,
      sure: v.sure,
      aciklama: v.aciklama,
      anasayfada: v.anasayfada,
      kapak: v.kapak ? await upsertMedia(payload, root, v.kapak, v.baslik) : null,
      sira: 0, // panelde girildiği gibi; sıralama tarih/güncelleme ile
    }
    const found = await payload.find({ collection: 'videolar', where: { youtube: { equals: v.youtube } }, locale: LOCALE, limit: 1, depth: 0 })
    if (found.docs[0]) {
      await payload.update({ collection: 'videolar', id: found.docs[0].id, data: data as never, locale: LOCALE, context: ctx() })
    } else {
      await payload.create({ collection: 'videolar', data: data as never, locale: LOCALE, context: ctx() })
    }
  }

  // Globals
  // E-posta ve form hedefi panelde girildiği gibi; telefon ve adres boş kalır (panelden girilir).
  await payload.updateGlobal({
    slug: 'site-ayarlari',
    data: {
      eposta: 'hattatsitkicoban@gmail.com',
      formHedefEposta: 'hattatsitkicoban@gmail.com',
      instagram: 'https://www.instagram.com/hattatstkcoban/',
      facebook: 'https://www.facebook.com/s.tk.coban.619408',
      youtube: 'https://www.youtube.com/@HattatSitkiCoban',
    },
    locale: LOCALE,
    context: ctx(),
  })
  // Çerez bildirimi metinleri; ölçüm kimliği (gaOlcumKimligi) seed'de yok, panelden girilir.
  for (const locale of LOCALES) {
    await payload.updateGlobal({ slug: 'site-ayarlari', data: { cerez: CEREZ[locale] }, locale, context: ctx() })
  }

  // İletişim sayfası metinleri.
  for (const locale of LOCALES) {
    await payload.updateGlobal({
      slug: 'iletisim',
      data: SEED_ILETISIM[locale] as never,
      locale,
      context: ctx(),
    })
  }

  for (const locale of LOCALES) {
    await payload.updateGlobal({
      slug: 'anasayfa',
      data: ANASAYFA[locale],
      locale,
      context: ctx(),
    })
  }

  for (const locale of LOCALES) {
    await payload.updateGlobal({
      slug: 'ui-metinleri',
      data: Object.fromEntries(UI_KEYS.map((key) => [key, UI_STRINGS[key][locale]])),
      locale,
      context: ctx(),
    })
  }

  return { eserler: design.eserler.length, kitaplar: design.kitaplar.length }
}
