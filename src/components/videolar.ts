import type { Locale } from '@/i18n/config'
import { mediaUrl } from '@/lib/media'
import { youtubeId, youtubeThumb } from '@/lib/youtube'
import type { Media, UiMetinleri, VideoKategorileri, Videolar } from '@/payload-types'

import { formatTarih } from './yazilar'

/** Video listesi, ana sayfa bölümü ve oynatıcı penceresinin kullandığı düz (serileştirilebilir) video verisi. */
export type VideoItem = {
  id: number
  baslik: string
  altBaslik: string | null
  /** Gömülü oynatıcı yalnızca bu kimlikle, kullanıcı açınca kurulur. */
  youtubeId: string
  kategoriId: number | null
  kategori: string | null
  seri: string | null
  bolum: number | null
  /** "3. ders" gibi; yalnızca seri ve bölüm no varsa. */
  dersNo: string | null
  sure: string | null
  /** "Ekim 2025" gibi, dile göre biçimlenmiş. */
  tarih: string | null
  kanal: string | null
  aciklama: string | null
  /** Kendi kapağı ya da YouTube kapağı (i.ytimg.com). */
  kapak: string
  /** Son güncelleme (ana sayfa videosu seçimi için). */
  guncellendi: string
  anasayfada: boolean
}

const obj = <T extends object>(v: unknown): T | null => (v && typeof v === 'object' ? (v as T) : null)
const text = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null)

export function toVideolar(docs: Videolar[], ui: UiMetinleri, locale: Locale): VideoItem[] {
  return docs.flatMap((d) => {
    const yt = youtubeId(d.youtube)
    if (!yt) return []
    const kat = obj<VideoKategorileri>(d.kategori)
    const seri = text(d.seri)
    const bolum = typeof d.bolum === 'number' && d.bolum >= 1 ? d.bolum : null
    return [
      {
        id: d.id,
        baslik: d.baslik,
        altBaslik: text(d.altBaslik),
        youtubeId: yt,
        kategoriId: kat?.id ?? null,
        kategori: text(kat?.ad),
        seri,
        bolum,
        dersNo: seri && bolum !== null && ui.dersNo ? ui.dersNo.replace('{n}', String(bolum)) : null,
        sure: text(d.sure),
        tarih: formatTarih(d.tarih, locale),
        kanal: text(d.kanal),
        aciklama: text(d.aciklama),
        kapak: mediaUrl(obj<Media>(d.kapak)) ?? youtubeThumb(yt),
        guncellendi: d.updatedAt,
        anasayfada: Boolean(d.anasayfada),
      },
    ]
  })
}

/** Ana sayfadaki video: işaretlenenlerden en son güncellenen; yoksa null. */
export function anasayfaVideosu(list: VideoItem[]): VideoItem | null {
  return (
    list
      .filter((v) => v.anasayfada)
      .sort((a, b) => b.guncellendi.localeCompare(a.guncellendi))[0] ?? null
  )
}

/** Aynı seriye ait videolar, bölüm sırasıyla (seri yoksa ya da tek videoysa boş). */
export function seriVideolari(list: VideoItem[], v: VideoItem): VideoItem[] {
  if (!v.seri) return []
  const same = list.filter((x) => x.seri === v.seri)
  if (same.length < 2) return []
  return [...same].sort((a, b) => (a.bolum ?? Infinity) - (b.bolum ?? Infinity))
}

/** Seri listesinde gösterilen ad: "{seri} · " öneki varsa atılır. */
export const bolumAdi = (v: VideoItem): string =>
  v.seri && v.baslik.startsWith(`${v.seri} · `) ? v.baslik.slice(v.seri.length + 3) : v.baslik
