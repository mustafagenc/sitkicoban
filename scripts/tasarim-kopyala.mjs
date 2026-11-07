// tasarim/ klasöründeki statik taslak sayfaları public/tasarim/ altına kopyalar.
// Henüz Next'e taşınmamış sayfalar (Yazılar, Videolar, Hayatı, İletişim) oradan sunulur.
import { cpSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'tasarim')
const dest = path.join(root, 'public', 'tasarim')

rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
console.log(`tasarim -> ${path.relative(root, dest)}`)
