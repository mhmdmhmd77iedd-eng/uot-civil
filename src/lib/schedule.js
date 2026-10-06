// جدولي: المحاضرات الأسبوعية ومواعيد التسليم والتنبيهات
import { getState, setState } from './store'
import { courseById } from '../data/catalog'
import { HUES } from '../components/icons'

// أسبوع الجامعة: السبت إلى الخميس (0 = السبت)
export const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
export const dayIdx = (d = new Date()) => (d.getDay() + 1) % 7 // الجمعة = 6 (عطلة)

export const CLASS_KINDS = ['نظري', 'عملي', 'مختبر', 'مناقشة']

export const TASK_TYPES = [
  { id: 'quiz', n: 'كوز', i: 'bolt', h: HUES.amber },
  { id: 'report', n: 'تقرير', i: 'paper', h: HUES.indigo },
  { id: 'homework', n: 'واجب', i: 'pencil', h: HUES.ocean },
  { id: 'exam', n: 'امتحان', i: 'flag', h: HUES.clay },
  { id: 'other', n: 'ملاحظة', i: 'pin', h: HUES.sage },
]
export const taskType = (id) => TASK_TYPES.find((t) => t.id === id) || TASK_TYPES[4]

export const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
const pad = (n) => String(n).padStart(2, '0')
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const toMin = (t) => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + (m || 0) }

// وقت ١٢ ساعة بالعربي: 8:30 ص
export function fmtTime(t) {
  if (!t) return ''
  let [h, m] = t.split(':').map(Number)
  const s = h < 12 ? 'ص' : 'م'
  h = h % 12 || 12
  return `${h}:${pad(m || 0)} ${s}`
}

export function dueAt(t) { return new Date(`${t.due}T${t.time || '23:59'}`) }

// كم يوم باقي (حسب التقويم، مو الساعات)
export function daysLeft(t, now = new Date()) {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [y, m, d] = t.due.split('-').map(Number)
  return Math.round((new Date(y, m - 1, d) - a) / 864e5)
}
export function dueText(t, now) {
  const n = daysLeft(t, now)
  if (n < 0) return { b: 'فات', s: `قبل ${-n} يوم`, late: true }
  if (n === 0) return { b: 'اليوم', s: t.time ? fmtTime(t.time) : '' }
  if (n === 1) return { b: 'باجر', s: t.time ? fmtTime(t.time) : '' }
  return { b: n, s: n <= 10 ? 'أيام' : 'يوم' }
}

export const courseName = (id, fallback) => courseById[id]?.name || fallback || 'بدون مادة'

// تواريخ أيام الأسبوع الحالي (السبت لحد الخميس)
export function weekDates(now = new Date()) {
  const di = dayIdx(now)
  const sat = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (di === 6 ? -1 : di))
  return DAYS.map((_, i) => new Date(sat.getFullYear(), sat.getMonth(), sat.getDate() + i))
}

// المحاضرة القادمة (أو الحالية) خلال الأسبوع
export function nextClass(classes, now = new Date()) {
  if (!classes.length) return null
  const di = dayIdx(now), cur = now.getHours() * 60 + now.getMinutes()
  for (let k = 0; k < 7; k++) {
    const d = (di + k) % 7
    const list = classes.filter((c) => c.day === d).sort((a, b) => toMin(a.start) - toMin(b.start))
    const hit = k === 0 ? list.find((c) => toMin(c.end) > cur) : list[0]
    if (hit) return { c: hit, inDays: k, live: k === 0 && toMin(hit.start) <= cur }
  }
  return null
}

export function upcomingTasks(tasks, now = new Date()) {
  return tasks.filter((t) => !t.done && daysLeft(t, now) >= 0).sort((a, b) => dueAt(a) - dueAt(b))
}

// ملخص الأسبوع
export function weekSummary(s, now = new Date()) {
  const dates = weekDates(now).map(ymd)
  const inWeek = s.tasks.filter((t) => t.due >= dates[0] && t.due <= dates[5])
  return { lectures: s.classes.length, left: inWeek.filter((t) => !t.done).length, done: inWeek.filter((t) => t.done).length }
}

// ===== التنبيهات =====
// قبل الموعد بيوم (من الساعة 8 صباحاً)، وصباح نفس اليوم (من الساعة 7)
export const notifySupported = () => typeof Notification !== 'undefined'
export async function askNotify() {
  if (!notifySupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  try { return await Notification.requestPermission() } catch { return 'denied' }
}

async function show(title, body, tag) {
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    const opt = { body, tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', dir: 'rtl', lang: 'ar' }
    if (reg) await reg.showNotification(title, opt)
    else new Notification(title, opt)
  } catch {}
}

export function checkReminders(now = new Date()) {
  const s = getState()
  if (!notifySupported() || Notification.permission !== 'granted') return
  const sent = { ...(s.notified || {}) }
  let changed = false
  for (const t of s.tasks) {
    if (t.done) continue
    const n = daysLeft(t, now), h = now.getHours()
    const tt = taskType(t.type), cn = courseName(t.course, '')
    const what = `${tt.n}${cn ? ' ' + cn : ''}`
    if (n === 1 && h >= 8 && !sent[t.id + ':1']) {
      show(`باجر عندك ${what}`, `${t.title}${t.time ? ' · ' + fmtTime(t.time) : ''}`, t.id + ':1'); sent[t.id + ':1'] = 1; changed = true
    }
    if (n === 0 && h >= 7 && !sent[t.id + ':0']) {
      show(`اليوم عندك ${what}`, `${t.title}${t.time ? ' · ' + fmtTime(t.time) : ''}`, t.id + ':0'); sent[t.id + ':0'] = 1; sent[t.id + ':1'] = 1; changed = true
    }
  }
  if (changed) setState({ notified: sent })
}

// «قبل ساعتين»، «أمس»، «قبل 3 أيام»
export function ago(iso, now = Date.now()) {
  if (!iso) return ''
  const m = Math.round((now - new Date(iso).getTime()) / 6e4)
  if (m < 1) return 'هسه'
  if (m < 60) return `قبل ${m} دقيقة`
  const h = Math.round(m / 60)
  if (h < 24) return h === 1 ? 'قبل ساعة' : h === 2 ? 'قبل ساعتين' : `قبل ${h} ساعات`
  const d = Math.round(h / 24)
  if (d === 1) return 'أمس'
  if (d < 30) return d === 2 ? 'قبل يومين' : `قبل ${d} أيام`
  return new Date(iso).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long' })
}
export const MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
export const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
export const dateLong = (d) => `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
