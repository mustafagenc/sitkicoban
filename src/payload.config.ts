import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { appendFileSync } from 'fs'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { tr } from '@payloadcms/translations/languages/tr'

import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { Dersler } from './collections/Dersler'
import { EserTurleri } from './collections/EserTurleri'
import { Eserler } from './collections/Eserler'
import { Kitaplar } from './collections/Kitaplar'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { YaziTurleri } from './collections/YaziTurleri'
import { Anasayfa } from './globals/Anasayfa'
import { SiteAyarlari } from './globals/SiteAyarlari'
import { UiMetinleri } from './globals/UiMetinleri'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Kabul kontrolü için: SORGU_LOG ayarlıysa Drizzle'ın çalıştırdığı her SQL sorgusu bu dosyaya
// bir satır olarak eklenir (scripts/sorgu-kontrol.mjs okur). Ayarlı değilse günlük kapalı.
const sorguLog = process.env.SORGU_LOG
const logger = sorguLog
  ? {
      logQuery: (query: string) => {
        try {
          appendFileSync(sorguLog, query.replace(/\s+/g, ' ') + '\n')
        } catch {
          // Günlük yazılamazsa sorgu yine de çalışsın.
        }
      },
    }
  : false

// Şema `push` (otomatik eşitleme) yalnızca yerel veritabanında açık; uzak/Neon'da migration kullanılır.
const dbHost = (() => {
  try {
    return new URL(process.env.DATABASE_URL || '').hostname.replace(/^\[|\]$/g, '')
  } catch {
    return ''
  }
})()
const yerelDb = ['localhost', '127.0.0.1', '::1'].includes(dbHost)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, YaziTurleri, EserTurleri, Eserler, Kitaplar, Dersler],
  globals: [SiteAyarlari, UiMetinleri, Anasayfa],
  localization: {
    locales: [
      { code: 'tr', label: 'Türkçe' },
      { code: 'en', label: 'English' },
      { code: 'ar', label: 'العربية', rtl: true },
    ],
    defaultLocale: 'tr',
    fallback: true,
  },
  i18n: {
    supportedLanguages: { tr },
    fallbackLanguage: 'tr',
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // Üretim/Neon: `pnpm payload migrate` bu klasördeki migration'ları uygular.
    // Yerel veritabanında (localhost) şema `push` ile eşitlenir; uzak sunucuda `push` kapalıdır.
    push: yerelDb,
    migrationDir: path.resolve(dirname, 'migrations'),
    logger,
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
