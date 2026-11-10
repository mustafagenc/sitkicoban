import { dir, type Locale } from '@/i18n/config'
import type { Bulten } from '@/payload-types'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/**
 * Çift onay e-postası: sade HTML (site renkleri, izleme pikseli yok) ve düz metin. Tek bağlantı onay
 * bağlantısıdır; tanıtım ya da satın alma bağlantısı yoktur.
 */
export function onayEpostasi(
  m: NonNullable<Bulten['metinler']>,
  locale: Locale,
  baglanti: string,
): { subject: string; html: string; text: string } {
  const subject = m.onayEpostaKonu || 'sitkicoban.com'
  const metin = m.onayEpostaMetin ?? ''
  const dugme = m.onayEpostaDugme || baglanti
  const not = m.onayEpostaNot ?? ''
  const d = dir(locale)
  const html = `<!doctype html>
<html lang="${locale}" dir="${d}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f3ead7;color:#2b2118;font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ead7;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff8ea;border:1px solid #c9a96a;">
<tr><td dir="${d}" style="padding:36px 32px;text-align:${d === 'rtl' ? 'right' : 'left'};font-size:17px;line-height:1.6;">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#b08a3e;">Sıtkı Çoban</p>
<h1 style="margin:0 0 18px;font-weight:400;font-size:26px;color:#3a2a1a;">${esc(subject)}</h1>
<p style="margin:0 0 26px;">${esc(metin)}</p>
<p style="margin:0 0 26px;"><a href="${esc(baglanti)}" style="display:inline-block;background:#3a2a1a;color:#f3ead7;text-decoration:none;padding:12px 26px;">${esc(dugme)}</a></p>
<p style="margin:0 0 8px;font-size:13px;color:#5f4f3d;word-break:break-all;">${esc(baglanti)}</p>
<p style="margin:18px 0 0;font-size:13px;color:#5f4f3d;">${esc(not)}</p>
</td></tr></table>
</td></tr></table>
</body>
</html>`
  const text = [subject, '', metin, '', baglanti, '', not].join('\n')
  return { subject, html, text }
}
