import { METIN_KEYS, type MetinKey } from '@/globals/Iletisim'

import { p, root, text } from './lexical'

/** tasarim/iletisim.html metinleri (Türkçe, tasarımla birebir); İngilizce ve Arapça yeni yazıldı. */

type S = { tr: string; en: string; ar: string }

/** Sayfanın arayüz metinleri (iletisim.metinler): Türkçe tasarımla birebir, İngilizce ve Arapça yeni yazıldı. */
export const METINLER: Record<MetinKey, S> = {
  iletisimNeIcin: {
    tr: 'Ne için yazabilirsiniz?',
    en: 'What can you write about?',
    ar: 'فيمَ يمكنكم الكتابة؟',
  },
  iletisimNot: {
    tr: 'Mesajlarınız okunur ve en kısa zamanda cevaplanır.',
    en: 'Your messages are read and answered as soon as possible.',
    ar: 'تُقرأ رسائلكم ويُردّ عليها في أقرب وقت.',
  },
  iletisimEposta: {
    tr: 'E-posta',
    en: 'E-mail',
    ar: 'البريد الإلكتروني',
  },
  formBaslik: {
    tr: 'Mesaj gönderin',
    en: 'Send a message',
    ar: 'أرسلوا رسالة',
  },
  formAciklama: {
    tr: 'Alanların hepsi zorunludur, telefon hariç.',
    en: 'All fields are required, except the phone number.',
    ar: 'جميع الحقول مطلوبة، عدا الهاتف.',
  },
  formAd: {
    tr: 'Adınız',
    en: 'Your name',
    ar: 'الاسم',
  },
  formEposta: {
    tr: 'E-posta',
    en: 'E-mail',
    ar: 'البريد الإلكتروني',
  },
  formKonu: {
    tr: 'Konu',
    en: 'Subject',
    ar: 'الموضوع',
  },
  formKonuSec: {
    tr: 'Seçin…',
    en: 'Choose…',
    ar: 'اختاروا…',
  },
  formTelefon: {
    tr: 'Telefon',
    en: 'Phone',
    ar: 'الهاتف',
  },
  formIstegeBagli: {
    tr: '(isteğe bağlı)',
    en: '(optional)',
    ar: '(اختياري)',
  },
  formMesaj: {
    tr: 'Mesajınız',
    en: 'Your message',
    ar: 'رسالتكم',
  },
  formAdHata: {
    tr: 'Adınızı yazın.',
    en: 'Please enter your name.',
    ar: 'يرجى كتابة الاسم.',
  },
  formEpostaHata: {
    tr: 'Geçerli bir e-posta adresi yazın.',
    en: 'Please enter a valid e-mail address.',
    ar: 'يرجى كتابة بريد إلكتروني صحيح.',
  },
  formKonuHata: {
    tr: 'Bir konu seçin.',
    en: 'Please choose a subject.',
    ar: 'يرجى اختيار موضوع.',
  },
  formMesajHata: {
    tr: 'Mesajınızı yazın.',
    en: 'Please write your message.',
    ar: 'يرجى كتابة الرسالة.',
  },
  formOnayHata: {
    tr: 'Göndermek için metni okuyup onaylayın.',
    en: 'Please read and accept the notice to send.',
    ar: 'يرجى قراءة النص والموافقة عليه للإرسال.',
  },
  formSayac: {
    tr: '{n} / {max}',
    en: '{n} / {max}',
    ar: '{n} / {max}',
  },
  formOnay: {
    tr: 'Bilgilerimin yalnızca bu mesaja cevap vermek için kullanılacağını okudum, kabul ediyorum.',
    en: 'I have read and accept that my details will be used only to answer this message.',
    ar: 'قرأتُ وأوافق على أن تُستخدم بياناتي للردّ على هذه الرسالة فقط.',
  },
  formAydinlatma: {
    tr: 'Aydınlatma metni',
    en: 'Privacy notice',
    ar: 'إشعار الخصوصية',
  },
  formGonder: {
    tr: 'Gönder',
    en: 'Send',
    ar: 'إرسال',
  },
  formGonderiliyor: {
    tr: 'Gönderiliyor…',
    en: 'Sending…',
    ar: 'جارٍ الإرسال…',
  },
  formBasariBaslik: {
    tr: 'Mesajınız ulaştı',
    en: 'Your message has arrived',
    ar: 'وصلت رسالتكم',
  },
  formBasariMetin: {
    tr: 'Teşekkür ederiz, {ad}. En kısa zamanda {eposta} adresine cevap verilecek.',
    en: 'Thank you, {ad}. A reply will be sent to {eposta} as soon as possible.',
    ar: 'شكرًا لكم يا {ad}. سيُرسَل الردّ إلى {eposta} في أقرب وقت.',
  },
  formYeniMesaj: {
    tr: 'Yeni mesaj yaz',
    en: 'Write a new message',
    ar: 'اكتبوا رسالة جديدة',
  },
  formHata: {
    tr: 'Mesajınız gönderilemedi. Bilgileri kontrol edip tekrar deneyin.',
    en: 'Your message could not be sent. Please check the details and try again.',
    ar: 'تعذّر إرسال الرسالة. يرجى التحقق من البيانات والمحاولة مرة أخرى.',
  },
  formKullanilamaz: {
    tr: 'Mesaj şu an gönderilemiyor. Lütfen daha sonra tekrar deneyin.',
    en: 'Messages cannot be sent at the moment. Please try again later.',
    ar: 'لا يمكن إرسال الرسائل حاليًا. يرجى المحاولة لاحقًا.',
  },
  eserHakkinda: {
    tr: '"{eser}" adlı eser hakkında bilgi almak istiyorum.',
    en: 'I would like to ask about the work "{eser}".',
    ar: 'أودّ الاستفسار عن العمل «{eser}».',
  },
  aydinlatmaBaslik: {
    tr: 'Aydınlatma metni',
    en: 'Privacy notice',
    ar: 'إشعار الخصوصية',
  },
  iletisimeDon: {
    tr: 'İletişim sayfasına dön',
    en: 'Back to the contact page',
    ar: 'العودة إلى صفحة الاتصال',
  },
}

const aydinlatma = (tr: string, en: string, ar: string) => ({
  tr: root(p(text(tr))),
  en: root(p(text(en))),
  ar: root(p(text(ar))),
})

const AYDINLATMA = aydinlatma(
  'Hukuki metin girilecek. Bu sayfa, aydınlatma metni yönetim panelinden girilene kadar yer tutucudur; bir hukuki metin değildir.',
  'Legal text to be added. This page is a placeholder until the privacy notice is entered in the admin panel; it is not a legal text.',
  'سيُضاف النص القانوني. هذه الصفحة نصّ مؤقّت إلى أن يُدخَل إشعار الخصوصية من لوحة الإدارة، وليست نصًّا قانونيًّا.',
)

const metinler = (l: keyof S) => Object.fromEntries(METIN_KEYS.map((k) => [k, METINLER[k][l]]))

export const SEED_ILETISIM = {
  tr: {
    aciklama: "Bir eser, meşk ya da söyleşi için yazabilirsiniz; mesajınız doğrudan Sıtkı Çoban'a ulaşır.",
    maddeler: [
      { baslik: 'Eser talebi', metin: 'Sergilenen bir eser ya da size özel bir levha hakkında bilgi.' },
      { baslik: 'Meşk', metin: 'Hat sanatına başlamak ve klasik usulle meşk etmek isteyenler için.' },
      { baslik: 'Söyleşi ve davet', metin: 'Konferans, sergi, okul ve program davetleri.' },
      { baslik: 'Kitaplar ve yazılar', metin: 'Kitaplar, yayınlar ve yazılar hakkında sorular.' },
    ],
    konular: [{ ad: 'Eser talebi' }, { ad: 'Meşk' }, { ad: 'Söyleşi ve davet' }, { ad: 'Kitaplar ve yazılar' }, { ad: 'Diğer' }],
    aydinlatmaMetni: AYDINLATMA.tr,
    metinler: metinler('tr'),
  },
  en: {
    aciklama: 'Write to ask about a work, meşk lessons or an interview; your message reaches Sıtkı Çoban directly.',
    maddeler: [
      { baslik: 'Request about a work', metin: 'Information about a work on show, or about a panel made especially for you.' },
      { baslik: 'Meşk', metin: 'For those who wish to begin calligraphy and practise meşk in the classical manner.' },
      { baslik: 'Talks and invitations', metin: 'Invitations to conferences, exhibitions, schools and programmes.' },
      { baslik: 'Books and articles', metin: 'Questions about books, publications and articles.' },
    ],
    konular: [
      { ad: 'Request about a work' },
      { ad: 'Meşk' },
      { ad: 'Talks and invitations' },
      { ad: 'Books and articles' },
      { ad: 'Other' },
    ],
    aydinlatmaMetni: AYDINLATMA.en,
    metinler: metinler('en'),
  },
  ar: {
    aciklama: 'يمكنكم الكتابة بشأن عمل فني أو دروس المَشْق أو حوار؛ وتصل رسالتكم مباشرةً إلى سيتكي تشوبان.',
    maddeler: [
      { baslik: 'طلب بشأن عمل', metin: 'معلومات عن عمل معروض أو عن لوحة تُنفَّذ خصيصًا لكم.' },
      { baslik: 'المَشْق', metin: 'لمن يرغب في بدء تعلّم الخط وممارسة المَشْق على الطريقة الكلاسيكية.' },
      { baslik: 'الحوارات والدعوات', metin: 'دعوات المؤتمرات والمعارض والمدارس والبرامج.' },
      { baslik: 'الكتب والمقالات', metin: 'أسئلة عن الكتب والمنشورات والمقالات.' },
    ],
    konular: [
      { ad: 'طلب بشأن عمل' },
      { ad: 'المَشْق' },
      { ad: 'الحوارات والدعوات' },
      { ad: 'الكتب والمقالات' },
      { ad: 'أخرى' },
    ],
    aydinlatmaMetni: AYDINLATMA.ar,
    metinler: metinler('ar'),
  },
}
