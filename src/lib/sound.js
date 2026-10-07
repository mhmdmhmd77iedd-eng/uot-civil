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
// «جوجي»: أصوات ناعمة ولطيفة. النقرة فقاعة صغيرة طرية، والنجاح رنّة كاليمبا خفيفة مع لمعة،
// والدخول همسة هواء ولحن كاليمبا هادئ. كل النغمات عالية ورقيقة وبدون حواف معدنية
const dia = () => document.documentElement.dataset.world === 'diary'
function air(dur, vol, freq, at = 0, to = 0) {
  const c = ac(); if (!c) return
  const t = c.currentTime + at, len = Math.round(c.sampleRate * dur), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len)
  const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain()
  src.buffer = b; bp.type = 'bandpass'; bp.Q.value = 0.7
  bp.frequency.setValueAtTime(freq, t); if (to) bp.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.value = vol
  src.connect(bp).connect(g).connect(c.destination); src.start(t)
}
// كاليمبا: نغمة مثلثية ناعمة بهجوم طري وذيل طويل، ونغمة علوية خفيفة جداً
function kal(f, vol, at = 0, dur = 0.9) {
  const c = ac(); if (!c) return
  const t = c.currentTime + at
  ;[[1, 1, 'triangle'], [2, 0.12, 'sine']].forEach(([m, v, type]) => {
    const o = c.createOscillator(), g = c.createGain()
    o.type = type; o.frequency.value = f * m
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * v, t + 0.018); g.gain.exponentialRampToValueAtTime(0.0001, t + dur * (m === 1 ? 1 : 0.4))
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05)
  })
}
// سلم خماسي (دو ري مي صول لا) بطبقة عالية رقيقة
const SOFT = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093, 2349.3]
// فقاعة: نغمة جيبية قصيرة تطلع لفوق بنعومة
const bubble = () => { tone(520, 980, 0.07, 0.035, 'sine'); tone(1400, 1900, 0.05, 0.008, 'sine', 0.02) }

let last = 0
export function click() {
  if (!on()) return
  const n = performance.now(); if (n - last < 45) return; last = n
  try {
    if (neo()) { tone(1800, 1200, 0.035, 0.03, 'square'); tone(2600, 2600, 0.02, 0.012, 'sine', 0.015) }
    else if (dia()) bubble()
    else tone(880, 520, 0.05, 0.05)
  } catch {}
}
export function chime() {
  if (!on()) return
  try {
    if (neo()) { [880, 1175, 1568].forEach((f, i) => tone(f, f * 1.01, 0.14, 0.03, 'sawtooth', i * 0.06)) }
    else if (dia()) { kal(SOFT[2], 0.05); kal(SOFT[4], 0.045, 0.1); kal(SOFT[6], 0.035, 0.2, 1.2) }
    else { tone(660, 660, 0.12, 0.04, 'triangle'); tone(990, 990, 0.18, 0.035, 'triangle', 0.08) }
  } catch {}
}
export function soft() {
  if (!on()) return
  try {
    if (neo()) tone(900, 300, 0.12, 0.03, 'sawtooth')
    else if (dia()) { tone(880, 620, 0.12, 0.03, 'sine'); kal(SOFT[0], 0.025, 0.04, 0.5) }
    else tone(420, 300, 0.07, 0.04)
  } catch {}
}
// صوت دخول العالم الجديد
export function boot() {
  if (!on()) return
  try {
    if (dia()) { air(0.9, 0.05, 900, 0, 3200); [2, 4, 5, 4, 6, 5].forEach((k, i) => kal(SOFT[k], 0.045, 0.5 + i * 0.22, 1.1)); return }
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
