/*
 * Service worker: yalnızca tarayıcı bildirimleri (Web Push). Bildirimi gösterir, tıklanınca ilgili sayfayı açar.
 * Önbellekleme ve `fetch` dinleyicisi YOK: site her zaman ağdan gelir.
 * Yük (JSON): { title, body, url }. Bozuk ya da eksik yükte varsayılan başlık ve ana sayfa kullanılır.
 */

const ayniKokenUrl = (deger) => {
  try {
    const u = new URL(typeof deger === 'string' ? deger : '/', self.location.origin)
    return u.origin === self.location.origin ? u.href : self.location.origin + '/'
  } catch {
    return self.location.origin + '/'
  }
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let veri = {}
  try {
    veri = event.data ? event.data.json() : {}
  } catch {
    veri = { body: event.data ? event.data.text() : '' }
  }
  if (!veri || typeof veri !== 'object') veri = {}
  const title = typeof veri.title === 'string' && veri.title ? veri.title.slice(0, 200) : self.location.hostname
  const body = typeof veri.body === 'string' ? veri.body.slice(0, 500) : ''
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.svg',
      data: { url: ayniKokenUrl(veri.url) },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = ayniKokenUrl(event.notification.data && event.notification.data.url)
  event.waitUntil(
    (async () => {
      const pencereler = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const p of pencereler) {
        if (p.url === url && 'focus' in p) return p.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })(),
  )
})
