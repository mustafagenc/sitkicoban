import { describe, expect, it } from 'vitest'

import { BULTEN_METIN_KEYS } from '@/globals/Bulten'
import { UI_KEYS } from '@/globals/UiMetinleri'
import { BULTEN_METINLER } from '@/seed/bulten'

describe('UI_KEYS', () => {
  it('stays under the Postgres json_build_array argument limit', () => {
    // Her yerelleştirilmiş alan ui_metinleri_locales'te bir sütun; Postgres json_build_array'e
    // 100'den fazla argüman vermez. Sınıra yaklaşınca anahtarları sayfa grubu başına ayrı
    // bir gruba/globale bölün (sayfa grubu kuralı) ve bu sınırı öyle yükseltin.
    expect(UI_KEYS.length, 'UI_KEYS 96 sınırını aştı: ui_metinleri_locales sayfa grubuna göre bölünmeli').toBeLessThanOrEqual(96)
  })

  it('keeps the bulten global under the same limit and seeds every key in three languages', () => {
    expect(BULTEN_METIN_KEYS.length + 1).toBeLessThanOrEqual(96) // + aciklama
    for (const k of BULTEN_METIN_KEYS) {
      for (const l of ['tr', 'en', 'ar'] as const) expect(BULTEN_METINLER[k][l], `${k}.${l}`).toBeTruthy()
    }
  })
})
