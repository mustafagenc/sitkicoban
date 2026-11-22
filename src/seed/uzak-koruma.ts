/**
 * Seed boş bir veritabanını kurmak içindir; panelde düzenlenmiş alanların üzerine yazar.
 * Bu yüzden veritabanı yerel değilse (localhost / 127.0.0.1 / ::1) açık onay olmadan çalışmaz.
 * Bilerek uzak bir veritabanına (ör. yeni ve boş bir Neon dalı) seed atmak için: SEED_UZAK_ONAY=evet
 */
export function uzakVeritabaniniReddet(env: NodeJS.ProcessEnv = process.env): string | null {
  let host = ''
  try {
    host = new URL(env.DATABASE_URL || '').hostname.replace(/^\[|\]$/g, '')
  } catch {
    // Adres okunamıyorsa güvenli tarafta kal.
  }
  if (['localhost', '127.0.0.1', '::1'].includes(host)) return null
  if (env.SEED_UZAK_ONAY === 'evet') return null
  return [
    `Seed durduruldu: DATABASE_URL yerel değil (${host || 'okunamadı'}).`,
    'Seed, paneldeki düzenlemelerin (ana sayfa kitapları, yazılar, eser bilgileri…) üzerine yazar; canlıda çalıştırılmamalı.',
    'Bilerek uzak ve boş bir veritabanını kuruyorsanız SEED_UZAK_ONAY=evet ile yeniden çalıştırın.',
  ].join('\n')
}
