const ID_RE = /^[A-Za-z0-9_-]{11}$/
const HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'])

/**
 * YouTube video kimliği: boş 11 karakterlik kimlik, youtu.be/<id>, youtube.com/watch?v=<id>,
 * /shorts/<id> ya da /embed/<id>. Başka her şey için null.
 */
export function youtubeId(input: string | null | undefined): string | null {
  const s = (input ?? '').trim()
  if (ID_RE.test(s)) return s
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.toLowerCase()
  const parts = url.pathname.split('/').filter(Boolean)
  let id: string | undefined
  if (host === 'youtu.be' || host === 'www.youtu.be') {
    id = parts[0]
  } else if (HOSTS.has(host)) {
    if (parts[0] === 'watch') id = url.searchParams.get('v') ?? undefined
    else if (parts[0] === 'shorts' || parts[0] === 'embed') id = parts[1]
  }
  return id && ID_RE.test(id) ? id : null
}

/** Kapak görseli (YouTube'un görsel sunucusundan; sayfa açılırken oynatıcı yüklenmez). */
export const youtubeThumb = (id: string): string => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

/** Gömülü oynatıcı adresi (çerezsiz alan adı); yalnızca kullanıcı videoyu açınca kullanılır. */
export const youtubeEmbed = (id: string): string => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`

export const youtubeWatch = (id: string): string => `https://www.youtube.com/watch?v=${id}`
