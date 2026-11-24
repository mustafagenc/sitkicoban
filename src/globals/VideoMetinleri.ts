import type { GlobalConfig } from 'payload'

import { adminRead, adminWrite } from '@/lib/access'
import { revalidateHooks } from '@/lib/cache/revalidate'

/**
 * Videolar sayfası, oynatıcı penceresi ve ana sayfadaki video bölümünün arayüz metinleri.
 * `ui-metinleri` Postgres'in 100 argümanlı `json_build_array` sınırına dayandığı için sayfa grubu
 * kuralıyla ayrı bir globalde tutulur. Anahtar eklemek için buraya satır ekleyin ve
 * `seed/video-metinleri.ts`'ye üç dilde metnini yazın.
 */
const LABELS = {
  videolarBaslik: 'Videolar sayfası başlığı',
  videolarAciklama: 'Videolar sayfası açıklaması',
  videolarListeBaslik: 'Videolar: liste başlığı',
  videoKategoriGrubu: 'Videolar: kategori grubu (erişilebilirlik)',
  videoSayisi: 'Videolar: video sayısı ({n} sayı yerine geçer)',
  videolarBos: 'Videolar: kategoride video yok',
  videoOynat: 'Videolar: Videoyu oynat (erişilebilirlik)',
  dersNo: 'Videolar: ders numarası ({n} sayı yerine geçer)',
  videoSeriBaslik: 'Videolar: seri başlığı ({seri} seri adı, {n} ders sayısı yerine geçer)',
  youtubedaAc: 'Videolar: YouTube’da aç',
  tumVideolarOk: 'Ana sayfa: Tüm videolar (ok ile)',
} as const

export type VideoMetinKey = keyof typeof LABELS
export const VIDEO_METIN_KEYS = Object.keys(LABELS) as readonly VideoMetinKey[]

export const VideoMetinleri: GlobalConfig = {
  slug: 'video-metinleri',
  label: 'Video metinleri',
  access: { read: adminRead.read, update: adminWrite.update },
  hooks: { afterChange: [revalidateHooks('video-metinleri').afterChange] },
  fields: VIDEO_METIN_KEYS.map((k) => ({ name: k, label: LABELS[k], type: 'text' as const, localized: true })),
}
