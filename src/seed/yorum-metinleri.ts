import { YORUM_METIN_KEYS, type YorumMetinKey } from '@/globals/YorumMetinleri'

type S = { tr: string; en: string; ar: string }

/** Yorum metinleri global'inin metinleri (yorum-metinleri.metinler): üç dilde. */
export const YORUM_METINLERI: Record<YorumMetinKey, S> = {
  baslik: { tr: 'Yorumlar', en: 'Comments', ar: 'التعليقات' },
  bos: {
    tr: 'Henüz yorum yok. İlk yorumu siz yazın.',
    en: 'No comments yet. Be the first to write one.',
    ar: 'لا توجد تعليقات بعد. كونوا أول من يكتب تعليقًا.',
  },
  cevapEtiket: { tr: "Sıtkı Çoban'ın cevabı", en: "Sıtkı Çoban's reply", ar: 'ردّ سيتكي تشوبان' },
  formBaslik: { tr: 'Yorum yazın', en: 'Leave a comment', ar: 'اكتبوا تعليقًا' },
  formAciklama: {
    tr: 'Yorumlar onaylandıktan sonra yayınlanır. E-posta adresiniz yayınlanmaz.',
    en: 'Comments are published after approval. Your e-mail address will not be published.',
    ar: 'تُنشر التعليقات بعد الموافقة عليها. لن يُنشر بريدكم الإلكتروني.',
  },
  formAd: { tr: 'Adınız', en: 'Your name', ar: 'الاسم' },
  formAdHata: { tr: 'Adınızı yazın.', en: 'Please enter your name.', ar: 'يرجى كتابة الاسم.' },
  formEposta: { tr: 'E-posta', en: 'E-mail', ar: 'البريد الإلكتروني' },
  formEpostaNot: { tr: 'yayınlanmaz', en: 'not published', ar: 'لا يُنشر' },
  formEpostaHata: {
    tr: 'Geçerli bir e-posta adresi yazın.',
    en: 'Please enter a valid e-mail address.',
    ar: 'يرجى كتابة بريد إلكتروني صحيح.',
  },
  formMetin: { tr: 'Yorumunuz', en: 'Your comment', ar: 'تعليقكم' },
  formMetinHata: { tr: 'Yorumunuzu yazın.', en: 'Please write your comment.', ar: 'يرجى كتابة التعليق.' },
  formSayac: { tr: '{n} / {max}', en: '{n} / {max}', ar: '{n} / {max}' },
  formOnay: {
    tr: 'Adımın ve yorumumun onaylanırsa bu sayfada yayınlanacağını, e-posta adresimin yayınlanmayacağını okudum, kabul ediyorum.',
    en: 'I have read and accept that my name and comment will be published on this page if approved, and that my e-mail address will not be published.',
    ar: 'قرأتُ وأوافق على أن يُنشر اسمي وتعليقي في هذه الصفحة إذا تمّت الموافقة عليه، وألّا يُنشر بريدي الإلكتروني.',
  },
  formAydinlatma: { tr: 'Aydınlatma metni', en: 'Privacy notice', ar: 'إشعار الخصوصية' },
  formOnayHata: {
    tr: 'Göndermek için metni okuyup onaylayın.',
    en: 'Please read and accept the notice to send.',
    ar: 'يرجى قراءة النص والموافقة عليه للإرسال.',
  },
  formGonder: { tr: 'Yorumu gönder', en: 'Send comment', ar: 'إرسال التعليق' },
  formGonderiliyor: { tr: 'Gönderiliyor…', en: 'Sending…', ar: 'جارٍ الإرسال…' },
  formBasariBaslik: { tr: 'Teşekkür ederiz', en: 'Thank you', ar: 'شكرًا لكم' },
  formBasariMetin: {
    tr: 'Yorumunuz onaylandıktan sonra yayınlanacak.',
    en: 'Your comment will be published once it has been approved.',
    ar: 'سيُنشر تعليقكم بعد الموافقة عليه.',
  },
  formYeniYorum: { tr: 'Yeni bir yorum yaz', en: 'Write another comment', ar: 'اكتبوا تعليقًا آخر' },
  formHata: {
    tr: 'Yorumunuz gönderilemedi. Bilgileri kontrol edip tekrar deneyin.',
    en: 'Your comment could not be sent. Please check the details and try again.',
    ar: 'تعذّر إرسال تعليقكم. يرجى التحقق من البيانات والمحاولة مرة أخرى.',
  },
  formSinir: {
    tr: 'Kısa sürede çok sayıda yorum gönderdiniz. Lütfen biraz sonra tekrar deneyin.',
    en: 'You have sent several comments in a short time. Please try again a little later.',
    ar: 'أرسلتم عدة تعليقات في وقت قصير. يرجى المحاولة بعد قليل.',
  },
  formKullanilamaz: {
    tr: 'Yorumlar şu an alınamıyor. Lütfen daha sonra tekrar deneyin.',
    en: 'Comments cannot be received at the moment. Please try again later.',
    ar: 'لا يمكن استقبال التعليقات حاليًا. يرجى المحاولة لاحقًا.',
  },
}

const metinler = (l: keyof S) => Object.fromEntries(YORUM_METIN_KEYS.map((k) => [k, YORUM_METINLERI[k][l]]))

export const SEED_YORUM_METINLERI = {
  tr: { metinler: metinler('tr') },
  en: { metinler: metinler('en') },
  ar: { metinler: metinler('ar') },
}
