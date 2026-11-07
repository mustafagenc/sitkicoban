import { block, p, root, text, ul } from './lexical'

/** tasarim/hayati.html ve tasarim/index.html'deki İcazet ve Hayatı metinleri (Türkçe, tasarımla birebir). */

export type SeedHoca = {
  ad: string
  kalemler: string
  aciklama: string
  sayfaAciklama: string
  imza: { file: string; alt: string }
}

export const SEED_HOCALAR: SeedHoca[] = [
  {
    ad: 'Hasan Çelebi',
    kalemler: "Rik'a · Ta'lik",
    aciklama: "Hat sanatının yaşayan efsanesinden rik'a ve ta'lik icazeti.",
    sayfaAciklama: 'Hat sanatının yaşayan efsanesinden icazet',
    imza: { file: 'imza-hasan-celebi.png', alt: "Hasan Çelebi'nin imzası" },
  },
  {
    ad: 'Abdulhadi Erol Dönmez',
    kalemler: 'Sülüs · Nesih',
    aciklama: 'Sülüs ve nesih kalemlerinde rehberliğinde olgunlaştı.',
    sayfaAciklama: 'Rehberliğinde olgunlaşarak icazet',
    imza: { file: 'imza-erol-donmez.png', alt: "Abdulhadi Erol Dönmez'in imzası" },
  },
]

export const SEED_PORTRE = { file: 'sitki-coban.jpg', alt: 'Sıtkı Çoban, çalışma masasında' }

export const SEED_HAYATI = {
  girisCumlesi: 'Klasik meşk geleneğinin günümüzdeki temsilcilerinden; hat sanatının dört ana kaleminde icazetli.',
  kunye: [
    { etiket: 'Doğum', deger: 'Köyceğiz, Muğla' },
    {
      etiket: 'Eğitim',
      deger: 'Trakya Üniversitesi (lisans)\nSakarya Üniversitesi, Türk Dili ve Edebiyatı (yüksek lisans)',
    },
    { etiket: 'İcazet', deger: "Rik'a ve ta'lik: Hasan Çelebi\nSülüs ve nesih: Abdulhadi Erol Dönmez" },
    { etiket: 'Görev', deger: 'İstanbul Çamlıca Kız İmam Hatip Lisesi' },
  ],
  kapanis:
    'Öğretmenliğiyle ilim yolunda ışık saçan, hattatlığıyla ruhlara zarafet bahşeden, yazarlığıyla gönüllere seslenen bir irfan ve sanat ehli.',
  anasayfaSoz: 'Gelenekle çağdaş estetiğin zarif bir sentezi.',
  anasayfaOzet: root(
    p(
      text(
        "Muğla'nın Köyceğiz ilçesinde doğdu. Trakya Üniversitesi'nde lisans, Sakarya Üniversitesi'nde Türk Dili ve Edebiyatı alanında yüksek lisans yaptı.",
      ),
    ),
    p(
      text(
        "Halen İstanbul Çamlıca Kız İmam Hatip Lisesi'nde edebiyat öğretmenliği yapıyor; okul dışında hat sanatına gönül veren öğrencilere klasik usulle meşk ettiriyor.",
      ),
    ),
  ),
  bolumler: [
    {
      baslik: 'İlim yolculuğu',
      govde: root(
        p(
          text(
            "Hattat, münevver ve muallim Sıtkı Çoban, Ege'nin incisi Muğla'nın şirin ilçesi Köyceğiz'de dünyaya merhaba dedi. İlme olan susuzluğu onu Trakya Üniversitesi'nin yollarına düşürdü ve burada lisans eğitimini başarıyla tamamladı.",
          ),
        ),
        p(
          text(
            "Ardından akademik derinliğini artırmak gayesiyle Sakarya Üniversitesi'nde Türk Dili ve Edebiyatı alanında yüksek lisans yaparak edebiyat dünyasına olan vukufiyetini perçinledi.",
          ),
        ),
      ),
    },
    {
      baslik: 'Hat yolculuğu',
      govde: root(
        p(
          text(
            "Sanat ve kültürle yoğrulan hayatına edebiyat öğretmenliği gibi kıymetli bir vazifeyle devam eden Çoban'ı, ruhunun derinliklerindeki estetik arayışı klasik hat sanatının engin deryasına sürükledi. Bu kadim sanatta zirveye ulaşmak için dönemin üstatlarının rahle-i tedrisinden geçti.",
          ),
        ),
        block('6730b2000000000000000001', { blockType: 'hocaKartlari' }),
        p(
          text(
            'Böylece hat sanatının dört ana meşkinde de icazet sahibi nadir sanatkârlardan biri olarak, klasik meşk sisteminin günümüzdeki seçkin temsilcileri arasındaki yerini aldı.',
          ),
        ),
      ),
    },
    {
      baslik: 'Sanat anlayışı',
      govde: root(
        p(
          text(
            "Sıtkı Çoban'ın sanat anlayışı, köklerinden beslenen özgün bir estetik üzerine kuruludur. Eserlerinde, ilahi kelamın nuraniyetini yansıtan Kur'ân-ı Kerîm âyetlerine, hikmet pınarlarından süzülen anlamlı sözlere ve klasik edebiyatımızın incelikli beyitlerine yer vererek, görsel bir şölenle mana derinliğini ustaca harmanlar.",
          ),
        ),
        block('6730b2000000000000000002', {
          blockType: 'oneCikanSoz',
          metin: 'Gelenekle çağdaş estetiğin zarif bir sentezi.',
        }),
        p(text('İzleyicinin ruhuna dokunan bu eserler, geleneğe sadık kalırken bugünün gözüne de seslenir.')),
      ),
      baglantilar: [{ etiket: 'Eserlerini görün →', sayfa: 'eserler' }],
    },
    {
      baslik: 'Kalemden dökülenler',
      govde: root(
        p(
          text(
            'Çoban\'ın kaleminden dökülenler sadece levhalarla sınırlı kalmaz. Edebî kimliğiyle de öne çıkan sanatçı, "Adı Güzel Kendi Güzel" ve "Eskimeyen Şiirimizden Hoş Bir Sada" gibi eserleriyle klasik Türk şiirine olan derin muhabbetini ve bu alandaki birikimini gözler önüne serer.',
          ),
        ),
        p(
          text(
            'Kaleme aldığı tefsir yazılarıyla Kur\'ânî hakikatlere tasavvufî bir pencereden yaklaşarak geniş bir okuyucu kitlesine ulaşmıştır. Geçmişte radyoda hazırlayıp sunduğu "Muhabbet Bağı" programıyla da dinleyicilerini edebiyatın, sanatın ve sanatçıların dünyasında keyifli bir yolculuğa çıkarmıştır.',
          ),
        ),
        ul(
          'Eskimeyen Şiirimizden Hoş Bir Sada',
          'Lemezât-ı Hulviyye',
          'En Sevilen İlahiler',
          'Adı Güzel Kendi Güzel',
          'Hikmetleriyle Nasreddin Hoca Latifeleri',
          "Mahmûdü's-Siyer",
          'Safahat',
          "Güzel'i Bulmak · Hattatların Hâli",
          "Mesnevî'de Geçen Hikâyeler",
          'Yolumuzu Aydınlatan Kandil',
        ),
      ),
      baglantilar: [
        { etiket: 'Kitaplarını görün →', sayfa: 'kitaplar' },
        { etiket: 'Yazılarını okuyun →', sayfa: 'yazilar' },
      ],
    },
    {
      baslik: 'Muallimlik',
      govde: root(
        p(
          text(
            "Halen İstanbul Çamlıca Kız İmam Hatip Lisesi'nde eğitimci kimliğiyle genç nesillere yol göstermeye devam eden Sıtkı Çoban, burada Türk edebiyatının zenginliğini ve hat sanatının inceliklerini öğrencileriyle paylaşmaktadır.",
          ),
        ),
        p(
          text(
            'Okul dışında da hat sanatına gönül veren öğrencilere klasik usulle meşkler yaptırarak, usta-çırak ilişkisinin asırlardır süregelen ruhunu canlı tutmaktadır. Yetiştirdiği kıymetli talebelerle birlikte bu kadim sanatı geleceğe taşıma gayretini büyük bir aşkla sürdürmektedir.',
          ),
        ),
      ),
      baglantilar: [{ etiket: 'Meşk videolarını izleyin →', sayfa: 'videolar' }],
    },
  ],
}
