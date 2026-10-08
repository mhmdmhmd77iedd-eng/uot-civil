// يعمل بدون إنترنت: يخزن واجهة التطبيق، ويحدّثها بالخلفية
// اسم الذاكرة يتبع رقم النسخة (sw.js?v=...)، فكل نسخة جديدة تمسح ملفات القديمة
const V = 'almadani-v' + (new URL(location.href).searchParams.get('v') || '0')
// ملفات المواد المحمّلة للاستخدام بدون نت تبقى مهما تحدّث التطبيق
const KEEP = ['almadani-files']
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'dev/01-avatar-main.webp', 'dev/07-gallery-suit.webp']
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())) })
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && !KEEP.includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
// تنبيهات الخادم (كوزات، تقارير، امتحانات) توصل حتى لو التطبيق مسدود
self.addEventListener('push', (e) => {
  let d = {}
  try { d = e.data ? e.data.json() : {} } catch {}
  if (!d.title) return
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body || '', tag: d.tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', dir: 'rtl', lang: 'ar', data: { url: './' } }))
})
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ws) => {
    const w = ws.find((x) => 'focus' in x)
    return w ? w.focus() : self.clients.openWindow('./')
  }))
})

self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET') return
  const url = new URL(r.url)
  const same = url.origin === location.origin
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)
  if (!same && !font) return
  // قائمة الملازم تتغير مع كل رفع: من الشبكة أول، والمخزونة بس إذا ماكو نت
  if (r.mode === 'navigate' || (same && url.pathname.endsWith('/materials.json'))) {
    const key = r.mode === 'navigate' ? 'index.html' : r
    e.respondWith(fetch(r, { cache: 'no-store' }).then((res) => { const copy = res.clone(); if (res.ok) caches.open(V).then((c) => c.put(key, copy)); return res }).catch(() => caches.match(key)))
    return
  }
  e.respondWith(caches.match(r).then((hit) => {
    const net = fetch(r).then((res) => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)) } return res }).catch(() => hit)
    return hit || net
  }))
})
