// حفظ تلقائي لكل تغيير + نسخ احتياطية يومية (آخر 7 أيام) + تصدير واسترجاع
import { useSyncExternalStore } from 'react'

const KEY = 'almadani:v1'
const BK = 'almadani:backups'
export const VERSION = '1.0.0'

const initial = {
  profile: null, // { branch, stage, shift, name }
  theme: 'auto',
  admin: false,
  grades: {}, // courseId -> { saee, mid }
  requests: [], // { id, course, type, note, votes, mine, done, at }
  likes: {}, // announcementId -> true
  announcements: null, // null = استخدم الافتراضية
  exams: null,
  uploads: [], // { id, course, type, year, round, title, hash, size, at, kind:'file'|'link', url }
  seenWelcome: false,
}

function safeGet(k) { try { return localStorage.getItem(k) } catch { return null } }
function safeSet(k, v) { try { localStorage.setItem(k, v); return true } catch { return false } }

let state = (() => {
  try { return { ...initial, ...JSON.parse(safeGet(KEY) || '{}') } } catch { return { ...initial } }
})()
const subs = new Set()

function persist() {
  safeSet(KEY, JSON.stringify(state))
  dailyBackup()
}

function dailyBackup() {
  const today = new Date().toISOString().slice(0, 10)
  let list = []
  try { list = JSON.parse(safeGet(BK) || '[]') } catch {}
  const i = list.findIndex((b) => b.day === today)
  const entry = { day: today, data: state }
  if (i >= 0) list[i] = entry; else list.unshift(entry)
  safeSet(BK, JSON.stringify(list.slice(0, 7)))
}

export function setState(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  persist()
  subs.forEach((f) => f())
}
export const getState = () => state
export function useStore(sel = (s) => s) {
  return useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => sel(state))
}

export function listBackups() {
  try { return JSON.parse(safeGet(BK) || '[]') } catch { return [] }
}
export function restoreData(data) {
  state = { ...initial, ...data }
  persist()
  subs.forEach((f) => f())
}

export function exportBackupFile() {
  const blob = new Blob([JSON.stringify({ app: 'almadani', version: VERSION, at: new Date().toISOString(), data: state }, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `المدني-نسخة-احتياطية-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

export async function importBackupFile(file) {
  const j = JSON.parse(await file.text())
  if (j.app !== 'almadani' || !j.data) throw new Error('bad file')
  restoreData(j.data)
}
