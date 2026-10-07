import { getState } from './store'

// أصوات خفيفة مولّدة بالمتصفح (بدون ملفات): نقرة خشبية ناعمة، ونغمتين للنجاح
let ctx
const ac = () => { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A() } if (ctx?.state === 'suspended') ctx.resume(); return ctx }
const on = () => getState().sound !== false && !matchMedia('(prefers-reduced-motion: reduce)').matches

function tone(f1, f2, dur, vol, type = 'sine', at = 0) {
  const c = ac(); if (!c) return
  const t = c.currentTime + at
  const o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter()
  o.type = type
  o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur)
  lp.type = 'lowpass'; lp.frequency.value = neo() ? 5200 : 2400
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(lp).connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02)
}

// عالم «طوكيو 2050» إله أصوات إلكترونية خاصة: نقرة رقمية، ونغمة صاعدة، وصوت تشغيل
const neo = () => document.documentElement.dataset.world === 'neo'
// «بابل»: أصوات من بلاد الرافدين. النقرة طرقة قلم القصب على رقيم طين، والنغمات قيثارة سومرية
// (مثل قيثارة أور) بأوتار مولّدة بطريقة كاربلس-سترونغ، بسلّم سباعي قريب من سلالم الرقم الموسيقية البابلية
const bab = () => document.documentElement.dataset.world === 'babel'
const LYRE = [220, 247.5, 264, 293.3, 330, 352, 396, 440]
const strings = {}
let hall
function room(c) {
  if (hall) return hall
  const len = c.sampleRate * 1.4, b = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) }
  hall = c.createConvolver(); hall.buffer = b
  const w = c.createGain(); w.gain.value = 0.28; hall.connect(w).connect(c.destination)
  return hall
}
function lyre(f, vol, at = 0, dur = 1.6) {
  const c = ac(); if (!c) return
  const key = Math.round(f)
  if (!strings[key]) {
    const sr = c.sampleRate, n = Math.round(sr / f), len = Math.round(sr * dur), b = c.createBuffer(1, len, sr), d = b.getChannelData(0)
    let prev = 0
    for (let i = 0; i < n; i++) { const r = Math.random() * 2 - 1; prev = prev * 0.5 + r * 0.5; d[i] = prev }
    for (let i = n; i < len; i++) d[i] = 0.4985 * (d[i - n] + d[i - n - 1])
    strings[key] = b
  }
  const t = c.currentTime + at, src = c.createBufferSource(), g = c.createGain(), lp = c.createBiquadFilter()
  src.buffer = strings[key]; lp.type = 'lowpass'; lp.frequency.value = 2600; g.gain.value = vol
  src.connect(lp).connect(g); g.connect(c.destination); g.connect(room(c)); src.start(t)
}
function noise(dur, vol, freq, q, at = 0) {
  const c = ac(); if (!c) return
  const t = c.currentTime + at, len = Math.round(c.sampleRate * dur), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2)
  const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain()
  src.buffer = b; bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q; g.gain.value = vol
  src.connect(bp).connect(g).connect(c.destination); src.start(t)
}
// طرقة القلم على الطين: نقرة مكتومة قصيرة
const clay = () => { noise(0.028, 0.22, 1300, 0.9); tone(150, 110, 0.04, 0.03, 'sine') }
// ضربة طبل الإطار (الدف الرافديني)
const drum = (at = 0) => { tone(96, 52, 0.55, 0.09, 'sine', at); noise(0.06, 0.12, 300, 0.7, at) }

let last = 0
export function click() {
  if (!on()) return
  const n = performance.now(); if (n - last < 45) return; last = n
  try {
    if (neo()) { tone(1800, 1200, 0.035, 0.03, 'square'); tone(2600, 2600, 0.02, 0.012, 'sine', 0.015) }
    else if (bab()) clay()
    else tone(880, 520, 0.05, 0.05)
  } catch {}
}
export function chime() {
  if (!on()) return
  try {
    if (neo()) { [880, 1175, 1568].forEach((f, i) => tone(f, f * 1.01, 0.14, 0.03, 'sawtooth', i * 0.06)) }
    else if (bab()) { lyre(LYRE[4], 0.32); lyre(LYRE[7], 0.26, 0.13) }
    else { tone(660, 660, 0.12, 0.04, 'triangle'); tone(990, 990, 0.18, 0.035, 'triangle', 0.08) }
  } catch {}
}
export function soft() {
  if (!on()) return
  try {
    if (neo()) tone(900, 300, 0.12, 0.03, 'sawtooth')
    else if (bab()) lyre(LYRE[2], 0.28)
    else tone(420, 300, 0.07, 0.04)
  } catch {}
}
// صوت دخول العالم الجديد
export function boot() {
  if (!on()) return
  try {
    if (bab()) { drum(0); drum(1.15); [4, 5, 4, 3, 2, 3, 4, 0].forEach((k, i) => lyre(LYRE[k], 0.3, 0.3 + i * 0.24, 2.2)); return }
    tone(110, 880, 0.5, 0.035, 'sawtooth'); [523, 784, 1047, 1568].forEach((f, i) => tone(f, f, 0.18, 0.025, 'triangle', 0.25 + i * 0.07)) } catch {}
}

// نقرة لكل زر بالتطبيق
export function installSounds() {
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest?.('button, a, [role="button"], input[type="checkbox"], label.switchrow')
    if (!el || el.disabled) return
    click()
  }, { passive: true })
}
