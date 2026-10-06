// يعمل بدون إنترنت: يخزن واجهة التطبيق، ويحدّثها بالخلفية
const V = 'almadani-v1.5.1'
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'dev/01-avatar-main.webp', 'dev/07-gallery-suit.webp']
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())) })
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET') return
  const url = new URL(r.url)
  const same = url.origin === location.origin
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)
  if (!same && !font) return
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r, { cache: 'no-store' }).then((res) => { const copy = res.clone(); caches.open(V).then((c) => c.put('index.html', copy)); return res }).catch(() => caches.match('index.html')))
    return
  }
  e.respondWith(caches.match(r).then((hit) => {
    const net = fetch(r).then((res) => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)) } return res }).catch(() => hit)
    return hit || net
  }))
})
