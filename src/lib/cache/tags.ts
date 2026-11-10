export type Tag = 'eserler' | 'kitaplar' | 'turler' | 'ayarlar' | 'ui' | 'anasayfa' | 'media' | 'dersler' | 'yazilar' | 'hayati' | 'videolar' | 'iletisim' | 'bulten'

/** Which cache tags a content source (collection/global slug) invalidates. */
export const TAGS_BY_SOURCE: Record<string, Tag[]> = {
  eserler: ['eserler', 'anasayfa'],
  kitaplar: ['kitaplar', 'anasayfa'],
  'yazi-turleri': ['turler', 'eserler', 'anasayfa'],
  'eser-turleri': ['turler', 'eserler', 'anasayfa'],
  media: ['media', 'eserler', 'kitaplar', 'anasayfa'],
  'site-ayarlari': ['ayarlar'],
  'ui-metinleri': ['ui'],
  anasayfa: ['anasayfa'],
  dersler: ['dersler'],
  yazilar: ['yazilar'],
  'yazi-kategorileri': ['yazilar'],
  hayati: ['hayati'],
  hocalar: ['hayati'],
  videolar: ['videolar'],
  'video-kategorileri': ['videolar'],
  iletisim: ['iletisim'],
  bulten: ['bulten'],
}
