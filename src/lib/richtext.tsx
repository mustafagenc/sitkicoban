// Server component: Lexical JSON → JSX. No client editor code is shipped to visitors.
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  RichText as LexicalRichText,
  type JSXConverter,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { ReactNode } from 'react'

import { yaziPath, type Locale } from '@/i18n/config'
import { slugify } from '@/lib/slug'

type Node = {
  type?: string
  tag?: string
  text?: unknown
  children?: Node[]
  fields?: Record<string, unknown>
}

type Data = SerializedEditorState | null | undefined

function plainText(node: Node): string {
  if (node.type === 'text') return typeof node.text === 'string' ? node.text : ''
  return (node.children ?? []).map(plainText).join('')
}

type HeadingInfo = { id: string; text: string; tag: string }

/** Heading ids in document order: slugify(text), "bolum" when empty, duplicates get -2, -3… */
function headingIds(data: Data): Map<Node, HeadingInfo> {
  const ids = new Map<Node, HeadingInfo>()
  const seen = new Map<string, number>()
  const walk = (node: Node) => {
    if (node.type === 'heading') {
      const text = plainText(node).trim()
      const base = slugify(text) || 'bolum'
      const n = (seen.get(base) ?? 0) + 1
      seen.set(base, n)
      ids.set(node, { id: n === 1 ? base : `${base}-${n}`, text, tag: node.tag ?? 'h2' })
    }
    for (const c of node.children ?? []) walk(c)
  }
  const root = (data as { root?: Node } | null | undefined)?.root
  if (root) walk(root)
  return ids
}

/** Table of contents: the h2 headings with the same ids `RichText` renders. */
export function headings(data: Data): { id: string; text: string }[] {
  return [...headingIds(data).values()].filter((h) => h.tag === 'h2').map(({ id, text }) => ({ id, text }))
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const isExternal = (url: string) => /^(https?:)?\/\//i.test(url)

type LinkFields = {
  url?: string
  newTab?: boolean
  linkType?: 'custom' | 'internal'
  doc?: { relationTo?: string; value?: unknown } | null
}

function linkHref(fields: LinkFields, locale: Locale): string {
  if (fields.linkType === 'internal') {
    const value = fields.doc?.value
    const slug = value && typeof value === 'object' ? (value as { slug?: unknown }).slug : undefined
    if (fields.doc?.relationTo === 'yazilar' && typeof slug === 'string' && slug) return yaziPath(slug, locale)
    return '#'
  }
  return fields.url ?? ''
}

function converters(ids: Map<Node, HeadingInfo>, locale: Locale): JSXConvertersFunction {
  const link: JSXConverter = ({ node, nodesToJSX }) => {
    const fields = (node as unknown as { fields: LinkFields }).fields
    const href = linkHref(fields, locale)
    const external = isExternal(href)
    const rel = [external || fields.newTab ? 'noopener' : '', fields.newTab ? 'noreferrer' : ''].filter(Boolean).join(' ')
    return (
      <a href={href} rel={rel || undefined} target={fields.newTab ? '_blank' : undefined}>
        {nodesToJSX({ nodes: (node as Node).children as never })}
      </a>
    )
  }

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const Tag = (['h2', 'h3', 'h4'].includes(node.tag) ? node.tag : 'h2') as 'h2' | 'h3' | 'h4'
      return <Tag id={ids.get(node as Node)?.id}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    link,
    autolink: link,
    blocks: {
      ayet: ({ node }: { node: Node }) => {
        const f = node.fields ?? {}
        return (
          <div className="ayet">
            <p className="ar" lang="ar" dir="rtl">
              {str(f.arapca)}
            </p>
            {str(f.meal) && <p className="tr">{str(f.meal)}</p>}
            {str(f.kaynak) && <p className="src">{str(f.kaynak)}</p>}
          </div>
        )
      },
      oneCikanSoz: ({ node }: { node: Node }) => <blockquote className="pull">{str(node.fields?.metin)}</blockquote>,
    },
  })
}

/** Renders a Lexical body: headings with anchor ids, Âyet and Öne çıkan söz blocks. */
export function RichText({ data, locale, className }: { data: Data; locale: Locale; className?: string }): ReactNode {
  if (!data?.root) return null
  return (
    <LexicalRichText
      data={data}
      converters={converters(headingIds(data), locale)}
      className={className}
      disableContainer={!className}
    />
  )
}
