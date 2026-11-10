import { BULTEN_METIN_KEYS, type BultenMetinKey } from '@/globals/Bulten'

type S = { tr: string; en: string; ar: string }

/** Bülten global'inin metinleri (bulten.metinler): üç dilde yeni yazıldı. */
export const BULTEN_METINLER: Record<BultenMetinKey, S> = {
  baslik: { tr: 'Bülten', en: 'Newsletter', ar: 'النشرة البريدية' },
  altBilgiBaglanti: { tr: 'Bülten', en: 'Newsletter', ar: 'النشرة البريدية' },
  anasayfaEyebrow: { tr: 'Bülten', en: 'Newsletter', ar: 'النشرة البريدية' },
  anasayfaBaslik: {
    tr: 'Yenilikleri kaçırmayın',
    en: 'Never miss what is new',
    ar: 'لا يفوتكم جديد الموقع',
  },
  anasayfaMetin: {
    tr: 'Yeni bir yazı, kitap, eser ya da video yayınlandığında e-postayla haber verelim.',
    en: 'Get an e-mail whenever a new writing, book, work or video is published.',
    ar: 'نُعلمكم بالبريد الإلكتروني عند نشر مقالة أو كتاب أو عمل أو فيديو جديد.',
  },
  anasayfaBaglanti: { tr: 'Abone ol →', en: 'Subscribe →', ar: 'اشتركوا ←' },
  formBaslik: { tr: 'E-posta ile haberdar olun', en: 'Get updates by e-mail', ar: 'تابعوا الجديد عبر البريد الإلكتروني' },
  formAciklama: {
    tr: 'Hangi konularda haber almak istediğinizi seçin. Size yalnızca yeni içerik duyuruları gelir; istediğiniz an ayrılabilirsiniz.',
    en: 'Choose what you would like to hear about. You will only receive announcements of new content, and you can unsubscribe at any time.',
    ar: 'اختاروا ما تودّون متابعته. لن تصلكم إلا إعلانات المحتوى الجديد، ويمكنكم إلغاء الاشتراك في أي وقت.',
  },
  formEposta: { tr: 'E-posta', en: 'E-mail', ar: 'البريد الإلكتروني' },
  formEpostaHata: {
    tr: 'Geçerli bir e-posta adresi yazın.',
    en: 'Please enter a valid e-mail address.',
    ar: 'يرجى كتابة بريد إلكتروني صحيح.',
  },
  formKonular: { tr: 'Konular', en: 'Topics', ar: 'المواضيع' },
  formKonuHata: { tr: 'En az bir konu seçin.', en: 'Please choose at least one topic.', ar: 'يرجى اختيار موضوع واحد على الأقل.' },
  konuYazilar: { tr: 'Yazılar', en: 'Writings', ar: 'المقالات' },
  konuKitaplar: { tr: 'Kitaplar', en: 'Books', ar: 'الكتب' },
  konuEserler: { tr: 'Eserler', en: 'Works', ar: 'الأعمال' },
  konuVideolar: { tr: 'Videolar', en: 'Videos', ar: 'الفيديوهات' },
  formOnay: {
    tr: 'E-posta adresimin yalnızca bülten göndermek için kullanılacağını okudum, kabul ediyorum.',
    en: 'I have read and accept that my e-mail address will be used only to send the newsletter.',
    ar: 'قرأتُ وأوافق على أن يُستخدم بريدي الإلكتروني لإرسال النشرة فقط.',
  },
  formAydinlatma: { tr: 'Aydınlatma metni', en: 'Privacy notice', ar: 'إشعار الخصوصية' },
  formOnayHata: {
    tr: 'Abone olmak için metni okuyup onaylayın.',
    en: 'Please read and accept the notice to subscribe.',
    ar: 'يرجى قراءة النص والموافقة عليه للاشتراك.',
  },
  formGonder: { tr: 'Abone ol', en: 'Subscribe', ar: 'اشتراك' },
  formGonderiliyor: { tr: 'Gönderiliyor…', en: 'Sending…', ar: 'جارٍ الإرسال…' },
  formBasariBaslik: { tr: 'Son bir adım kaldı', en: 'One last step', ar: 'بقيت خطوة أخيرة' },
  formBasariMetin: {
    tr: '{eposta} adresine bir onay e-postası gönderdik. Aboneliğiniz, e-postadaki bağlantıya tıkladığınızda başlar.',
    en: 'We have sent a confirmation e-mail to {eposta}. Your subscription starts when you click the link in it.',
    ar: 'أرسلنا رسالة تأكيد إلى {eposta}. يبدأ اشتراككم عند الضغط على الرابط الوارد فيها.',
  },
  formYeniden: { tr: 'Başka bir adres yaz', en: 'Use another address', ar: 'استخدموا عنوانًا آخر' },
  formHata: {
    tr: 'Abonelik isteğiniz alınamadı. Bilgileri kontrol edip tekrar deneyin.',
    en: 'Your subscription request could not be completed. Please check the details and try again.',
    ar: 'تعذّر استلام طلب الاشتراك. يرجى التحقق من البيانات والمحاولة مرة أخرى.',
  },
  formKullanilamaz: {
    tr: 'Bülten aboneliği şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
    en: 'The newsletter is not available at the moment. Please try again later.',
    ar: 'الاشتراك في النشرة غير متاح حاليًا. يرجى المحاولة لاحقًا.',
  },
  onayBaslik: { tr: 'Abonelik onayı', en: 'Confirm your subscription', ar: 'تأكيد الاشتراك' },
  onayBekleniyor: { tr: 'Aboneliğiniz onaylanıyor…', en: 'Confirming your subscription…', ar: 'جارٍ تأكيد اشتراككم…' },
  onayBasariBaslik: { tr: 'Aboneliğiniz başladı', en: 'You are subscribed', ar: 'تمّ اشتراككم' },
  onayBasariMetin: {
    tr: 'Teşekkür ederiz. Seçtiğiniz konularda yeni bir içerik yayınlandığında size e-posta gelecek.',
    en: 'Thank you. You will receive an e-mail whenever new content is published on the topics you chose.',
    ar: 'شكرًا لكم. ستصلكم رسالة كلما نُشر محتوى جديد في المواضيع التي اخترتموها.',
  },
  onayHata: {
    tr: 'Bu onay bağlantısı geçersiz ya da süresi dolmuş. Bülten sayfasından yeniden abone olabilirsiniz.',
    en: 'This confirmation link is invalid or has expired. You can subscribe again on the newsletter page.',
    ar: 'رابط التأكيد هذا غير صالح أو انتهت صلاحيته. يمكنكم الاشتراك من جديد في صفحة النشرة.',
  },
  onayKullanilamaz: {
    tr: 'Abonelik şu an onaylanamıyor. Lütfen daha sonra bağlantıya yeniden tıklayın.',
    en: 'Subscriptions cannot be confirmed at the moment. Please click the link again later.',
    ar: 'لا يمكن تأكيد الاشتراك حاليًا. يرجى الضغط على الرابط مرة أخرى لاحقًا.',
  },
  onayBultenSayfasi: { tr: 'Bülten sayfasına git', en: 'Go to the newsletter page', ar: 'الانتقال إلى صفحة النشرة' },
  onayEpostaKonu: {
    tr: 'Bülten aboneliğinizi onaylayın',
    en: 'Please confirm your newsletter subscription',
    ar: 'يرجى تأكيد اشتراككم في النشرة',
  },
  onayEpostaMetin: {
    tr: "Sıtkı Çoban'ın sitesindeki yenilikler için bültene abone olmak istediniz. Aboneliği başlatmak için aşağıdaki bağlantıya tıklayın; bağlantı 7 gün geçerlidir.",
    en: "You asked to subscribe to updates from Sıtkı Çoban's website. Click the link below to start your subscription; it is valid for 7 days.",
    ar: 'طلبتم الاشتراك في نشرة جديد موقع سيتكي تشوبان. اضغطوا على الرابط أدناه لبدء الاشتراك؛ الرابط صالح لمدة 7 أيام.',
  },
  onayEpostaDugme: { tr: 'Aboneliği onayla', en: 'Confirm subscription', ar: 'تأكيد الاشتراك' },
  onayEpostaNot: {
    tr: 'Bu isteği siz yapmadıysanız bu e-postayı silebilirsiniz; onaylamadığınız sürece size bülten gönderilmez.',
    en: 'If you did not make this request, you can delete this e-mail; no newsletter will be sent unless you confirm.',
    ar: 'إن لم تطلبوا ذلك فيمكنكم حذف هذه الرسالة؛ لن تُرسَل إليكم النشرة ما لم تؤكّدوا الاشتراك.',
  },
  duyuruKonuYazi: { tr: 'Yeni yazı: {baslik}', en: 'New writing: {baslik}', ar: 'مقالة جديدة: {baslik}' },
  duyuruKonuKitap: { tr: 'Yeni kitap: {baslik}', en: 'New book: {baslik}', ar: 'كتاب جديد: {baslik}' },
  duyuruKonuEser: { tr: 'Yeni eser: {baslik}', en: 'New work: {baslik}', ar: 'عمل جديد: {baslik}' },
  duyuruKonuVideo: { tr: 'Yeni video: {baslik}', en: 'New video: {baslik}', ar: 'فيديو جديد: {baslik}' },
  duyuruOku: { tr: 'Sitede oku →', en: 'Read on the site →', ar: 'اقرؤوا في الموقع ←' },
  duyuruGor: { tr: 'Sitede gör →', en: 'View on the site →', ar: 'شاهدوا في الموقع ←' },
  duyuruAyril: {
    tr: 'Abonelikten çık / tercihleri değiştir',
    en: 'Unsubscribe / change preferences',
    ar: 'إلغاء الاشتراك / تغيير التفضيلات',
  },
  pushBaslik: { tr: 'Tarayıcı bildirimleri', en: 'Browser notifications', ar: 'إشعارات المتصفح' },
  pushAciklama: {
    tr: 'Seçtiğiniz konularda yeni bir içerik yayınlandığında bu cihazda bildirim alın.',
    en: 'Get a notification on this device whenever new content is published on the topics you chose.',
    ar: 'تلقّوا إشعارًا على هذا الجهاز عند نشر محتوى جديد في المواضيع التي اخترتموها.',
  },
  pushAc: { tr: 'Bildirimleri aç', en: 'Turn on notifications', ar: 'تفعيل الإشعارات' },
  pushKapat: { tr: 'Bildirimleri kapat', en: 'Turn off notifications', ar: 'إيقاف الإشعارات' },
  pushBekle: { tr: 'Bir saniye…', en: 'One moment…', ar: 'لحظة من فضلكم…' },
  pushAcik: {
    tr: 'Bu cihazda bildirimler açık.',
    en: 'Notifications are on for this device.',
    ar: 'الإشعارات مفعّلة على هذا الجهاز.',
  },
  pushDesteklenmiyor: {
    tr: 'Bu tarayıcı bildirimleri desteklemiyor.',
    en: 'This browser does not support notifications.',
    ar: 'هذا المتصفح لا يدعم الإشعارات.',
  },
  pushIphone: {
    tr: "iPhone ve iPad'de bildirimler yalnızca site ana ekrana eklendiğinde çalışır: Safari'de Paylaş → Ana Ekrana Ekle'ye dokunun, sonra siteyi ana ekrandan açın.",
    en: 'On iPhone and iPad, notifications work only when the site is added to the Home Screen: in Safari tap Share → Add to Home Screen, then open the site from the Home Screen.',
    ar: 'على iPhone وiPad لا تعمل الإشعارات إلا بعد إضافة الموقع إلى الشاشة الرئيسية: في Safari اضغطوا مشاركة ← إضافة إلى الشاشة الرئيسية، ثم افتحوا الموقع منها.',
  },
  pushIzinYok: {
    tr: 'Bildirim izni verilmedi. İzni tarayıcı ayarlarından açabilirsiniz.',
    en: 'Notification permission was not granted. You can allow it in your browser settings.',
    ar: 'لم يُمنح إذن الإشعارات. يمكنكم السماح به من إعدادات المتصفح.',
  },
  pushHata: {
    tr: 'Bildirimler şu an açılamadı. Lütfen daha sonra tekrar deneyin.',
    en: 'Notifications could not be turned on right now. Please try again later.',
    ar: 'تعذّر تفعيل الإشعارات الآن. يرجى المحاولة لاحقًا.',
  },
  davetMetin: {
    tr: 'Yeni yazı, kitap, eser ve videolardan bildirimle haberdar olmak ister misiniz?',
    en: 'Would you like a notification when new writings, books, works and videos are published?',
    ar: 'هل تودّون تلقّي إشعار عند نشر مقالات وكتب وأعمال ومقاطع فيديو جديدة؟',
  },
  davetSonra: { tr: 'Daha sonra', en: 'Not now', ar: 'لاحقًا' },
}

const metinler = (l: keyof S) => Object.fromEntries(BULTEN_METIN_KEYS.map((k) => [k, BULTEN_METINLER[k][l]]))

export const SEED_BULTEN = {
  tr: {
    aciklama: 'Yeni yazılar, kitaplar, eserler ve videolar yayınlandığında e-postayla ya da tarayıcı bildirimiyle haber alın.',
    metinler: metinler('tr'),
  },
  en: {
    aciklama: 'Hear about new writings, books, works and videos by e-mail or browser notification as soon as they are published.',
    metinler: metinler('en'),
  },
  ar: {
    aciklama: 'تابعوا المقالات والكتب والأعمال والفيديوهات الجديدة عبر البريد الإلكتروني أو إشعارات المتصفح فور نشرها.',
    metinler: metinler('ar'),
  },
}
