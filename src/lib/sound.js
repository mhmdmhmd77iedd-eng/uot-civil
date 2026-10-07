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
  lp.type = 'lowpass'; lp.frequency.value = neo() ? 5200 : bab() ? 3400 : 2400
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(lp).connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02)
}

// عالم «طوكيو 2050» إله أصوات إلكترونية خاصة: نقرة رقمية، ونغمة صاعدة، وصوت تشغيل
const neo = () => document.documentElement.dataset.world === 'neo'
// «بابل 3000»: نقرة وتر مثل العود، ونغمات من مقام الحجاز
const bab = () => document.documentElement.dataset.world === 'babel'
function pluck(f, vol, at = 0) { tone(f, f * 0.995, 0.32, vol, 'triangle', at); tone(f * 2, f * 2, 0.12, vol * 0.35, 'sine', at); tone(f / 2, f / 2, 0.22, vol * 0.5, 'sine', at) }
const HIJAZ = [293.7, 311.1, 370, 392, 440, 466.2, 523.3, 587.3]

let last = 0
export function click() {
  if (!on()) return
  const n = performance.now(); if (n - last < 45) return; last = n
  try {
    if (neo()) { tone(1800, 1200, 0.035, 0.03, 'square'); tone(2600, 2600, 0.02, 0.012, 'sine', 0.015) }
    else if (bab()) pluck(HIJAZ[(Math.random() * 4) | 0] * 2, 0.03)
    else tone(880, 520, 0.05, 0.05)
  } catch {}
}
export function chime() {
  if (!on()) return
  try {
    if (neo()) { [880, 1175, 1568].forEach((f, i) => tone(f, f * 1.01, 0.14, 0.03, 'sawtooth', i * 0.06)) }
    else if (bab()) [0, 2, 3, 4].forEach((k, i) => pluck(HIJAZ[k] * 2, 0.035, i * 0.09))
    else { tone(660, 660, 0.12, 0.04, 'triangle'); tone(990, 990, 0.18, 0.035, 'triangle', 0.08) }
  } catch {}
}
export function soft() {
  if (!on()) return
  try {
    if (neo()) tone(900, 300, 0.12, 0.03, 'sawtooth')
    else if (bab()) pluck(HIJAZ[1], 0.035)
    else tone(420, 300, 0.07, 0.04)
  } catch {}
}
// صوت دخول العالم الجديد
export function boot() {
  if (!on()) return
  try {
    if (bab()) { tone(73.4, 73.4, 1.4, 0.05, 'sine'); HIJAZ.forEach((f, i) => pluck(f, 0.035, 0.35 + i * 0.11)); return }
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
