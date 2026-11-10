import type { GlobalConfig } from 'payload'

import { adminRead, adminWrite } from '@/lib/access'
import { revalidateHooks } from '@/lib/cache/revalidate'

/**
 * Bülten sayfası, onay sayfası, ana sayfa şeridi, alt bilgi bağlantısı ve e-posta metinleri. `ui-metinleri`
 * Postgres'in 100 argüman sınırına dayandığı için (bkz. Iletisim.ts) ayrı bir globalde tutulur.
 * Anahtar eklemek için buraya satır ekleyin ve seed/bulten.ts'ye üç dilde metnini yazın.
 */
const LABELS = {
  baslik: 'Sayfa başlığı (menüde ve sekmede)',
  altBilgiBaglanti: 'Alt bilgi: bağlantı metni',
  anasayfaEyebrow: 'Ana sayfa şeridi: üst etiket',
  anasayfaBaslik: 'Ana sayfa şeridi: başlık',
  anasayfaMetin: 'Ana sayfa şeridi: kısa metin',
  anasayfaBaglanti: 'Ana sayfa şeridi: bağlantı (Abone ol →)',
  formBaslik: 'Form: başlık',
  formAciklama: 'Form: açıklama',
  formEposta: 'Form: E-posta',
  formEpostaHata: 'Form: e-posta hatası',
  formKonular: 'Form: Konular başlığı',
  formKonuHata: 'Form: konu hatası (hiçbiri seçili değil)',
  konuYazilar: 'Konu: Yazılar',
  konuKitaplar: 'Konu: Kitaplar',
  konuEserler: 'Konu: Eserler',
  konuVideolar: 'Konu: Videolar',
  formOnay: 'Form: açık rıza onay kutusu',
  formAydinlatma: 'Form: Aydınlatma metni bağlantısı',
  formOnayHata: 'Form: onay hatası',
  formGonder: 'Form: Abone ol',
  formGonderiliyor: 'Form: Gönderiliyor',
  formBasariBaslik: 'Form: başarı başlığı',
  formBasariMetin: 'Form: başarı metni ({eposta} e-posta yerine geçer)',
  formYeniden: 'Form: Başka bir adres yaz',
  formHata: 'Form: gönderim hatası',
  formKullanilamaz: 'Form: bülten kapalı',
  onayBaslik: 'Onay sayfası: başlık',
  onayBekleniyor: 'Onay sayfası: onaylanıyor',
  onayBasariBaslik: 'Onay sayfası: başarı başlığı',
  onayBasariMetin: 'Onay sayfası: başarı metni',
  onayHata: 'Onay sayfası: geçersiz ya da süresi dolmuş bağlantı',
  onayKullanilamaz: 'Onay sayfası: bülten kapalı',
  onayBultenSayfasi: 'Onay sayfası: bülten sayfasına dön',
  onayEpostaKonu: 'Onay e-postası: konu satırı',
  onayEpostaMetin: 'Onay e-postası: metin',
  onayEpostaDugme: 'Onay e-postası: düğme',
  onayEpostaNot: 'Onay e-postası: alt not (istemediyseniz…)',
  duyuruKonuYazi: 'Duyuru e-postası konu satırı: yazı ({baslik} başlık yerine geçer)',
  duyuruKonuKitap: 'Duyuru e-postası konu satırı: kitap ({baslik})',
  duyuruKonuEser: 'Duyuru e-postası konu satırı: eser ({baslik})',
  duyuruKonuVideo: 'Duyuru e-postası konu satırı: video ({baslik})',
  duyuruOku: 'Duyuru e-postası: Sitede oku →',
  duyuruGor: 'Duyuru e-postası: Sitede gör →',
  duyuruAyril: 'Duyuru e-postası: Abonelikten çık / tercihler',
  pushBaslik: 'Bildirimler: başlık',
  pushAciklama: 'Bildirimler: açıklama',
  pushAc: 'Bildirimler: Bildirimleri aç',
  pushKapat: 'Bildirimler: Bildirimleri kapat',
  pushBekle: 'Bildirimler: işlem sürerken düğme metni (Bir saniye…)',
  pushAcik: 'Bildirimler: açık durumu',
  pushDesteklenmiyor: 'Bildirimler: tarayıcı desteklemiyor',
  pushIphone: 'Bildirimler: iPhone/iPad notu (ana ekrana ekleyin)',
  pushIzinYok: 'Bildirimler: izin verilmedi',
  pushHata: 'Bildirimler: hata',
  davetMetin: 'Bildirim daveti (siteye girişte çıkan kart): soru metni',
  davetSonra: 'Bildirim daveti: Daha sonra düğmesi',
} as const

export type BultenMetinKey = keyof typeof LABELS
export const BULTEN_METIN_KEYS = Object.keys(LABELS) as readonly BultenMetinKey[]

/**
 * Bülten. Aboneler Resend'de tutulur (veritabanında kişisel veri yok); burada yalnızca metinler var.
 * Ortam değişkenleri (RESEND_API_KEY, RESEND_FROM) yoksa form "şu an kullanılamıyor" der.
 */
export const Bulten: GlobalConfig = {
  slug: 'bulten',
  label: 'Bülten',
  access: { read: adminRead.read, update: adminWrite.update },
  hooks: { afterChange: [revalidateHooks('bulten').afterChange] },
  fields: [
    {
      name: 'aciklama',
      label: 'Sayfa açıklaması',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Bülten sayfasında başlığın altındaki cümle.' },
    },
    {
      name: 'metinler',
      label: 'Arayüz ve e-posta metinleri',
      type: 'group',
      admin: { description: 'Form, onay sayfası, ana sayfa şeridi, bildirimler ve e-postalardaki metinler.' },
      fields: BULTEN_METIN_KEYS.map((k) => ({ name: k, label: LABELS[k], type: 'text' as const, localized: true })),
    },
  ],
}
