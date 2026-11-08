/** Gerçek YouTube videoları (panelde girilenlerle birebir); tasarımdaki diğer örnekler eklenmez. */

export const SEED_VIDEO_KATEGORILERI = ['Meşk', 'Söyleşi', 'Program'] as const

export type SeedVideo = {
  baslik: string
  altBaslik: string
  youtube: string
  kategori: (typeof SEED_VIDEO_KATEGORILERI)[number]
  kanal: string
  sure: string
  aciklama: string
  anasayfada: boolean
  /** tasarim/img altındaki dosya; adı Blob'daki ve veritabanındaki adla aynı olmalı. */
  kapak?: string
}

export const SEED_VIDEOLAR: SeedVideo[] = [
  {
    baslik: 'Affetmenin Hafifliği',
    altBaslik: 'Ramazan Sosyolojisi · 2. Bölüm',
    youtube: 'aLry4uypqxs',
    kategori: 'Program',
    kanal: 'TRT 2',
    sure: '25:29',
    aciklama:
      "TRT 2'de yayınlanan Ramazan Sosyolojisi programının ikinci bölümü: affetmek ve affetmenin insana kazandırdığı hafiflik üzerine.",
    anasayfada: true,
    // Panelden macOS ile yüklendi: ad ayrışık (NFD) Unicode biçiminde saklanıyor.
    kapak: 'Affetmenin Hafifliği.png'.normalize('NFD'),
  },
  {
    baslik: 'İhsan Fazlıoğlu',
    altBaslik: 'Kitapsever',
    youtube: 'LzfHw8Da_D8',
    kategori: 'Söyleşi',
    kanal: 'Semerkand TV',
    sure: '49:38',
    aciklama:
      'Prof. Dr. İhsan Fazlıoğlu’nun konuk olduğu bu söyleşide; İslam ve Osmanlı bilim tarihi, yazma eserlerin düşünce dünyamızdaki yeri, klasik ile modern bilim anlayışı arasındaki farklar ve medeniyetimizde matematik, akıl ve estetiğin nasıl bütünleştiği ele alınıyor.',
    anasayfada: false,
  },
  {
    baslik: 'Sabır',
    altBaslik: 'Ramazan Sosyolojisi · 16. Bölüm',
    youtube: 'lStQ35N8k98',
    kategori: 'Program',
    kanal: 'TRT 2',
    sure: '25:12',
    aciklama:
      'Ramazan Sosyolojisi\'nin 16. bölümünde, "Sabır, ilk sarsıntı anında gösterilendir" hadis-i şerifi ışığında modern çağın sabırsızlığı ele alınıyor; dijital dünyanın aceleciliğine karşı sabrın manevi zaferi, tezhip sanatının zarafeti ve tefekkürle anlatılıyor.',
    anasayfada: false,
    kapak: 'Sabır.png',
  },
]
