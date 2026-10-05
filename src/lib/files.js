// تخزين الملفات المرفوعة على الجهاز (IndexedDB) لحد ما تنربط قاعدة البيانات، مع كشف المكرر بالبصمة
const DB = 'almadani-files'
function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore('blobs')
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}
async function tx(mode, fn) {
  const db = await open()
  return new Promise((res, rej) => {
    const t = db.transaction('blobs', mode)
    const out = fn(t.objectStore('blobs'))
    t.oncomplete = () => res(out?.result)
    t.onerror = () => rej(t.error)
  })
}
export const putBlob = (id, blob) => tx('readwrite', (s) => s.put(blob, id))
export const getBlob = (id) => tx('readonly', (s) => s.get(id))
export const delBlob = (id) => tx('readwrite', (s) => s.delete(id))

export async function fileHash(file) {
  const buf = await file.arrayBuffer()
  const h = await crypto.subtle.digest('SHA-256', buf)
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function fmtSize(n) {
  if (!n) return ''
  if (n < 1024 * 1024) return Math.max(1, Math.round(n / 1024)) + ' KB'
  return (n / 1024 / 1024).toFixed(1) + ' MB'
}

// تصنيف الملف: «معتمد من القسم» أو «غير رسمي». الملفات القديمة: الملازم معتمدة والباقي غير رسمي
export const isOfficial = (f) => (f.official ?? f.type === 'notes') ? 1 : 0
