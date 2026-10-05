import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { PREREQS, COURSES, STAGES, courseById, before, after, blockedBy, coursesFor } from '../data/catalog'
import { currentSemester } from '../lib/profile'
import { courseHue } from './Home'
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

export const MAX_UNITS = 30 // الحد الأعلى للتسجيل بالفصل (أكده عبدالله)

function Plan({ profile, plan }) {
  const [sem, setSem] = useState(currentSemester())
  const [more, setMore] = useState(false)
  const ids = plan?.[sem] ?? []
  const mine = coursesFor(profile).filter((c) => c.sem === sem)
  // أول مرة: نختار مواد مرحلتك تلقائياً
  const chosen = new Set(plan?.[sem] ? ids : mine.map((c) => c.id))
  const total = [...chosen].reduce((a, id) => a + (courseById[id]?.ects || 0), 0)
  const over = total > MAX_UNITS
  const carried = COURSES.filter((c) => c.stage < profile.stage && c.sem === sem && (!c.branches || c.branches.includes(profile.branch)))
  const toggle = (id) => { tap(); const n = new Set(chosen); n.has(id) ? n.delete(id) : n.add(id); setState((s) => ({ plan: { ...s.plan, [sem]: [...n] } })) }
  const Row = (c) => {
    const on = chosen.has(c.id)
    const missing = before(c.id).filter((x) => chosen.has(x))
    return (
      <button key={c.id} className="row" style={{ '--h': courseHue(c.id), padding: '10px 12px' }} onClick={() => toggle(c.id)}>
        <span className="ic" style={{ width: 30, height: 30, borderRadius: 10, background: on ? 'var(--h)' : 'var(--sf2)', color: '#fff' }}>{on && <I n="check" size={17} />}</span>
        <div style={{ minWidth: 0 }}><div className="t">{c.name}</div><div className="m">{STAGES.find((x) => x.id === c.stage)?.name}{missing.length ? <span className="tone-bad"> · متطلبها {courseById[missing[0]].name} بنفس الفصل</span> : null}</div></div>
        <span className="end" style={{ fontFamily: 'var(--hd)', fontWeight: 600, color: 'var(--tx)' }}>{c.ects}<span className="small muted"> وحدات</span></span>
      </button>
    )
  }
  return (
    <>
      <div className="tabs">
        <button className={sem === 1 ? 'on' : ''} onClick={() => setSem(1)}>الفصل الأول</button>
        <button className={sem === 2 ? 'on' : ''} onClick={() => setSem(2)}>الفصل الثاني</button>
      </div>
      <div className="card plan-total" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <div className="ring" style={{ '--p': Math.min(100, (total / MAX_UNITS) * 100), '--c': over ? 'var(--bad)' : 'var(--ac)' }}><span>{total}</span></div>
        <div>
          <b style={{ fontSize: 15 }}>{total} من {MAX_UNITS} وحدة</b>
          <div className={`small ${over ? 'tone-bad' : 'muted'}`}>{over ? `تجاوزت الحد بـ ${total - MAX_UNITS} وحدة، شيل مادة حتى يقبل تسجيلك` : `تكدر تضيف ${MAX_UNITS - total} وحدة بعد (مثلاً مادة محمّلة)`}</div>
        </div>
      </div>
      <div className="sec">مواد مرحلتك</div>
      <div className="stack">{mine.map(Row)}</div>
      {carried.length > 0 && (
        <>
          <div className="sec">مواد محمّلة من مراحل سابقة <button onClick={() => setMore(!more)}>{more ? 'إخفاء' : 'عرض'}</button></div>
          {(more || carried.some((c) => chosen.has(c.id))) && <div className="stack">{(more ? carried : carried.filter((c) => chosen.has(c.id))).map(Row)}</div>}
        </>
      )}
      <p className="small muted" style={{ marginTop: 12 }}>هذي خطة تساعدك تعرف مجموع وحداتك قبل التسجيل على منظومة بولونيا. التسجيل الرسمي يبقى من المنظومة.</p>
    </>
  )
}

export default function MapScreen({ focus, back, nav, tab: tab0 }) {
  const { profile, plan } = useStore()
  const [tab, setTab] = useState(tab0 || 'map')
  const [sel, setSel] = useState(focus || null)
  const mine = new Set(coursesFor(profile).map((c) => c.id))
  const blocked = sel ? blockedBy(sel) : []

  return (
    <div className="screen">
      <PrintFrame title="خريطة المواد والمتطلبات" />
      <Bar title="خريطة موادي" sub="شنو قبل كل مادة، وكم وحدة تسجل بالفصل" onBack={back}
        end={<button className="iconbtn no-print" onClick={() => print()} aria-label="طباعة"><I n="print" size={20} /></button>} />

      <div className="tabs no-print">
        <button className={tab === 'map' ? 'on' : ''} onClick={() => { tap(); setTab('map') }}>تسلسل المواد</button>
        <button className={tab === 'plan' ? 'on' : ''} onClick={() => { tap(); setTab('plan') }}>خطة تسجيلي (الوحدات)</button>
      </div>

      {tab === 'plan' ? <Plan profile={profile} plan={plan} /> : <>
      {sel && (
        <div className="card" style={{ marginBottom: 14, animation: 'up .35s var(--ease)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <b>{courseById[sel].name} <span className="unit">{courseById[sel].ects} وحدات</span></b>
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
                    {courseById[id].name}<span className="unit">{courseById[id].ects}</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 14 }}>
        <span style={{ boxShadow: 'inset 0 -3px 0 var(--gold)', padding: '0 4px' }}>الخط الذهبي</span> = مادة من مرحلتك الحالية. الرقم الأصفر = عدد وحدات المادة. المصدر: مخطط المتطلبات لبكالوريوس الهندسة المدنية 2023/2024.
      </p>
      </>}
    </div>
  )
}
