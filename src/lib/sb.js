// الربط مع الخادم (Supabase). المفتاح العام آمن داخل التطبيق لأن قواعد الحماية بالخادم هي اللي تقرر
import { createClient } from '@supabase/supabase-js'
import { useSyncExternalStore } from 'react'
import { getState, setState } from './store'

export const SB_URL = 'https://kdsesjhilvcbnofaqpml.supabase.co'
export const SB_KEY = 'sb_publishable_19KduHdwJ2e79IT4OjiqXg_M22daw2p'
export const APP_URL = 'https://mhmdmhmd77iedd-eng.github.io/uot-civil/'
// الدخول يظهر للكل بعد ما عبدالله يسوي حسابه ويصير المطوّر؛ قبلها يظهر بوضع المشرف بس
export const AUTH_LIVE = true

export const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } })

// ===== حالة الحساب =====
// { ready, user, roles:[{role,section_id,course_id}], section:{id,...}, member:'none'|'pending'|'approved'|'rejected', uniEmail, deviceOk }
let acct = { ready: false, user: null, roles: [], section: null, member: 'none', uniEmail: false, deviceOk: true }
const subs = new Set()
const set = (p) => { acct = { ...acct, ...p }; subs.forEach((f) => f()) }
export const getAcct = () => acct
export const useAcct = () => useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => acct)

export const isStaff = (a = acct) => a.roles.some((r) => r.role === 'owner' || r.role === 'supervisor')
export const isOwner = (a = acct) => a.roles.some((r) => r.role === 'owner')
export const isRep = (a = acct) => isStaff(a) || a.roles.some((r) => r.role === 'rep' && r.section_id === a.section?.id)
export const isVerified = (a = acct) => a.member === 'approved' || a.uniEmail || a.roles.length > 0

function deviceId() {
  try {
    let d = localStorage.getItem('almadani:device')
    if (!d) { d = crypto.randomUUID(); localStorage.setItem('almadani:device', d) }
    return d
  } catch { return 'unknown' }
}
const deviceLabel = () => { const u = navigator.userAgent; return /iphone|ipad/i.test(u) ? 'آيفون' : /android/i.test(u) ? 'أندرويد' : /windows/i.test(u) ? 'ويندوز' : /mac/i.test(u) ? 'ماك' : 'جهاز' }

// الدخول بالإيميل وكلمة السر (Google Cloud ما يقبل العراق)
const AUTH_ERR = {
  'Invalid login credentials': 'الإيميل أو كلمة السر غلط',
  'User already registered': 'هذا الإيميل عنده حساب، سجّل دخول بدل حساب جديد',
  'Email not confirmed': 'الحساب يحتاج تأكيد إيميل، راجع المطوّر',
  'Signups not allowed for this instance': 'تسجيل الحسابات الجديدة مسكّر حالياً',
}
const authMsg = (e) => AUTH_ERR[e?.message] || (/disabled|not allowed/i.test(e?.message || '') ? 'الدخول بالإيميل مطفي بـSupabase. لازم المطوّر يشغّل Enable Email provider' : /confirm|sending|rate limit/i.test(e?.message || '') ? 'الخادم يحاول يرسل رسالة تأكيد للإيميل. لازم المطوّر يطفي Confirm email بـSupabase' : /password/i.test(e?.message || '') ? 'كلمة السر لازم 6 أحرف أو أكثر' : /email/i.test(e?.message || '') ? 'اكتب الإيميل بشكل صحيح' : 'ما نجح، تأكد من النت وجرّب')
export async function signInEmail(email, password) {
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
  return error ? authMsg(error) : null
}
export async function signUpEmail(email, password, name) {
  const { data, error } = await sb.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } })
  if (error) return authMsg(error)
  if (!data.session) return 'انسوى الحساب بس يحتاج تأكيد إيميل، راجع المطوّر'
  return null
}
export async function changePassword(password) {
  const { error } = await sb.auth.updateUser({ password })
  return error ? authMsg(error) : null
}
// المطوّر أو المشرف يغيّر كلمة سر طالب نساها
export async function resetUserPassword(email, password) {
  const { data, error } = await sb.rpc('admin_set_password', { e: email.trim(), p: password })
  return error ? 'ما نجح، تأكد من صلاحيتك' : data === false ? 'ماكو حساب بهذا الإيميل' : null
}
export async function signOut() {
  try { await sb.from('devices').delete().eq('device_id', deviceId()) } catch {}
  await sb.auth.signOut()
  set({ user: null, roles: [], section: null, member: 'none', uniEmail: false, deviceOk: true })
}

// نجيب كل شي يخص الحساب: الأجهزة، الملف، الصلاحيات، الشعبة
export async function refresh() {
  const { data: { session } } = await sb.auth.getSession()
  const user = session?.user || null
  if (!user) return set({ ready: true, user: null, roles: [], section: null, member: 'none' })
  set({ user })

  const { data: ok } = await sb.rpc('register_device', { d: deviceId(), l: deviceLabel() })
  if (ok === false) return set({ ready: true, deviceOk: false })

  const p = getState().profile
  // نحدّث الملف الشخصي من اختيارات الطالب بالتطبيق
  if (p) await sb.from('profiles').update({ name: p.name || user.user_metadata?.name || user.user_metadata?.full_name || null, branch: p.branch || null, stage: p.stage, shift: p.shift }).eq('id', user.id)
  const [{ data: prof }, { data: roles }] = await Promise.all([
    sb.from('profiles').select('uni_email').eq('id', user.id).maybeSingle(),
    sb.from('user_roles').select('role, section_id, course_id').eq('user_id', user.id),
  ])

  let section = null, member = 'none'
  if (p?.stage && p?.shift) {
    const { data: sec } = await sb.from('sections').select('*').eq('branch', p.branch || 'str').eq('stage', p.stage).eq('shift', p.shift).order('letter').limit(1).maybeSingle()
    section = sec
    if (sec) {
      const { data: m } = await sb.from('section_members').select('status').eq('section_id', sec.id).eq('user_id', user.id).maybeSingle()
      member = m?.status || 'none'
    }
  }
  set({ ready: true, deviceOk: true, roles: roles || [], uniEmail: !!prof?.uni_email, section, member })
  if (canUpload() && !getState().admin) setState({ admin: true }) // المشرف والدكتور تنفتح لهم أدوات الرفع
  if (isVerified() && section) syncSection()
}

export async function joinSection() {
  if (!acct.section || !acct.user) return
  const { error } = await sb.from('section_members').insert({ section_id: acct.section.id, user_id: acct.user.id })
  if (!error) set({ member: 'pending' })
  return error
}

export async function claimOwner() {
  const { data } = await sb.rpc('claim_owner')
  await refresh()
  return data
}

// ===== مزامنة جدول الشعبة ومواعيدها =====
const toHM = (t) => (t || '').slice(0, 5)
export async function syncSection() {
  const s = acct.section
  if (!s) return
  const [{ data: cls }, { data: tks }, { data: anns }] = await Promise.all([
    sb.from('classes').select('*').eq('section_id', s.id),
    sb.from('tasks').select('*').eq('section_id', s.id),
    sb.from('announcements').select('*').or(`section_id.is.null,section_id.eq.${s.id}`).order('created_at', { ascending: false }).limit(30),
  ])
  setState((st) => ({
    classes: cls ? [...st.classes.filter((c) => c.src !== 'rep' && c.src !== 'srv'), ...cls.map((c) => ({ id: 's' + c.id, sid: c.id, course: c.course_id || '', title: c.title || undefined, day: c.day, start: toHM(c.start_time), end: toHM(c.end_time), room: c.room || '', prof: c.prof || '', kind: c.kind || 'نظري', src: 'srv' }))] : st.classes,
    tasks: tks ? [...st.tasks.filter((t) => t.src !== 'srv'), ...tks.map((t) => {
      const old = st.tasks.find((x) => x.sid === t.id)
      return { id: 's' + t.id, sid: t.id, type: t.type, course: t.course_id || '', title: t.title, due: t.due, time: toHM(t.due_time), note: t.note || '', done: old?.done || false, src: 'srv' }
    })] : st.tasks,
    srvAnns: anns || st.srvAnns || [],
    ttKey: cls?.length ? 'srv' : st.ttKey,
  }))
}

// الممثل ينشر محاضرات جدوله الحالية لكل الشعبة (يستبدل جدول الشعبة)
export async function publishClasses() {
  const s = acct.section
  const mine = getState().classes
  const rows = mine.map((c) => ({ section_id: s.id, course_id: c.course || null, title: c.title || null, day: c.day, start_time: c.start, end_time: c.end, room: c.room || null, prof: c.prof || null, kind: c.kind || 'نظري' }))
  const del = await sb.from('classes').delete().eq('section_id', s.id)
  if (del.error) return del.error
  if (rows.length) { const { error } = await sb.from('classes').insert(rows); if (error) return error }
  await syncSection()
}

export async function publishTask(t) {
  const s = acct.section
  const { error } = await sb.from('tasks').insert({ section_id: s.id, type: t.type, course_id: t.course || null, title: t.title, due: t.due, due_time: t.time || null, note: t.note || null })
  if (!error) await syncSection()
  return error
}
export async function deleteSrvTask(sid) {
  const { error } = await sb.from('tasks').delete().eq('id', sid)
  if (!error) await syncSection()
  return error
}

export async function postAnnouncement({ title, body, urgent, general }) {
  const { error } = await sb.from('announcements').insert({ title, body, urgent, section_id: general ? null : acct.section?.id })
  if (!error) await syncSection()
  return error
}

// ===== إدارة الشعبة (الممثل) =====
export async function pendingMembers() {
  const s = acct.section
  const { data } = await sb.from('section_members').select('user_id, status, created_at').eq('section_id', s.id).order('created_at')
  if (!data?.length) return []
  const { data: profs } = await sb.from('profiles').select('id, name, uni_email').in('id', data.map((m) => m.user_id))
  return data.map((m) => ({ ...m, name: profs?.find((p) => p.id === m.user_id)?.name || 'بدون اسم' }))
}
export async function decide(userId, status) {
  return (await sb.from('section_members').update({ status, decided_by: acct.user.id }).eq('section_id', acct.section.id).eq('user_id', userId)).error
}
export async function makeRep(userId) {
  return (await sb.from('user_roles').insert({ user_id: userId, role: 'rep', section_id: acct.section.id, granted_by: acct.user.id })).error
}
export async function makeSupervisor(userId) {
  return (await sb.from('user_roles').insert({ user_id: userId, role: 'supervisor', granted_by: acct.user.id })).error
}

// تشغيل: نسمع لتغيّر الدخول ونجيب الحالة
let started = false
export function startAuth() {
  if (started) return
  started = true
  fetchFiles().catch(() => {})
  sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT' || ev === 'INITIAL_SESSION') setTimeout(() => refresh().catch(() => set({ ready: true })), 0) })
  addEventListener('online', () => acct.user && refresh().catch(() => {}))
}

// ===== الملفات (المكتبة المشتركة) =====
// الكل يقرأ حتى بدون دخول، والرفع للمشرفين والدكتور لمادته
export async function fetchFiles() {
  const { data, error } = await sb.from('files').select('*').order('created_at', { ascending: false }).limit(2000)
  if (error || !data) return
  setState({ srvFiles: data.map((f) => ({ id: 'srv' + f.id, sid: f.id, course: f.course_id, type: f.type, lec: f.lec, official: f.official, title: f.title, year: f.year, round: f.round, exam: f.exam, author: f.author, size: f.size, hash: f.hash, kind: 'link', url: f.url, stored: !!f.storage_path, at: f.created_at?.slice(0, 10) })) })
}

export async function uploadFile(rec, file) {
  let url = rec.url || null, storage_path = null
  if (file) {
    const ext = (file.name.match(/\.([a-z0-9]{1,5})$/i)?.[1] || 'bin').toLowerCase()
    storage_path = `${rec.course}/${rec.hash}.${ext}`
    const up = await sb.storage.from('files').upload(storage_path, file, { contentType: file.type || undefined, upsert: false })
    if (up.error && !/exists/i.test(up.error.message)) return up.error
    url = sb.storage.from('files').getPublicUrl(storage_path).data.publicUrl
  }
  const { error } = await sb.from('files').insert({ course_id: rec.course, type: rec.type, lec: rec.lec || null, official: rec.official, title: rec.title, year: rec.year, round: rec.round, exam: rec.exam, author: rec.author, url, storage_path, hash: rec.hash || null, size: rec.size || null })
  if (!error) await fetchFiles()
  return error
}

export const canUpload = (a = acct) => isStaff(a) || a.roles.some((r) => r.role === 'doctor')

// تحميل ملفات مادة للاستخدام بدون إنترنت (تنحفظ بذاكرة المتصفح)
const FC = 'almadani-files'
export async function saveOffline(files) {
  const c = await caches.open(FC)
  let n = 0
  for (const f of files) {
    if (!f.stored || !f.url) continue
    try { if (!(await c.match(f.url))) { const r = await fetch(f.url); if (r.ok) await c.put(f.url, r) } n++ } catch {}
  }
  return n
}
export async function offlineBlob(url) {
  try { const r = await (await caches.open(FC)).match(url); return r ? await r.blob() : null } catch { return null }
}
export async function offlineCount(files) {
  try { const c = await caches.open(FC); let n = 0; for (const f of files) if (f.stored && (await c.match(f.url))) n++; return n } catch { return 0 }
}
