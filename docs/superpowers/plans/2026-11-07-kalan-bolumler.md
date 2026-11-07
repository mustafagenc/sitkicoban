# Kalan bölümler (2. aşama) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Dersler, Yazılar, Hayatı + İcazet, Videolar and İletişim (Resend form) into the CMS with pages that match `tasarim/`, then remove the `/tasarim/*` static copies.

**Architecture:** Same pattern as phase 1. Each section gets:
- a Payload collection or global with localized text fields;
- a tag-cached getter in `src/lib/data.ts`;
- a cache tag that maps to its pages for invalidation and warm-up;
- a statically generated page under `src/app/(frontend)/[locale]/`.

New pages register in `ROUTES`, and the proxy and invalidation pick them up from there. Yazı detail pages are the first dynamic-segment route (`/yazilar/<slug>`). The contact form posts to a server action that sends through Resend without touching the DB.

**Tech Stack:** Next.js 16.3, Payload 3.93 (`@payloadcms/richtext-lexical` already configured), `resend`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-07-kalan-bolumler-design.md` (builds on `docs/superpowers/specs/2026-11-07-altyapi-design.md`)

## Global Constraints

- **No DB on visitor requests.** No database query on a visitor request, including the contact form submission. Queries are allowed only on admin use, seed, build, and the warm-up after a save.
- **Tag-only invalidation.** No time-based revalidation. Each save invalidates only the pages that show the saved data, in all 3 locales, and then warms them.
- **Localization.** Locales are `tr` (default), `en` and `ar` (rtl). A missing translation shows Turkish.
  - Text fields are localized; dates, media, links and numbers are not.
  - All visible and aria UI text comes from the `ui-metinleri` global. Components contain no hardcoded per-locale strings.
- **Public paths.**

  | Page | tr | en | ar |
  |---|---|---|---|
  | Yazılar | `/yazilar` | `/en/writings` | `/ar/writings` |
  | Yazı detail | `/yazilar/<slug>` | `/en/writings/<slug>` | `/ar/writings/<slug>` |
  | Videolar | `/videolar` | `/en/videos` | `/ar/videos` |
  | Hayatı | `/hayati` | `/en/biography` | `/ar/biography` |
  | İletişim | `/iletisim` | `/en/contact` | `/ar/contact` |
  | Aydınlatma | `/iletisim/aydinlatma` | `/en/contact/privacy` | `/ar/contact/privacy` |

  The slug is the same in all locales.
- **Design fidelity.** Visuals match the corresponding `tasarim/*.html` page in light and dark, at 1280 and 375. Copy the CSS rather than rewriting it.
- **Empty optional fields.** An empty optional field renders nothing: no empty rows and no separators.
- **Seed rules.**
  - Only real content is published. Of the sample posts, only the one with a sample body is `yayinda`. Of the sample videos, only "Affetmenin Hafifliği" (`aLry4uypqxs`) is seeded.
  - Every seed write passes `context: { disableRevalidate: true }`.
- **Media URLs.** Always built through `mediaUrl()`. The `/api/media/file/*` route is never used.
- **Schema changes.** Every schema change gets a Payload migration (`pnpm payload migrate:create <ad>`). Dev keeps `push`.
- **Commits.** Messages are in Turkish. No "Claude" and no `Co-Authored-By`. Stage files by name. Never stage `.claude/`, `.superpowers/`, `.env`, `public/media` or `AGENTS.md`/`CLAUDE.md`.
- **Tests.** Tests run only against `sitkicoban_test` (guarded in `vitest.setup.ts`).

## Review Focus

1. **Yazı slug changes or unpublishing.** If a published yazı's slug changes or it is unpublished, the old detail URL must 404 after save, and both the old and new paths are invalidated. *Test in Task 1 (paths) and Task 4 (page).*
2. **Unknown slugs.** An unknown or unpublished slug (`/yazilar/yok`, `/en/writings/taslak-yazi`) must 404 without serving another yazı. *Test in Task 4.*
3. **Contact form abuse.** The submission must not send mail and must not reveal rejection in any of these cases:
   - honeypot filled;
   - submitted under 3 s after render;
   - message over 2000 chars;
   - missing e-mail;
   - `RESEND_API_KEY` unset.

   It must never throw to the visitor. *Test in Task 7.*
4. **All lessons expired.** The Dersler section and its heading disappear. A lesson whose `bitis` is today is still shown. *Test in Task 2.*
5. **Lexical bodies with Arabic.** The Âyet block's Arabic line renders `dir="rtl"` `lang="ar"` even on `/en`. Headings get stable anchor ids for the Hayatı TOC, including Turkish characters. *Test in Tasks 3 and 5.*

---

## File Structure (new/changed)

```
src/i18n/config.ts                 – PageKey + ROUTES extended; yaziPath(); resolvePath handles yazilar/<slug>, iletisim/aydinlatma
src/proxy.ts                       – rewrite /{l}/yazilar/{slug} internal route
src/lib/cache/tags.ts              – new tags + sources
src/lib/cache/revalidate.ts        – PAGES_BY_TAG extended; per-doc extra paths for yazilar
src/lib/data.ts                    – new cached getters
src/lib/richtext.tsx               – server-side Lexical → JSX (Âyet, Pull blocks, heading ids)
src/lib/readingTime.ts             – okuma süresi from Lexical JSON
src/collections/{Dersler,YaziKategorileri,Yazilar,Hocalar,VideoKategorileri,Videolar}.ts
src/globals/{Hayati,Iletisim}.ts   (+ new keys in UiMetinleri.ts)
src/blocks/{Ayet,OneCikanSoz}.ts
src/app/(frontend)/[locale]/{yazilar,yazilar/[slug],videolar,hayati,iletisim,iletisim/aydinlatma}/page.tsx
src/app/(frontend)/styles/{yazilar,yazi,videolar,hayati,iletisim}.css
src/components/{HomeDersler,HomeYazilar,HomeVideo,HomeIcazet,HomeHayati,PostList,PostProgress,VideoGallery,VideoModal,BioToc,ContactForm}.tsx
src/app/(frontend)/[locale]/iletisim/actions.ts – sendContact server action
src/lib/contact.ts                 – validateContact(), spam checks, buildEmail()
src/seed/index.ts (+ src/seed/{dersler,yazilar,hayati,videolar,iletisim}.ts)
scripts/sorgu-kontrol.mjs          – crawl new pages, contact-form query check
```

---

### Task 1: Routing and invalidation for the new pages

**Files:**
- Modify: `src/i18n/config.ts`, `src/proxy.ts`, `src/lib/cache/tags.ts`, `src/lib/cache/revalidate.ts`
- Test: `tests/int/i18n.spec.ts`, `tests/int/tags.spec.ts`, `tests/int/revalidate.int.spec.ts`

**Interfaces:**
- Produces:
  - **Page keys and routes:**
    - `type PageKey = 'home'|'eserler'|'kitaplar'|'yazilar'|'videolar'|'hayati'|'iletisim'|'aydinlatma'`
    - `ROUTES.yazilar = {tr:'yazilar',en:'writings',ar:'writings'}`
    - `ROUTES.videolar = {tr:'videolar',en:'videos',ar:'videos'}`
    - `ROUTES.hayati = {tr:'hayati',en:'biography',ar:'biography'}`
    - `ROUTES.iletisim = {tr:'iletisim',en:'contact',ar:'contact'}`
    - `ROUTES.aydinlatma = {tr:'iletisim/aydinlatma',en:'contact/privacy',ar:'contact/privacy'}`
  - **Path helpers:**
    - `yaziPath(slug: string, l: Locale): string`. For example, `yaziPath('x','en') === '/en/writings/x'`.
    - `resolvePath` additionally returns `{ locale, key:'yazi', slug }`.
    - Its return type becomes `{locale, key: PageKey} | {locale, key:'yazi', slug: string} | {redirect} | null`.
    - The internal rewrite targets are:
      - `/{locale}/yazilar/{slug}` for yazı;
      - `/{locale}/iletisim/aydinlatma` for aydinlatma;
      - otherwise `/{locale}/{key}` as before (home → `/{locale}`).
  - **Tags and sources:**
    - `Tag` adds `'dersler'|'yazilar'|'hayati'|'videolar'|'iletisim'`.
    - `TAGS_BY_SOURCE` adds:
      - `dersler`→`['dersler']`
      - `yazilar`→`['yazilar']`
      - `yazi-kategorileri`→`['yazilar']`
      - `hayati`→`['hayati']`
      - `hocalar`→`['hayati']`
      - `videolar`→`['videolar']`
      - `video-kategorileri`→`['videolar']`
      - `iletisim`→`['iletisim']`
  - **Pages per tag (`PAGES_BY_TAG`):**
    - `dersler`→`['home']`
    - `yazilar`→`['yazilar','home','kitaplar']`
    - `hayati`→`['hayati','home']`
    - `videolar`→`['videolar','home']`
    - `iletisim`→`['iletisim','aydinlatma']`
    - `ayarlar`, `ui` and `media` → every PageKey.
  - **Per-doc yazı paths:** `revalidateHooks('yazilar')` additionally invalidates and warms `yaziPath(slug, l)` for every locale, for both `doc.slug` and `previousDoc.slug` (deduplicated).

- [ ] **Step 1: Write failing tests.**
  - `localizedPath('hayati','ar') === '/ar/biography'`
  - `resolvePath('/en/writings/ihlas')` deep-equals `{locale:'en',key:'yazi',slug:'ihlas'}`
  - `resolvePath('/yazilar/ihlas')` → `{locale:'tr',key:'yazi',slug:'ihlas'}`
  - `resolvePath('/tr/yazilar/ihlas')` → `{redirect:'/yazilar/ihlas'}`
  - `resolvePath('/en/yazilar/x') === null`
  - `resolvePath('/yazilar/a/b') === null`
  - `resolvePath('/iletisim/aydinlatma')` → `{locale:'tr',key:'aydinlatma'}`
  - `resolvePath('/en/contact/privacy')` → `{locale:'en',key:'aydinlatma'}`
  - `pathsForTags(['dersler'])` equals the set `['/','/en','/ar']`
  - In `revalidate.int.spec.ts`, updating a yazı whose slug changed `a`→`b` warms `/yazilar/a`, `/yazilar/b` and `/en/writings/b` among its paths.
- [ ] **Step 2: Run them to verify they fail.** Run `pnpm test:int i18n tags revalidate`. Expected: FAIL.
- [ ] **Step 3: Implement.** Keep `resolvePath` pure. In the proxy, map the `yazi` result to the internal route.
  - Collections for `yazilar` don't exist yet. The revalidate test may use a minimal stub collection registered only in the test, or this test case moves to Task 3. Your call; note it in the report.
- [ ] **Step 4: Run them to verify they pass.** Then run the full `pnpm test:int` and `pnpm exec tsc --noEmit`.
- [ ] **Step 5: Commit.** Message: `Yeni sayfalar için yollar ve önbellek etiketleri`.

### Task 2: Dersler

**Files:**
- Create: `src/collections/Dersler.ts`, `src/seed/dersler.ts`, `tests/int/dersler.int.spec.ts`, `src/components/dersler.ts` (pure `aktifDersler`)
- Modify: `src/payload.config.ts`, `src/lib/data.ts`, `src/components/HomeDersler.tsx`, `src/app/(frontend)/[locale]/page.tsx`, `src/seed/index.ts`, `src/globals/UiMetinleri.ts` + `src/seed/ui-metinleri.ts` (section eyebrow/heading/desc, labels such as "Kontenjan", "Afişi büyüt", "Bilgi almak için yazın")

**Interfaces:**
- Consumes: Task 1 tags; `mediaUrl`; `localizedPath('iletisim', l)`.
- Produces:
  - **Collection `dersler`:**

    | Field | Notes |
    |---|---|
    | `kurum`* | |
    | `baslik`* | |
    | `altBaslik`* | optional |
    | `aciklama`* | |
    | `gun`* | |
    | `saat` | |
    | `yer`* | optional |
    | `kontenjan` | optional |
    | `afis` | media, optional |
    | `bitis` | date, required |
    | `sira` | |

    Fields marked `*` are localized.
  - **`getDersler(locale)`** returns all lessons, tagged `dersler`+`media`, sorted by `sira`.
  - **`aktifDersler(list, today: string /*YYYY-MM-DD*/)`** keeps lessons with `bitis >= today`.
  - **Seed:** the two lessons exactly as in `tasarim/index.html` `.ders` cards (kurum, title, subtitle, description, day, time, place, quota, poster `duyuru-imu-mesk.jpg`, `data-bitis` dates). The Çamlıca card has no poster and keeps the `.afis.bos` placeholder look.

- [ ] **Step 1: Write failing tests.**
  - `aktifDersler([{bitis:'2026-01-01'},{bitis:'2026-11-07'}], '2026-11-07')` keeps only the second.
  - An empty input returns `[]`.
  - After seed, `count('dersler') === 2` and the İMÜ lesson has `kontenjan` and `afis`.
- [ ] **Step 2: Run them to verify they fail.**
- [ ] **Step 3: Implement.** `HomeDersler` receives lesson data and `ui` via props.
  - It evaluates `aktifDersler` on the client after mount, with today's date in the visitor's timezone, as the design does.
  - The section and heading are hidden when the list is empty.
  - The poster lightbox stays as built.
  - The "bilgi" link goes to `localizedPath('iletisim', l) + '?konu=Meşk'`.
  - Remove the hardcoded lesson data.
- [ ] **Step 4: Run the tests, then generate the migration.** Run `pnpm test:int` and `tsc`. Then `pnpm payload migrate:create dersler`. Then `pnpm seed` on the dev DB.
- [ ] **Step 5: Check in the browser.** The home Dersler section matches `tasarim/index.html` (light/dark, 1280/375).
  - Expire one lesson in the admin: after the save, only the home pages are warmed (check the `[yenile]` log) and the card disappears.
  - `/en` shows English chrome.
- [ ] **Step 6: Commit.** Message: `Dersler panelden: ana sayfa dönem dersleri`.

### Task 3: Rich text and the Yazılar content model

**Files:**
- Create: `src/blocks/Ayet.ts`, `src/blocks/OneCikanSoz.ts`, `src/collections/YaziKategorileri.ts`, `src/collections/Yazilar.ts`, `src/lib/richtext.tsx`, `src/lib/readingTime.ts`, `src/seed/yazilar.ts`, `tests/int/richtext.spec.tsx`, `tests/int/yazilar.int.spec.ts`
- Modify: `src/payload.config.ts`, `src/seed/index.ts`

**Interfaces:**
- Produces:
  - **Blocks.** `Ayet` block slug `ayet`: `arapca` (not localized), `meal`*, `kaynak`*. `OneCikanSoz` block slug `oneCikanSoz`: `metin`*.
  - **Collection `yazi-kategorileri`:** `ad`*, `sira`.
  - **Collection `yazilar`:**

    | Field | Notes |
    |---|---|
    | `baslik`* | |
    | `slug` | `uniqueSlug` from Task 2 of phase 1 |
    | `kategori` | relation |
    | `ozet`* | |
    | `govde`* | lexical, with the blocks above |
    | `tarih` | date |
    | `okumaSuresi` | number; auto from tr `govde` when empty or when `okumaSuresiOtomatik` is true |
    | `kapak` | media, optional |
    | `kaynaklar`* | array of `metin` |
    | `ilgiliKitaplar` | hasMany relation to `kitaplar` |
    | `yayinda` | checkbox, default false |

  - **`readingTime(lexicalJson): number`.** Words / 200, rounded up, minimum 1. It counts text nodes, block `meal` and block `metin`.
  - **`RichText({ data, locale }): JSX`** is server-only. It renders:
    - paragraphs and h2/h3, with `id = slugify(text)` and deduplicated `-2`;
    - bold, italic, links (external links get `rel="noopener"`);
    - lists and quote;
    - `ayet` → the design's `.ayet` markup, with the Arabic line in `<p class="ar" lang="ar" dir="rtl">`;
    - `oneCikanSoz` → `.pull`.

    It also exports `headings(data): {id, text}[]` for the TOC.
  - **Getters:**
    - `getYazilar(locale)`: published only, sorted by `tarih` desc.
    - `getYazi(slug, locale)`: published only, else null.
    - `getYaziSluglari()`: published slugs, for `generateStaticParams`.
    - `getYaziKategorileri(locale)`.
    - All are tagged `yazilar` (+`media`).
  - **Seed:**
    - Categories: Tefsir, Sanat, Edebiyat.
    - The 7 posts from `tasarim/yazilar.html`: the featured post "İhlâs'ın İlk Âyeti ve Üç Mertebe" plus the `posts` array, with titles, categories, summaries and dates mapped to real dates (e.g. "Mart 2025" → 2025-03-01).
    - Only the first gets the sample body from `tasarim/yazi.html`, converted to Lexical, including one `ayet` block, one `oneCikanSoz` block and its sources. It is `yayinda:true`. The rest are `yayinda:false`.

- [ ] **Step 1: Write failing tests.**
  - `readingTime` of a 450-word body is 3.
  - `RichText` renders an `ayet` block with `lang="ar" dir="rtl"` on the Arabic line, and an h2 "Bilmekten görmeye" with `id="bilmekten-gormeye"`.
  - Two equal headings get `-2`.
  - Seed: `count('yazilar') === 7`, and exactly 1 is `yayinda`.
  - `getYazi('<an unpublished slug>')` is null. Call the getters' uncached inner functions in tests, or the Local API with the same `where`.
- [ ] **Step 2: Run them to verify they fail.**
- [ ] **Step 3: Implement.**
  - Render with `@payloadcms/richtext-lexical/react` converters where they fit, plus custom block and heading converters.
  - Register the blocks in the `govde` field's `BlocksFeature`.
- [ ] **Step 4: Run tests, tsc, migration and seed.** Run `pnpm test:int`, `tsc`, then `pnpm payload migrate:create yazilar`, then `pnpm seed`. Open a yazı in `/admin` and check that the blocks are editable.
- [ ] **Step 5: Commit.** Message: `Yazılar içerik modeli ve zengin metin`.

### Task 4: Yazılar pages

**Files:**
- Create: `src/app/(frontend)/[locale]/yazilar/page.tsx`, `src/app/(frontend)/[locale]/yazilar/[slug]/page.tsx`, `src/app/(frontend)/styles/{yazilar,yazi}.css` (from `tasarim/yazilar.html` and `tasarim/yazi.html`), `src/components/{PostList,PostProgress,HomeYazilar}.tsx`
- Modify: `src/components/navLinks.ts`, `src/components/BookModal.tsx` (İlgili yazılar), `src/app/(frontend)/[locale]/page.tsx`, `src/components/HomeStatic.tsx`, UI keys + seed

**Interfaces:**
- Consumes: Task 3 getters, `RichText`, `yaziPath`, `localizedPath`.
- Produces:
  - **List page.** Featured latest post, numbered list, category chips (client filter). The `?kitap=<kitap slug>` query filters to posts with that `ilgiliKitaplar`, client-side.
  - **Detail page.**
    - `generateStaticParams`: published slugs × 3 locales.
    - It calls `notFound()` for unknown or unpublished slugs before any other getter. `dynamicParams` stays default; the reason is in Task 10 of phase 1.
    - Contents: crumb, title, summary, author · date · reading time, body, sources, prev/next published post, reading-progress bar.
  - **`HomeYazilar`.** The home "Son yazılar" section shows the 3 latest published posts. It replaces the static block.
  - **Book modal.** "İlgili yazılar" goes to `localizedPath('yazilar', l) + '?kitap=' + slug`. It shows only if a published post relates to that book; pass that set from the kitaplar page data.
  - **Nav.** Yazılar now goes to `localizedPath('yazilar', l)`.
  - **Dates.** Formatted per locale with `Intl.DateTimeFormat(locale, {month:'long', year:'numeric'})`. Reading-time text comes from a UI key with an `{n}` placeholder.

- [ ] **Step 1: Build the pages.**
- [ ] **Step 2: Check the build and routing.** Run `pnpm build`: the yazı detail pages are listed as SSG for 3 locales. Then curl:
  - `/yazilar/ihlasin-ilk-ayeti-ve-uc-mertebe` (or the seeded slug) → 200;
  - `/yazilar/yok` → 404;
  - the slug of an unpublished seeded post → 404;
  - `/en/writings/<slug>` → 200.
- [ ] **Step 3: Check in the browser.** Compare against `/tasarim/yazilar.html` and `/tasarim/yazi.html` (light/dark, 1280/375). Then:
  - Toggle `yayinda` on a second post in the admin: the list, its detail page and home are warmed; its page is served without queries.
  - Change its slug: the old URL 404s.
  - `/ar/writings/<slug>` is mirrored, with the Âyet Arabic line rtl.
- [ ] **Step 4: Commit.** Message: `Yazılar sayfaları: liste, yazı, ana sayfada son yazılar`.

### Task 5: Hayatı and İcazet

**Files:**
- Create: `src/globals/Hayati.ts`, `src/collections/Hocalar.ts`, `src/app/(frontend)/[locale]/hayati/page.tsx`, `src/app/(frontend)/styles/hayati.css`, `src/components/{BioToc,HomeIcazet,HomeHayati}.tsx`, `src/seed/hayati.ts`, `tests/int/hayati.int.spec.ts`
- Modify: `src/payload.config.ts`, `src/lib/data.ts`, home page, `HomeStatic.tsx` (remove İcazet/Hayatı), navLinks, UI keys + seed

**Interfaces:**
- Produces:
  - **Global `hayati`:**
    - `girisCumlesi`*
    - `portre` (media)
    - `kunye`: array of `{etiket*, deger*}` (Doğum, Eğitim, İcazet, Görev, as in the design's info box)
    - `bolumler`: array of `{baslik*, govde*}`, where `govde` is lexical
    - `anasayfaOzet`* (lexical or textarea)
  - **Collection `hocalar`:** `ad`, `kalemler`*, `aciklama`*, `imza` (media), `sira`.
  - **Getters:** `getHayati(locale)` and `getHocalar(locale)`, tagged `hayati`+`media`.
  - **TOC.** `BioToc` uses `bolumler` titles with `slugify` ids, the same function as `RichText`'s headings. The highlight follows scroll, as in the design.
  - **Seed:** text from `tasarim/hayati.html`, keeping the existing bio prose unchanged; the two teachers with signatures `imza-hasan-celebi.png` and `imza-erol-donmez.png`; the home İcazet/Hayatı texts from `tasarim/index.html`.

- [ ] **Step 1: Write failing tests.** After seed:
  - `hayati.bolumler.length === 5`, with titles "İlim yolculuğu" … "Muallimlik";
  - `count('hocalar') === 2`;
  - the TOC ids for the seeded titles are unique and ASCII.
- [ ] **Step 2: Run them to verify they fail.**
- [ ] **Step 3: Implement, migrate and seed.** Implement, then `pnpm payload migrate:create hayati`, then `pnpm seed`.
- [ ] **Step 4: Check in the browser.** Compare `/hayati` against `/tasarim/hayati.html`, and the home İcazet/Hayatı sections against `/tasarim/index.html` (light/dark, 1280/375). Editing a teacher warms only `hayati` and home.
- [ ] **Step 5: Commit.** Message: `Hayatı ve icazet panelden`.

### Task 6: Videolar

**Files:**
- Create: `src/collections/{VideoKategorileri,Videolar}.ts`, `src/lib/youtube.ts`, `src/app/(frontend)/[locale]/videolar/page.tsx`, `src/app/(frontend)/styles/videolar.css`, `src/components/{VideoGallery,VideoModal,HomeVideo}.tsx`, `src/seed/videolar.ts`, `tests/int/youtube.spec.ts`
- Modify: config, data, home page, `HomeStatic.tsx` (remove Video; delete the file if empty), navLinks, UI keys + seed

**Interfaces:**
- Produces:
  - **`youtubeId(input: string): string | null`.** It accepts:
    - a bare 11-char ID;
    - `youtu.be/<id>`;
    - `youtube.com/watch?v=<id>`;
    - `/shorts/<id>` and `/embed/<id>`.

    Anything else gives null.
  - **Validation.** The `youtube` field validates through `youtubeId`.
  - **Thumbnail.** `youtubeThumb(id) = https://i.ytimg.com/vi/<id>/hqdefault.jpg`.
  - **Collection `video-kategorileri`:** `ad`*, `sira`.
  - **Collection `videolar`:**

    | Field | Notes |
    |---|---|
    | `baslik`* | |
    | `altBaslik`* | |
    | `youtube` | |
    | `kategori` | |
    | `seri`* | |
    | `bolum` | |
    | `sure` | |
    | `tarih` | |
    | `kanal` | |
    | `aciklama`* | |
    | `kapak` | media, optional |
    | `anasayfada` | checkbox; at most one is used, the newest checked |
    | `sira` | |

  - **`getVideolar(locale)`**, tagged `videolar`+`media`.
  - **Modal.** It mounts the `youtube-nocookie.com/embed/<id>?autoplay=1&rel=0` iframe only when opened. Series episodes appear in the side list, as in the design.
  - **Seed:** categories Meşk, Söyleşi, Program; one video, "Affetmenin Hafifliği" (`aLry4uypqxs`, TRT 2, "Ramazan Sosyolojisi · 2. Bölüm"), with `anasayfada:true`.

- [ ] **Step 1: Write failing tests** for `youtubeId`:
  - `'aLry4uypqxs'`, `'https://youtu.be/aLry4uypqxs'`, `'https://www.youtube.com/watch?v=aLry4uypqxs&t=3'` and `'https://youtube.com/shorts/aLry4uypqxs'` all give `'aLry4uypqxs'`.
  - `'https://example.com'` and `'abc'` give null.
- [ ] **Step 2: Run them to verify they fail, then implement, migrate and seed.** Run `pnpm payload migrate:create videolar`, then `pnpm seed`.
- [ ] **Step 3: Check in the browser.**
  - Compare `/videolar` against `/tasarim/videolar.html`, and the home Video section (light/dark, 1280/375).
  - The network panel shows no request to youtube or ytimg iframes before the click. The thumbnail image from `i.ytimg.com` is allowed.
  - The modal opens and closes with Esc.
  - Category chips work, and the empty category message comes from a UI key.
- [ ] **Step 4: Commit.** Message: `Videolar panelden: liste, oynatıcı, ana sayfa videosu`.

### Task 7: İletişim (page, privacy page, Resend form)

**Files:**
- Create: `src/globals/Iletisim.ts`, `src/lib/contact.ts`, `src/app/(frontend)/[locale]/iletisim/{page.tsx,actions.ts}`, `src/app/(frontend)/[locale]/iletisim/aydinlatma/page.tsx`, `src/app/(frontend)/styles/iletisim.css`, `src/components/ContactForm.tsx`, `src/seed/iletisim.ts`, `tests/int/contact.spec.ts`
- Modify: config, data, navLinks, `WorkLightbox.tsx` (ask link), `.env.example` (`RESEND_API_KEY=`, `RESEND_FROM=`), `package.json` (`resend`), UI keys + seed

**Interfaces:**
- Produces:
  - **Global `iletisim`:**
    - `aciklama`*
    - `maddeler`: array of `{baslik*, metin*}`, the four "Ne için yazabilirsiniz" items
    - `konular`: array of `{ad*}`
    - `aydinlatmaMetni`* (lexical)
  - **Existing settings.** Contact e-mail and social links stay in `site-ayarlari`; the form target is `site-ayarlari.formHedefEposta`.
  - **Getter.** `getIletisim(locale)` is tagged `iletisim`.
  - **`validateContact(input: FormData|Record<string,string>, now: number): { ok: true, data: {ad, eposta, konu, telefon?, mesaj} } | { ok: false, reason: 'spam'|'invalid' }`.** Rules:
    - honeypot field `website` non-empty → spam;
    - `t` (render timestamp, ms) missing, or `now - t < 3000` → spam;
    - `ad` 1–100;
    - `eposta` matches a basic e-mail regex, ≤200;
    - `mesaj` 1–2000;
    - `onay` must be `"on"`;
    - otherwise → invalid.
  - **`sendContact(prev, formData)`** is a server action returning `{ status: 'ok'|'error'|'unavailable' }`. Behaviour:
    - **Spam:** returns `ok` and sends nothing.
    - **Invalid:** returns `error`.
    - **No `RESEND_API_KEY`/`RESEND_FROM`:** returns `unavailable`.
    - **Valid:** sends through `new Resend(key).emails.send({ from: RESEND_FROM, to: target, replyTo: eposta, subject: '[sitkicoban.com] ' + konu + ' — ' + ad, text })`.
    - **Target address:** read through the cached `getSiteAyarlari('tr')`, so no DB query happens on a warm cache. Pass the locale to the action for UI messages only.
    - **Errors:** caught, logged, return `error`. It never throws.
  - **Prefill.** `ContactForm` prefills from `?konu=` and `?eser=` (the `eser` text uses UI key `eserHakkinda` with `{eser}`). Validation messages, the character counter, button and status messages all come from UI keys.
  - **Privacy page** renders `aydinlatmaMetni` with `RichText`. The form's checkbox links to it.

- [ ] **Step 1: Write failing tests** (`tests/int/contact.spec.ts`). Mock `resend` with `vi.mock`.
  - The honeypot case, the `now - t = 1000` case and the 2001-char message case → no `send` call, and `sendContact` returns `ok`, `ok` and `error` respectively.
  - Missing `RESEND_API_KEY` → `unavailable`, no send.
  - A valid input → `send` is called once with `replyTo` equal to the visitor e-mail and `to` equal to `formHedefEposta`.
  - A `send` rejection → `error`, no throw.
- [ ] **Step 2: Run them to verify they fail, then implement.** Migrate with `pnpm payload migrate:create iletisim`, then `pnpm seed`.
  - The seed texts come from `tasarim/iletisim.html`.
  - The `aydinlatmaMetni` seed is a short placeholder paragraph clearly marked "Hukuki metin girilecek". It is not presented as a real legal text.
- [ ] **Step 3: Check in the browser.**
  - Compare `/iletisim` against `/tasarim/iletisim.html` (light/dark, 1280/375).
  - `?konu=Meşk` preselects the subject. The eser link from the work lightbox prefills the message.
  - Without `RESEND_API_KEY`, submitting shows the "şu an gönderilemiyor" UI text.
  - `/iletisim/aydinlatma` renders.
- [ ] **Step 4: Commit.** Message: `İletişim sayfası ve Resend ile form`.

### Task 8: Remove the static copies, acceptance, migrations check, README

**Files:**
- Delete: `scripts/tasarim-kopyala.mjs`, `src/components/HomeStatic.tsx` (if not already removed)
- Modify: `src/i18n/config.ts` (remove `TASARIM_LINKS`), `src/proxy.ts` (matcher drops `tasarim`), `package.json` (drop `predev`/`prebuild` copy hooks), `.gitignore` (`public/tasarim/` line can stay), every remaining `TASARIM_LINKS` or `/tasarim/` reference in `src/`, `scripts/sorgu-kontrol.mjs`, `README.md`, `src/payload.config.ts` or `Media.ts` (the `_objectKey` schema issue below)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Remove the static copies.**
  - `grep -rn "/tasarim/\|TASARIM_LINKS" src scripts` returns nothing, apart from comments that explicitly describe `tasarim/` as the design reference.
  - Delete the local `public/tasarim` directory.
  - Everything that used `/tasarim/img/...` (signatures, logo, favicon, poster) now uses media docs via `mediaUrl`, or files copied into `public/` with a fixed name: `public/imza.png`, `public/favicon.svg`.
- [ ] **Step 2: Make the Media schema identical with and without Blob.**
  - With `BLOB_READ_WRITE_TOKEN` set, the Blob plugin adds a `_objectKey` field to `media`. The phase-1 migration was generated without it, so production (token set) would miss the column.
  - Make the schema the same with and without the token, for example by always registering the plugin with `enabled` true only for uploads, or by declaring the field. Verify by running `pnpm payload migrate:create blob_anahtari` with and without the token: the second run must report no changes.
  - Then verify the whole migration chain on a fresh `createdb sitkicoban_mig` with the token set: `pnpm payload migrate`, then `pnpm seed`. Afterwards run `dropdb`.
- [ ] **Step 3: Extend the acceptance script.**
  - `scripts/sorgu-kontrol.mjs` crawls all public pages (now 18, plus the published yazı detail × 3) and requires zero queries.
  - It PATCHes a ders and asserts `[yenile]` lists only home paths.
  - It POSTs a contact submission through the page's server action (or a direct fetch with the action header, whichever is reliable) with `RESEND_API_KEY` unset, and asserts zero queries for that request.
  - Run it per the README: `pnpm build`, start with `SORGU_LOG`/`SUNUCU_LOG`, then `pnpm sorgu-kontrol`. Expected: pass.
- [ ] **Step 4: Update the README.** Cover the new sections, the `RESEND_API_KEY`/`RESEND_FROM` env vars (Resend needs a verified sender domain), and the removal of the `/tasarim` copies.
- [ ] **Step 5: Run the full checks.** Run `pnpm test:int && pnpm lint && pnpm build`. Expected: pass. For lint, no new errors; the 3 pre-existing set-state-in-effect errors may stay.
- [ ] **Step 6: Commit.** Message: `Statik tasarım kopyaları kaldırıldı, kabul kontrolü genişletildi`.
