type Node = { type?: string; text?: unknown; children?: unknown; fields?: Record<string, unknown> }

const WORDS_PER_MINUTE = 200

/** Plain text of a node; adjacent text nodes join without a space (a word may span formats). */
function plainText(node: Node): string {
  if (node.type === 'text') return typeof node.text === 'string' ? node.text : ''
  if (node.type === 'linebreak' || node.type === 'tab') return ' '
  if (node.type === 'block' && node.fields) {
    // Âyet bloğunun Arapça satırı okuma süresine katılmaz; meal ve öne çıkan söz katılır.
    const { meal, metin } = node.fields
    return ` ${typeof meal === 'string' ? meal : ''} ${typeof metin === 'string' ? metin : ''} `
  }
  if (!Array.isArray(node.children)) return ''
  return ` ${(node.children as Node[]).map(plainText).join('')} `
}

/** Number of words in a Lexical document (text nodes plus block `meal` / `metin`). */
export function wordCount(data: unknown): number {
  const root = (data as { root?: Node } | null | undefined)?.root
  if (!root) return 0
  return plainText(root).split(/\s+/).filter(Boolean).length
}

/** Reading time in minutes: words / 200, rounded up, at least 1. */
export function readingTime(data: unknown): number {
  return Math.max(1, Math.ceil(wordCount(data) / WORDS_PER_MINUTE))
}
