// Load .env files
import 'dotenv/config'
import os from 'node:os'
import path from 'node:path'

// Integration tests always run against the test database.
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
}

// Tests never write into the dev public/media folder.
process.env.MEDIA_DIR ||= path.join(os.tmpdir(), 'sitkicoban-test-media')
