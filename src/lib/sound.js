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
  lp.type = 'lowpass'; lp.frequency.value = neo() || dia() ? 5200 : 2400
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(lp).connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02)
}

// عالم «طوكيو 2050» إله أصوات إلكترونية خاصة: نقرة رقمية، ونغمة صاعدة، وصوت تشغيل
const neo = () => document.documentElement.dataset.world === 'neo'
// «دفتري»: أصوات قرطاسية. النقرة لمسة ورق، والنغمات صندوق موسيقى صغير (أجراس معدنية بنغمات علوية)،
// والدخول صفحة دفتر تنقلب ثم لحن صندوق موسيقى
const dia = () => document.documentElement.dataset.world === 'diary'
function noise(dur, vol, freq, q, at = 0, sweep = 0) {
  const c = ac(); if (!c) return
  const t = c.currentTime + at, len = Math.round(c.sampleRate * dur), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * Math.min(1, i / len * 1.6)) * Math.pow(1 - i / len, 1.4)
  const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain()
  src.buffer = b; bp.type = 'bandpass'; bp.Q.value = q
  bp.frequency.setValueAtTime(freq, t); if (sweep) bp.frequency.exponentialRampToValueAtTime(sweep, t + dur)
  g.gain.value = vol
  src.connect(bp).connect(g).connect(c.destination); src.start(t)
}
// جرس صندوق الموسيقى: نغمة أساسية مع نغمات علوية غير متناسقة تختفي بسرعة، مثل أسنان المشط المعدني
function bell(f, vol, at = 0) {
  const c = ac(); if (!c) return
  const t = c.currentTime + at
  ;[[1, 1, 1.4], [2.76, 0.32, 0.5], [5.4, 0.12, 0.22]].forEach(([m, v, d]) => {
    const o = c.createOscillator(), g = c.createGain()
    o.type = 'sine'; o.frequency.value = f * m
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d)
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.05)
  })
}
// سلم خماسي ناعم (دو ري مي صول لا) بطبقة عالية
const BOX = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093]
// لمسة ورق: خشخشة قصيرة عالية مع نقرة خفيفة
const paper = () => { noise(0.045, 0.11, 3200, 0.8, 0, 5200); tone(620, 480, 0.03, 0.018, 'triangle') }
// قلبة صفحة: خشخشة أطول تنزل
const flip = (at = 0) => noise(0.42, 0.13, 5200, 0.6, at, 1400)

let last = 0
export function click() {
  if (!on()) return
  const n = performance.now(); if (n - last < 45) return; last = n
  try {
    if (neo()) { tone(1800, 1200, 0.035, 0.03, 'square'); tone(2600, 2600, 0.02, 0.012, 'sine', 0.015) }
    else if (dia()) paper()
    else tone(880, 520, 0.05, 0.05)
  } catch {}
}
export function chime() {
  if (!on()) return
  try {
    if (neo()) { [880, 1175, 1568].forEach((f, i) => tone(f, f * 1.01, 0.14, 0.03, 'sawtooth', i * 0.06)) }
    else if (dia()) { bell(BOX[2], 0.07); bell(BOX[4], 0.06, 0.11); bell(BOX[5], 0.05, 0.22) }
    else { tone(660, 660, 0.12, 0.04, 'triangle'); tone(990, 990, 0.18, 0.035, 'triangle', 0.08) }
  } catch {}
}
export function soft() {
  if (!on()) return
  try {
    if (neo()) tone(900, 300, 0.12, 0.03, 'sawtooth')
    else if (dia()) { noise(0.16, 0.08, 2600, 1.2, 0, 3800); bell(BOX[1], 0.04, 0.05) }
    else tone(420, 300, 0.07, 0.04)
  } catch {}
}
// صوت دخول العالم الجديد
export function boot() {
  if (!on()) return
  try {
    if (dia()) { flip(0); flip(0.9); [0, 2, 4, 3, 2, 4, 5].forEach((k, i) => bell(BOX[k], 0.06, 1.05 + i * 0.19)); return }
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
