export type SeedDers = {
  kurum: string
  baslik: string
  altBaslik?: string
  aciklama?: string
  gun: string
  saat: string
  yer: string
  kontenjan?: string
  afis?: { file: string; alt: string }
  bitis: string
}

/** tasarim/index.html'deki .ders kartları (tasarımda açıklama metni yok). */
export const SEED_DERSLER: SeedDers[] = [
  {
    kurum: 'İstanbul Medeniyet Üniversitesi',
    baslik: 'Hüsn-i Hat Meşkleri',
    altBaslik: "Nokta'nın Seyri",
    gun: 'Her Perşembe',
    saat: '16.30–18.00',
    yer: 'Kuzey Yerleşke, B Blok Derslik 106',
    kontenjan: '25 kişi',
    afis: { file: 'duyuru-imu-mesk.jpg', alt: "Bir Medeniyet Çizgisi: Hüsn-i Hat, Nokta'nın Seyri afişi" },
    bitis: '2027-01-31',
  },
  {
    kurum: 'Çamlıca Kız Anadolu İmam Hatip Lisesi',
    baslik: 'Hat Dersi',
    gun: 'Her Cumartesi',
    saat: '09.00–11.00',
    yer: 'Çamlıca Kız Anadolu İmam Hatip Lisesi, Üsküdar',
    bitis: '2027-06-30',
  },
]
