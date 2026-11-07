import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { tr } from '@payloadcms/translations/languages/tr'

import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

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

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, YaziTurleri, EserTurleri, Eserler, Kitaplar],
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
