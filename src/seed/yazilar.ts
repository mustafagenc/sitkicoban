/** tasarim/yazilar.html (öne çıkan yazı + `posts` dizisi) ve tasarim/yazi.html (örnek gövde). */

export const SEED_YAZI_KATEGORILERI = ['Tefsir', 'Sanat', 'Edebiyat'] as const

export type SeedYazi = {
  baslik: string
  kategori: (typeof SEED_YAZI_KATEGORILERI)[number]
  ozet: string
  /** "Mart 2025" → 2025-03-01 */
  tarih: string
  /** Tasarımdaki dakika; gövdesi olmayan taslaklarda listede görünmesi için elle tutulur. */
  dakika: number
  kapak?: { file: string; alt: string }
  govde?: unknown
  kaynaklar?: string[]
  yayinda: boolean
}

// --- Lexical JSON helpers -------------------------------------------------------------------

const BOLD = 1
const text = (t: string, format = 0) => ({ type: 'text', version: 1, text: t, format, detail: 0, mode: 'normal', style: '' })
const p = (...children: ReturnType<typeof text>[]) => ({
  type: 'paragraph',
  version: 1,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
})
const h2 = (t: string) => ({ type: 'heading', tag: 'h2', version: 1, children: [text(t)], direction: 'ltr', format: '', indent: 0 })
// Sabit blok id'leri: seed tekrar çalıştığında gövde aynı kalır.
const block = (id: string, fields: Record<string, unknown>) => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { id, blockName: '', ...fields },
})
const root = (...children: unknown[]) => ({
  root: { type: 'root', version: 1, children, direction: 'ltr', format: '', indent: 0 },
})

/** tasarim/yazi.html `.prose` içeriği. */
const IHLAS_GOVDE = root(
  p(
    text(
      "Kur'ân-ı Kerîm'in en kısa sûrelerinden biri olan İhlâs, dört âyetlik bir hacmin içine bütün bir inanç dünyasını sığdırır. Âlimlerimiz bu sûreyi Kur'ân'ın üçte birine denk tutmuş, onu okuyanın tevhidin özünü dile getirmiş olacağını söylemişlerdir.",
    ),
  ),
  p(
    text('Sûrenin ilk âyeti bir emirle başlar: '),
    text('"De ki."', BOLD),
    text(
      ' Bu hitap, söylenecek sözün insanın kendi icadı olmadığını, ona bildirilen bir hakikati dile getirdiğini hatırlatır. Ardından gelen kelimeler ise bu hakikatin ta kendisidir.',
    ),
  ),
  block('6730a1000000000000000001', {
    blockType: 'ayet',
    arapca: 'قُلْ هُوَ اللّٰهُ أَحَدٌ',
    meal: 'De ki: O Allah birdir.',
    kaynak: 'İhlâs Sûresi · 1',
  }),
  p(
    text(
      "Ehl-i tasavvuf bu birliği anlatırken üç mertebeden söz eder. Birincisi bilgi mertebesidir: insan, aklı ve nakille Allah'ın bir olduğunu öğrenir ve kabul eder. Bu, yolun başıdır ve kıymetlidir; fakat yolun sonu değildir.",
    ),
  ),
  h2('Bilmekten görmeye'),
  p(
    text(
      "İkinci mertebe görme mertebesidir. Burada bilgi, kalpte bir şahitliğe dönüşür. İnsan, kâinattaki her şeyin bir isme ayna olduğunu, her güzelliğin bir Güzel'den haber verdiğini sezmeye başlar.",
    ),
  ),
  block('6730a1000000000000000002', {
    blockType: 'oneCikanSoz',
    metin: 'Bilgi kapıyı gösterir; görmek kapıdan içeri girmektir.',
  }),
  p(
    text(
      'Üçüncü mertebe ise oluş mertebesidir. Bu mertebede kul, bildiği ve gördüğü hakikate göre yaşar; ahlâkı, sözü ve ameli tevhidin bir tercümesi hâline gelir. Hat sanatında da böyledir: harfin ölçüsünü bilmek bir şeydir, onu görmek başka, kalemin ucunda yaşatmak bambaşka.',
    ),
  ),
  p(
    text(
      "İhlâs'ın ilk âyeti, işte bu üç mertebeyi bir arada taşır. Onu her okuyuşumuzda, hangi mertebede durduğumuzu kendimize sormak belki de en güzel tefsirdir.",
    ),
  ),
)

export const SEED_YAZILAR: SeedYazi[] = [
  {
    baslik: "İhlâs'ın İlk Âyeti ve Üç Mertebe",
    kategori: 'Tefsir',
    ozet: '"De ki: O Allah birdir." Kısa bir âyetin içinde tevhidin bütün derinliği gizlidir. Bu yazıda âyeti, ehl-i tasavvufun üç mertebe hâlinde anlattığı bilgi, görme ve oluş üzerinden okuyoruz.',
    tarih: '2025-03-01',
    dakika: 9,
    kapak: { file: 'e-emrolundugun.jpg', alt: "İhlâs'ın İlk Âyeti ve Üç Mertebe" },
    govde: IHLAS_GOVDE,
    kaynaklar: ['Kaynak 1 (örnek)', 'Kaynak 2 (örnek)', 'Kaynak 3 (örnek)'],
    yayinda: true,
  },
  {
    baslik: "Herkes O'na Muhtaç",
    kategori: 'Tefsir',
    ozet: '"Allahu\'s-Samed" âyetinde her şeyin O\'na yöneldiği, O\'nun ise hiçbir şeye ihtiyaç duymadığı hakikati.',
    tarih: '2025-02-01',
    dakika: 7,
    yayinda: false,
  },
  {
    baslik: 'Zikir, Fikir, Dua',
    kategori: 'Tefsir',
    ozet: 'Kulun Rabbine yönelişinin üç hâli: dilin anması, aklın tefekkürü, kalbin yakarışı.',
    tarih: '2025-01-01',
    dakika: 8,
    yayinda: false,
  },
  {
    baslik: 'Söyleyip de Yapmayanlar',
    kategori: 'Tefsir',
    ozet: "Sözle amel arasındaki mesafe üzerine Saf Sûresi'nden bir uyarı ve bir davet.",
    tarih: '2024-12-01',
    dakika: 6,
    yayinda: false,
  },
  {
    baslik: 'İnciten Kırıp Döken Var ya!',
    kategori: 'Tefsir',
    ozet: 'Dil ve gönül üzerine: incitmeden konuşmanın edebi.',
    tarih: '2024-11-01',
    dakika: 9,
    yayinda: false,
  },
  {
    baslik: 'Hattın Sessiz Dili',
    kategori: 'Sanat',
    ozet: 'Bir harfin ölçüsünde saklı terbiye: meşk, sabır ve usta-çırak ilişkisi üzerine.',
    tarih: '2024-10-01',
    dakika: 5,
    yayinda: false,
  },
  {
    baslik: 'Divan Şiirinde Bir Beyit, Bir Ömür',
    kategori: 'Edebiyat',
    ozet: 'Klasik şiirimizden bir beytin peşinde, kelimelerin ve hayatın izinde.',
    tarih: '2024-09-01',
    dakika: 6,
    yayinda: false,
  },
]
