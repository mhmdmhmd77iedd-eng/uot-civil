import { useEffect, useState } from 'react'
import { useStore, VERSION } from '../lib/store'

// طبقة عالم «بابل 3000»: بوابة عشتار بالمستقبل. غبار ذهبي، شريط علوي بزخرفة الوردة البابلية،
// نجمة ذهبية مكان اللمسة، وبوابة تنفتح عند الدخول
const DUST = Array.from({ length: 22 }, (_, k) => ({
  x: (k * 41) % 100, y: (k * 23) % 100, s: 2 + (k % 3), d: 9 + ((k * 7) % 9), l: (k * 5) % 9,
}))

// الوردة البابلية (زخرفة بوابة عشتار): 8 بتلات حول قلب
export function Rosette({ size = 18, className = '' }) {
  return (
    <svg className={'rosette ' + className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {Array.from({ length: 8 }, (_, k) => <ellipse key={k} cx="12" cy="6.2" rx="2.3" ry="4.6" transform={`rotate(${k * 45} 12 12)`} />)}
      <circle cx="12" cy="12" r="2.6" className="core" />
    </svg>
  )
}

const AR_DIGITS = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d])

function Band() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => { const i = setInterval(() => setT(new Date()), 30000); return () => clearInterval(i) }, [])
  const hm = AR_DIGITS(`${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`)
  return (
    <div className="bab-band" aria-hidden="true">
      <span><Rosette size={13} />بابل ٣٠٠٠</span>
      <span className="bb-c">{hm}</span>
      <span>{t.toLocaleDateString('ar-IQ', { weekday: 'long' })}<Rosette size={13} /></span>
    </div>
  )
}

function Gate({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2300); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="bab-gate" onClick={onDone} aria-hidden="true">
      <div className="bg-core">
        <div className="bg-sun" />
        <img src="icons/icon-192.png" alt="" />
        <div className="bg-t">بابل ٣٠٠٠</div>
        <div className="bg-s">المدني · بوابة عشتار · الإصدار {AR_DIGITS(VERSION)}</div>
        <div className="bg-frieze">{Array.from({ length: 7 }, (_, k) => <Rosette key={k} size={16} />)}</div>
      </div>
      <div className="bg-door l"><Rosette size={70} className="dr" /></div>
      <div className="bg-door r"><Rosette size={70} className="dr" /></div>
    </div>
  )
}

let opened = false

export default function BabelLayer() {
  const on = useStore((s) => s.theme === 'babel')
  const [gate, setGate] = useState(false)

  useEffect(() => {
    if (!on) return
    if (!opened && !matchMedia('(prefers-reduced-motion: reduce)').matches) { opened = true; setGate(true) }
    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const r = document.createElement('i')
      r.className = 'bab-tap'
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'
      document.body.appendChild(r)
      setTimeout(() => r.remove(), 700)
    }
    addEventListener('pointerdown', onDown, { passive: true })
    return () => removeEventListener('pointerdown', onDown)
  }, [on])

  if (!on) return null
  return (
    <>
      <div className="bab-dust" aria-hidden="true">
        {DUST.map((d, k) => <i key={k} style={{ left: d.x + '%', top: d.y + '%', width: d.s, height: d.s, animationDuration: d.d + 's', animationDelay: -d.l + 's' }} />)}
      </div>
      <Band />
      {gate && <Gate onDone={() => setGate(false)} />}
    </>
  )
}
