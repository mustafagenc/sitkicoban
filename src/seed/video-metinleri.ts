import { VIDEO_METIN_KEYS, type VideoMetinKey } from '@/globals/VideoMetinleri'

type S = { tr: string; en: string; ar: string }

/** Video metinleri global'inin metinleri (video-metinleri): üç dilde. */
export const VIDEO_METINLERI: Record<VideoMetinKey, S> = {
  videolarBaslik: { tr: 'Videolar', en: 'Videos', ar: 'الفيديوهات' },
  videolarAciklama: {
    tr: 'Klasik usulle meşk dersleri, söyleşiler ve programlar.',
    en: 'Lessons in the classical meşk method, conversations and programmes.',
    ar: 'دروس المَشْق على الطريقة الكلاسيكية، وحوارات وبرامج.',
  },
  videolarListeBaslik: { tr: 'Bütün videolar', en: 'All videos', ar: 'جميع الفيديوهات' },
  videoKategoriGrubu: { tr: 'Kategori', en: 'Category', ar: 'الفئة' },
  videoSayisi: { tr: '{n} video', en: 'Videos: {n}', ar: '{n} فيديو' },
  videolarBos: {
    tr: 'Bu kategoride henüz video yok.',
    en: 'There are no videos in this category yet.',
    ar: 'لا توجد فيديوهات في هذه الفئة بعد.',
  },
  videoOynat: { tr: 'Videoyu oynat', en: 'Play the video', ar: 'تشغيل الفيديو' },
  dersNo: { tr: '{n}. ders', en: 'Lesson {n}', ar: 'الدرس {n}' },
  videoSeriBaslik: { tr: '{seri} · {n} ders', en: '{seri} · {n} lessons', ar: '{seri} · {n} دروس' },
  youtubedaAc: { tr: "YouTube'da aç ↗", en: 'Open on YouTube ↗', ar: 'افتح في YouTube ↗' },
  tumVideolarOk: { tr: 'Tüm videolar →', en: 'All videos →', ar: 'جميع الفيديوهات ←' },
}

const metinler = (l: keyof S) => Object.fromEntries(VIDEO_METIN_KEYS.map((k) => [k, VIDEO_METINLERI[k][l]]))

export const SEED_VIDEO_METINLERI = {
  tr: metinler('tr'),
  en: metinler('en'),
  ar: metinler('ar'),
}
