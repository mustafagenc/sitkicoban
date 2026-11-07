/** tasarim/videolar.html: yalnızca gerçek YouTube videosu eklenir; diğerleri taslak örnekti. */

export const SEED_VIDEO_KATEGORILERI = ['Meşk', 'Söyleşi', 'Program'] as const

export type SeedVideo = {
  baslik: string
  altBaslik: string
  youtube: string
  kategori: (typeof SEED_VIDEO_KATEGORILERI)[number]
  kanal: string
  aciklama: string
  anasayfada: boolean
}

export const SEED_VIDEOLAR: SeedVideo[] = [
  {
    baslik: 'Affetmenin Hafifliği',
    altBaslik: 'Ramazan Sosyolojisi · 2. Bölüm',
    youtube: 'aLry4uypqxs',
    kategori: 'Program',
    kanal: 'TRT 2',
    aciklama:
      "TRT 2'de yayınlanan Ramazan Sosyolojisi programının ikinci bölümü: affetmek ve affetmenin insana kazandırdığı hafiflik üzerine.",
    anasayfada: true,
  },
]
