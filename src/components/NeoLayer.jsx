import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { VERSION } from '../lib/store'

// طبقة عالم «طوكيو 2050»: شريط HUD علوي، مطر نيون، موجة عند اللمس، وشاشة إقلاع
const RAIN = Array.from({ length: 18 }, (_, k) => ({
  x: (k * 37) % 100, d: 2.6 + ((k * 7) % 10) / 4, l: (k * 13) % 9, h: 50 + ((k * 29) % 90), c: k % 3,
}))

function useClock() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i) }, [])
  return t
}

function Hud() {
  const t = useClock()
  const p = (n) => String(n).padStart(2, '0')
  return (
    <div className="neo-hud" aria-hidden="true">
      <span className="nh-l"><i />UOT·CIVIL<b>//</b>TOKYO-2050</span>
      <span className="nh-c">{p(t.getHours())}:{p(t.getMinutes())}<em>:{p(t.getSeconds())}</em></span>
      <span className="nh-r">SYS<b>OK</b><span className="nh-sig"><i /><i /><i /><i /></span></span>
    </div>
  )
}

function Boot({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1900); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="neo-boot" onClick={onDone} aria-hidden="true">
      <div className="nb-ring"><img src="icons/icon-192.png" alt="" /></div>
      <div className="nb-t" data-t="المدني">المدني</div>
      <div className="nb-s">TOKYO 2050 · NEURAL CAMPUS LINK</div>
      <div className="nb-bar"><i /></div>
      <div className="nb-log"><span>&gt; booting civil.os v{VERSION}</span><span>&gt; syncing courses ........ ok</span><span>&gt; neon grid online</span></div>
    </div>
  )
}

let booted = false

export default function NeoLayer() {
  const neo = useStore((s) => s.theme === 'neo')
  const [boot, setBoot] = useState(false)

  useEffect(() => {
    if (!neo) return
    if (!booted && !matchMedia('(prefers-reduced-motion: reduce)').matches) { booted = true; setBoot(true) }
    // موجة نيون مكان اللمسة
    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const r = document.createElement('i')
      r.className = 'neo-tap'
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'
      document.body.appendChild(r)
      setTimeout(() => r.remove(), 650)
    }
    addEventListener('pointerdown', onDown, { passive: true })
    return () => removeEventListener('pointerdown', onDown)
  }, [neo])

  if (!neo) return null
  return (
    <>
      <div className="neo-rain" aria-hidden="true">
        {RAIN.map((r, k) => <i key={k} className={'c' + r.c} style={{ left: r.x + '%', height: r.h, animationDuration: r.d + 's', animationDelay: -r.l + 's' }} />)}
      </div>
      <Hud />
      {boot && <Boot onDone={() => setBoot(false)} />}
    </>
  )
}
