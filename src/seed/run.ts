import { getPayload } from 'payload'

import config from '@/payload.config'
import { seed } from './index'

const payload = await getPayload({ config })
const result = await seed(payload)
console.log(`eserler: ${result.eserler}, kitaplar: ${result.kitaplar}`)
await payload.destroy?.()
process.exit(0)
