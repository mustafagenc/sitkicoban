import { getPayload } from 'payload'

import config from '@/payload.config'
import { seed, seedEserler, seedYazilar } from './index'
import { uzakVeritabaniniReddet } from './uzak-koruma'

// Veritabanına bağlanmadan önce: canlıya yanlışlıkla seed atılmasın.
const ret = uzakVeritabaniniReddet()
if (ret) {
  console.error(ret)
  process.exit(1)
}

const payload = await getPayload({ config })
if (process.env.SEED_ONLY === 'yazilar' || process.argv.includes('--yazilar')) {
  const yazilar = await seedYazilar(payload)
  console.log(`yazilar: ${yazilar}`)
} else if (process.env.SEED_ONLY === 'eserler' || process.argv.includes('--eserler')) {
  const eserler = await seedEserler(payload, { sadeceYeni: process.env.SEED_SADECE_YENI === 'evet' })
  console.log(`eserler: ${eserler}`)
} else {
  const result = await seed(payload)
  console.log(`eserler: ${result.eserler}, kitaplar: ${result.kitaplar}`)
}
await payload.destroy?.()
process.exit(0)
