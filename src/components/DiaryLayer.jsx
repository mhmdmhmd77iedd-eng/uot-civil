import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { hello } from '../lib/sound'

// طبقة عالم «دفتري»: غلاف دفتر ينفتح عند الدخول، وملصق صغير يطلع مكان كل لمسة
export const STICKERS = ['bow', 'heart', 'star', 'daisy', 'cherry', 'butterfly', 'strawberry', 'cloud', 'letter', 'pencil']
const POPS = ['heart', 'star', 'daisy', 'bow', 'cherry', 'strawberry']

export const sticker = (n) => `diary/${n}.svg`

function Cover({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2700); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="dia-cover" onClick={onDone} aria-hidden="true">
      <div className="book">
        <div className="page"><span className="hand">let's study ♡</span></div>
        <div className="lid">
          <img className="s1" src={sticker('bow')} alt="" />
          <img className="s2" src={sticker('daisy')} alt="" />
          <img className="s3" src={sticker('cherry')} alt="" />
          <img className="s4" src={sticker('star')} alt="" />
          <img className="s5" src={sticker('butterfly')} alt="" />
          <div className="label">
            <b>جوجي</b>
            <span className="hand">my study journal</span>
          </div>
          <i className="tape" />
        </div>
      </div>
    </div>
  )
}

let opened = false
let greeted = false

export default function DiaryLayer() {
  const on = useStore((s) => s.theme === 'diary')
  const [cover, setCover] = useState(false)

  useEffect(() => {
    if (!on) return
    if (!opened && !matchMedia('(prefers-reduced-motion: reduce)').matches) { opened = true; setCover(true) }
    // «جوجي» يسلّم بصوته أول ما ينفتح التطبيق؛ إذا المتصفح مانع الصوت، يسلّم مع أول لمسة
    if (!greeted) {
      greeted = true
      if (!hello()) addEventListener('pointerdown', () => setTimeout(hello, 30), { once: true, passive: true })
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // ملصق صغير ينلصق مكان اللمسة ويطير
    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const r = document.createElement('img')
      r.className = 'dia-pop'
      r.src = sticker(POPS[(Math.random() * POPS.length) | 0])
      r.alt = ''
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'
      r.style.setProperty('--r', `${Math.round(Math.random() * 40 - 20)}deg`)
      document.body.appendChild(r)
      setTimeout(() => r.remove(), 800)
    }
    addEventListener('pointerdown', onDown, { passive: true })
    return () => removeEventListener('pointerdown', onDown)
  }, [on])

  if (!on || !cover) return null
  return <Cover onDone={() => setCover(false)} />
}
