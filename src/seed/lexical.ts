/** Seed gövdeleri için Lexical JSON yardımcıları. */

export const BOLD = 1
export const text = (t: string, format = 0) => ({ type: 'text', version: 1, text: t, format, detail: 0, mode: 'normal', style: '' })
export const p = (...children: ReturnType<typeof text>[]) => ({
  type: 'paragraph',
  version: 1,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
})
export const h2 = (t: string) => ({ type: 'heading', tag: 'h2', version: 1, children: [text(t)], direction: 'ltr', format: '', indent: 0 })
export const ul = (...items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: items.map((t, i) => ({
    type: 'listitem',
    value: i + 1,
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [text(t)],
  })),
})
// Sabit blok id'leri: seed tekrar çalıştığında gövde aynı kalır.
export const block = (id: string, fields: Record<string, unknown>) => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { id, blockName: '', ...fields },
})
export const root = (...children: unknown[]) => ({
  root: { type: 'root', version: 1, children, direction: 'ltr', format: '', indent: 0 },
})
