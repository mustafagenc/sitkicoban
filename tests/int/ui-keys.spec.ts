import { describe, expect, it } from 'vitest'

import { UI_KEYS } from '@/globals/UiMetinleri'

describe('UI_KEYS', () => {
  it('stays under the Postgres json_build_array argument limit', () => {
    // Her yerelleştirilmiş alan ui_metinleri_locales'te bir sütun; Postgres json_build_array'e
    // 100'den fazla argüman vermez. Sınıra yaklaşınca anahtarları sayfa grubu başına ayrı
    // bir gruba/globale bölün (sayfa grubu kuralı) ve bu sınırı öyle yükseltin.
    expect(UI_KEYS.length, 'UI_KEYS 96 sınırını aştı: ui_metinleri_locales sayfa grubuna göre bölünmeli').toBeLessThanOrEqual(96)
  })
})
