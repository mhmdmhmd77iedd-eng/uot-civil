import { useState } from 'react'
import { useStore } from '../lib/store'
import { PREREQS, courseById, before, after, blockedBy, coursesFor } from '../data/catalog'
import { I, HUES } from '../components/icons'
import { Bar, PrintFrame, tap } from '../components/ui'

// السلاسل الرئيسية: نبدأ من كل مادة ما قبلها شي
function chains() {
  const roots = [...new Set(PREREQS.map(([a]) => a))].filter((x) => !before(x).length)
  const out = []
  const walk = (id, path) => { const n = after(id); if (!n.length) out.push(path); else n.forEach((x) => walk(x, [...path, x])) }
  roots.forEach((r) => walk(r, [r]))
  return out
}
const CH = chains()

export default function MapScreen({ focus, back, nav }) {
  const { profile } = useStore()
  const [sel, setSel] = useState(focus || null)
  const mine = new Set(coursesFor(profile).map((c) => c.id))
  const blocked = sel ? blockedBy(sel) : []

  return (
    <div className="screen">
      <PrintFrame title="خريطة المواد والمتطلبات" />
      <Bar title="خريطة موادي" sub="اضغط أي مادة حتى تشوف شنو قبلها وشنو تفتح بعدها" onBack={back}
        end={<button className="iconbtn no-print" onClick={() => print()} aria-label="طباعة"><I n="print" size={20} /></button>} />

      {sel && (
        <div className="card" style={{ marginBottom: 14, animation: 'up .35s var(--ease)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <b>{courseById[sel].name}</b>
            <button className="btn soft sm no-print" onClick={() => nav('course', { id: sel })}>فتح المادة</button>
          </div>
          <div className="small" style={{ marginTop: 8 }}>
            {before(sel).length ? <>قبلها: <b>{before(sel).map((x) => courseById[x].name).join('، ')}</b></> : 'ما عليها متطلب سابق.'}
          </div>
          {blocked.length > 0 && (
            <div className="small tone-bad" style={{ marginTop: 6 }}>
              إذا ما عبرتها تتأخر عليك: {blocked.map((x) => courseById[x].name).join('، ')}
            </div>
          )}
        </div>
      )}

      <div className="stack stagger">
        {CH.map((ch, i) => (
          <div key={i} className="card">
            <div className="flow">
              {ch.map((id, j) => (
                <span key={id} style={{ display: 'contents' }}>
                  {j > 0 && <span className="arrow">←</span>}
                  <button className={`n ${sel === id ? 'me' : ''} ${blocked.includes(id) ? 'risk' : ''}`} onClick={() => { tap(); setSel(id) }}
                    style={mine.has(id) && sel !== id ? { boxShadow: 'inset 0 -3px 0 var(--gold), var(--sh)' } : null}>
                    {courseById[id].name}
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 14 }}>
        <span style={{ boxShadow: 'inset 0 -3px 0 var(--gold)', padding: '0 4px' }}>الخط الذهبي</span> = مادة من مرحلتك الحالية. المصدر: مخطط المتطلبات لبكالوريوس الهندسة المدنية 2023/2024.
      </p>
    </div>
  )
}
