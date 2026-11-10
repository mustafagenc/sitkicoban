'use client'

import { useEffect } from 'react'

/*
 * WebMCP: tarayıcıdaki yapay zekâ ajanlarına sitenin herkese açık içeriğini okuyan araçlar sunar
 * (W3C Web Machine Learning CG taslağı, document.modelContext). Araçlar yalnızca okur; veriyi
 * statik /ajan.json'dan alır, veritabanına gitmez. API'yi desteklemeyen tarayıcıda hiçbir şey yapmaz.
 * İletişim formu bilerek araç olarak sunulmaz.
 */

type Arac = {
  name: string
  title?: string
  description: string
  inputSchema: Record<string, unknown>
  annotations?: { readOnlyHint?: boolean }
  execute: (input: Record<string, unknown>) => Promise<unknown>
}

type ModelContext = { registerTool: (tool: Arac, options?: { signal?: AbortSignal }) => Promise<unknown> | unknown }

type Veri = {
  eserler: { yaziTurleri: string[] }[]
  kitaplar: unknown[]
  yazilar: { kategori: string | null }[]
  dersler: { bitis: string | null }[]
  iletisim: unknown
}

/** Taslağın güncel adı document.modelContext; eski önizlemeler navigator.modelContext kullanıyordu. */
function modelContext(): ModelContext | null {
  if (typeof window === 'undefined' || !window.isSecureContext) return null
  const mc =
    (document as unknown as { modelContext?: ModelContext }).modelContext ??
    (navigator as unknown as { modelContext?: ModelContext }).modelContext
  return mc && typeof mc.registerTool === 'function' ? mc : null
}

let veriSozu: Promise<Veri> | null = null
const veri = (): Promise<Veri> => {
  veriSozu ??= fetch('/ajan.json').then((r) => {
    if (!r.ok) throw new Error(`ajan.json ${r.status}`)
    return r.json() as Promise<Veri>
  })
  return veriSozu
}

const metin = (s: unknown): string => (typeof s === 'string' ? s.trim().toLocaleLowerCase('tr') : '')
const yanit = (data: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(data) }] })

const ARACLAR: Arac[] = [
  {
    name: 'eserleri_listele',
    title: 'Eserleri listele',
    description:
      "List Sıtkı Çoban's calligraphy works (title, scripts such as Sülüs/Nesih/Ta'lik/Rik'a, type, year, image URL). Optionally filter by script name.",
    inputSchema: {
      type: 'object',
      properties: { yazi_turu: { type: 'string', description: 'Script name to filter by, e.g. "Sülüs" (optional)' } },
    },
    annotations: { readOnlyHint: true },
    execute: async ({ yazi_turu }) => {
      const { eserler } = await veri()
      const q = metin(yazi_turu)
      return yanit(q ? eserler.filter((e) => e.yaziTurleri.some((t) => metin(t).includes(q))) : eserler)
    },
  },
  {
    name: 'kitaplari_listele',
    title: 'Kitapları listele',
    description: "List Sıtkı Çoban's published books with his role (author, editor, …), publisher, year, ISBN and purchase link.",
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => yanit((await veri()).kitaplar),
  },
  {
    name: 'yazilari_listele',
    title: 'Yazıları listele',
    description: "List Sıtkı Çoban's published articles (title, summary, category, date, URL). Optionally filter by category, e.g. \"Tefsir\".",
    inputSchema: {
      type: 'object',
      properties: { kategori: { type: 'string', description: 'Category to filter by (optional)' } },
    },
    annotations: { readOnlyHint: true },
    execute: async ({ kategori }) => {
      const { yazilar } = await veri()
      const q = metin(kategori)
      return yanit(q ? yazilar.filter((y) => metin(y.kategori).includes(q)) : yazilar)
    },
  },
  {
    name: 'dersleri_goster',
    title: 'Güncel dersleri göster',
    description:
      'Show the current calligraphy (meşk) lessons Sıtkı Çoban teaches: institution, day, time, place, capacity and the sign-up page. Expired lessons are left out.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const bugun = new Date().toISOString().slice(0, 10)
      return yanit((await veri()).dersler.filter((d) => !d.bitis || d.bitis.slice(0, 10) >= bugun))
    },
  },
  {
    name: 'iletisim_bilgisi',
    title: 'İletişim bilgileri',
    description: 'Get public contact details: e-mail, social media links and the contact form page (the form itself is not submitted by this tool).',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => yanit((await veri()).iletisim),
  },
]

export function WebMcp() {
  useEffect(() => {
    const mc = modelContext()
    if (!mc) return
    const ctrl = new AbortController()
    for (const arac of ARACLAR) {
      // Aynı ad zaten kayıtlıysa (ör. hızlı sayfa geçişi) hata sayfayı bozmasın.
      Promise.resolve()
        .then(() => mc.registerTool(arac, { signal: ctrl.signal }))
        .catch(() => {})
    }
    return () => ctrl.abort()
  }, [])
  return null
}
