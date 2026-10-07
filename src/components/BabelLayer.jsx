import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'

// طبقة عالم «بابل»: شريط علوي باسم بابل بالمسماري، ختم مسماري مكان اللمسة، وشاشة دخول من بوابة عشتار
// 𒆍𒀭𒊏𒆠 = KA₂.DINGIR.RA.KI «باب الإله»، اسم بابل كما كُتب على رقمها
export const BABYLON = '𒆍𒀭𒊏𒆠'
// علامات مسمارية حقيقية تنطبع مكان اللمسة مثل قلم القصب على الطين
const SIGNS = ['𒀭', '𒆠', '𒊏', '𒆍', '𒈗', '𒌓', '𒂗', '𒁹', '𒀸', '𒄿']
const AR = (s) => String(s).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d])

function Band() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => { const i = setInterval(() => setT(new Date()), 30000); return () => clearInterval(i) }, [])
  return (
    <div className="bab-band" aria-hidden="true">
      <span className="cu">{BABYLON}</span>
      <span className="t">{AR(`${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`)}</span>
      <span>بابل · باب الإله</span>
    </div>
  )
}

function Gate({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3150); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="bab-gate" onClick={onDone} aria-hidden="true">
      <div className="stars" />
      <div className="hd">
        <div className="cu">{BABYLON}</div>
        <div className="ar">بابل</div>
        <div className="mean">«باب الإله» · بوابة عشتار، ٥٧٥ قبل الميلاد</div>
      </div>
      <div className="gate"><img src="babel/gate.svg" alt="" /></div>
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
      r.className = 'bab-stamp'
      r.textContent = SIGNS[(Math.random() * SIGNS.length) | 0]
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'
      document.body.appendChild(r)
      setTimeout(() => r.remove(), 900)
    }
    addEventListener('pointerdown', onDown, { passive: true })
    return () => removeEventListener('pointerdown', onDown)
  }, [on])

  if (!on) return null
  return (
    <>
      <Band />
      {gate && <Gate onDone={() => setGate(false)} />}
    </>
  )
}
