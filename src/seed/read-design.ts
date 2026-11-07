import { readFileSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

export type DesignEser = {
  f: string
  r?: number
  t: string
  yazi: string[]
  tur?: string
  y?: string
  ar?: string
  mean?: string
  src?: string
  desc?: string
  olcu?: string
  malzeme?: string
  tezhip?: string
  ebru?: string
}

export type DesignKitap = {
  t: string
  sub?: string
  role?: string
  a?: string
  img?: string
  contain?: boolean
  pub?: string
  yil?: string
  sayfa?: number
  isbn?: string
  d?: string
}

/** Runs only the data part of a design script (everything before the self-invoking modal code). */
function extract<T>(file: string, key: 'ESERLER' | 'KITAPLAR'): T {
  const source = readFileSync(file, 'utf8')
  const iife = source.search(/^\(\s*\(\s*\)\s*=>/m)
  const dataOnly = iife === -1 ? source : source.slice(0, iife)
  const window: Record<string, unknown> = {}
  // Stub DOM: the data section is pure, but be safe if a helper touches document.
  const document = new Proxy({}, { get: () => () => undefined })
  vm.runInNewContext(dataOnly, { window, document }, { filename: file })
  const value = window[key]
  if (!Array.isArray(value)) throw new Error(`${file}: window.${key} not found`)
  return value as T
}

export function readDesign(root = 'tasarim'): { eserler: DesignEser[]; kitaplar: DesignKitap[] } {
  const base = path.resolve(process.cwd(), root)
  return {
    eserler: extract<DesignEser[]>(path.join(base, 'eser-lb.js'), 'ESERLER'),
    kitaplar: extract<DesignKitap[]>(path.join(base, 'kitap-lb.js'), 'KITAPLAR'),
  }
}
