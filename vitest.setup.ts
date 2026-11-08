// Load .env files
import 'dotenv/config'
import os from 'node:os'
import path from 'node:path'

// Entegrasyon testleri tabloları silebilir: yalnızca adı `_test` ile biten ayrı bir veritabanında çalışır.
const testUrl = process.env.DATABASE_URL_TEST
if (!testUrl) {
  throw new Error('DATABASE_URL_TEST ayarlı değil; testler yalnızca ayrı bir test veritabanında çalışır.')
}
const dbName = decodeURIComponent(new URL(testUrl).pathname.replace(/^\//, ''))
if (!dbName.endsWith('_test')) {
  throw new Error(`DATABASE_URL_TEST veritabanı adı "_test" ile bitmeli (şu an: "${dbName}").`)
}
process.env.DATABASE_URL = testUrl

// Testler gerçek Blob deposuna asla yazmaz.
delete process.env.BLOB_READ_WRITE_TOKEN

// Tests never write into the dev public/media folder.
process.env.MEDIA_DIR ||= path.join(os.tmpdir(), 'sitkicoban-test-media')
