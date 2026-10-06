import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { PREREQS, COURSES, STAGES, ELECTIVE_SLOTS, courseById, before, after, blockedBy, coursesFor } from '../data/catalog'
import { currentSemester } from '../lib/profile'
import { courseHue } from '../lib/look'
import { I, HUES } from '../components/icons'
import { Bar, PrintFrame, Sheet, tap } from '../components/ui'

// السلاسل الرئيسية: نبدأ من كل مادة ما قبلها شي
function chains() {
  const roots = [...new Set(PREREQS.map(([a]) => a))].filter((x) => !before(x).length)
  const out = []
  const walk = (id, path) => { const n = after(id); if (!n.length) out.push(path); else n.forEach((x) => walk(x, [...path, x])) }
  roots.forEach((r) => walk(r, [r]))
  return out
}
const CH = chains()
// كل المتطلبات السابقة للمادة (السلسلة كاملة لورا)
function needs(id, seen = new Set()) { for (const n of before(id)) if (!seen.has(n)) { seen.add(n); needs(n, seen) } return [...seen] }
// المواد الداخلة بالمتطلبات مرتبة حسب المرحلة والفصل
const LINKED = [...new Set(PREREQS.flat())].map((id) => courseById[id]).filter(Boolean)
const BY_STAGE = STAGES.map((st) => ({ st, sems: [1, 2].map((sm) => LINKED.filter((c) => c.stage === st.id && c.sem === sm)) })).filter((x) => x.sems[0].length + x.sems[1].length)

export const MAX_UNITS = 30 // الحد الأعلى للتسجيل بالفصل (أكده عبدالله)

function Plan({ profile, plan, nav }) {
  const [sem, setSem] = useState(currentSemester())
  const [add, setAdd] = useState(false)
  // مواد الفرع تنحسب ضمن المواد الاختيارية (وحداتها من المخطط الرسمي)
  const slots = (ELECTIVE_SLOTS[`${profile.stage}-${sem}`] || []).map((u, i) => ({ id: `EL:${profile.stage}-${sem}:${i}`, name: `مادة اختيارية من فرعك (${i + 1})`, ects: u, stage: profile.stage, sem }))
  const mine = [...coursesFor(profile).filter((c) => c.sem === sem && !c.branches), ...slots]
  const unit = (id) => courseById[id]?.ects ?? slots.find((x) => x.id === id)?.ects ?? 0
  // أول مرة: كل مواد مرحلتك مختارة
  const chosen = new Set(plan?.[sem] ?? mine.map((c) => c.id))
  const total = [...chosen].filter((id) => !id.startsWith('EL:') || slots.some((x) => x.id === id)).reduce((t, id) => t + unit(id), 0)
  const left = MAX_UNITS - total
  const over = left < 0
  const carriedAll = COURSES.filter((c) => c.stage < profile.stage && c.sem === sem && !c.branches)
  const carried = carriedAll.filter((c) => chosen.has(c.id))
  const save = (n) => setState((s) => ({ plan: { ...s.plan, [sem]: [...n] } }))
  const toggle = (id) => { tap(); const n = new Set(chosen); n.has(id) ? n.delete(id) : n.add(id); save(n) }
  const Row = (c, kind) => {
    const on = chosen.has(c.id)
    const pre = before(c.id).filter((x) => chosen.has(x))
    return (
      <button key={c.id} className={`prow ${on ? 'on' : ''}`} style={{ '--h': courseHue(c.id) }} onClick={() => toggle(c.id)}>
        <span className="pbox">{on && <I n="check" size={16} />}</span>
        <span className="pm"><span className="t">{c.name}</span>
          <span className="m">{kind === 'carried' ? `محمّلة من ${STAGES.find((x) => x.id === c.stage)?.name}` : on ? 'راح تسجلها' : 'ما راح تسجلها هذا الفصل'}{pre.length ? <span className="tone-bad"> · متطلبها {courseById[pre[0]].name} بنفس الفصل</span> : null}</span></span>
        <span className="pu"><b>{c.ects}</b>وحدة</span>
      </button>
    )
  }
  return (
    <>
      <div className="seg">
        <button className={sem === 1 ? 'on' : ''} onClick={() => { tap(); setSem(1) }}>الفصل الأول</button>
        <button className={sem === 2 ? 'on' : ''} onClick={() => { tap(); setSem(2) }}>الفصل الثاني</button>
      </div>
      <div className={`ubar ${over ? 'over' : left === 0 ? 'full' : ''}`}>
        <div className="ut"><b>{total}</b><span>/ {MAX_UNITS} وحدة</span>
          <em>{over ? `زايد ${-left}، شيل مادة` : left === 0 ? 'مكتمل' : `باقي ${left}`}</em></div>
        <div className="ug"><i style={{ width: `${Math.min(100, (total / MAX_UNITS) * 100)}%` }} /></div>
      </div>
      <p className="small muted" style={{ margin: '0 4px 12px' }}>علّم المواد اللي راح تسجلها هذا الفصل. الحد {MAX_UNITS} وحدة، فإذا عندك مادة محمّلة لازم يبقى إلها مكان. اختياراتك تنعكس على المكتبة والرئيسية.</p>
      <div className="sec">مواد مرحلتك</div>
      <div className="stack">{mine.map((c) => Row(c))}</div>
      <div className="sec">المواد المحمّلة</div>
      {carried.length > 0 && <div className="stack" style={{ marginBottom: 10 }}>{carried.map((c) => Row(c, 'carried'))}</div>}
      <button className="btn soft full" onClick={() => { tap(); setAdd(true) }}><I n="plus" size={18} />{carried.length ? 'أضف مادة محمّلة ثانية' : 'عندي مادة محمّلة، أضيفها'}</button>
      <Sheet open={add} onClose={() => setAdd(false)} title="اختر المادة المحمّلة">
        <p className="small muted" style={{ marginTop: 0 }}>مواد {sem === 1 ? 'الفصل الأول' : 'الفصل الثاني'} من المراحل السابقة. باقي عندك {Math.max(0, left)} وحدة.</p>
        <div className="stack">{carriedAll.map((c) => Row(c, 'carried'))}</div>
        <button className="btn ac full" style={{ marginTop: 12 }} onClick={() => setAdd(false)}>تم</button>
      </Sheet>
      <p className="small muted" style={{ marginTop: 14 }}>الوحدات من مخطط المتطلبات الرسمي 2023/2024. هذي خطة تساعدك قبل التسجيل، والتسجيل الرسمي يبقى من منظومة بولونيا.</p>
    </>
  )
}

export default function MapScreen({ focus, back, nav, tab: tab0 }) {
  const { profile, plan } = useStore()
  const [tab, setTab] = useState(tab0 || 'map')
  const [sel, setSel] = useState(focus || null)
  const mine = new Set(coursesFor(profile).map((c) => c.id))
  const blocked = sel ? blockedBy(sel) : []
  const pre = sel ? needs(sel) : []
  const [view, setView] = useState('stages')

  return (
    <div className="screen">
      <PrintFrame title="خريطة المواد والمتطلبات" />
      <Bar title="خريطة موادي" sub="شنو قبل كل مادة، وكم وحدة تسجل بالفصل" onBack={back}
        end={<button className="iconbtn no-print" onClick={() => print()} aria-label="طباعة"><I n="print" size={20} /></button>} />

      <div className="tabs no-print">
        <button className={tab === 'map' ? 'on' : ''} onClick={() => { tap(); setTab('map') }}>تسلسل المواد</button>
        <button className={tab === 'plan' ? 'on' : ''} onClick={() => { tap(); setTab('plan') }}>خطة تسجيلي (الوحدات)</button>
      </div>

      {tab === 'plan' ? <Plan profile={profile} plan={plan} nav={nav} /> : <>
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

      <div className="seg no-print" style={{ marginBottom: 12 }}>
        <button className={view === 'stages' ? 'on' : ''} onClick={() => { tap(); setView('stages') }}><I n="route" size={16} />حسب المرحلة</button>
        <button className={view === 'chains' ? 'on' : ''} onClick={() => { tap(); setView('chains') }}><I n="sheet" size={16} />سلاسل</button>
      </div>
      {!sel && <p className="small muted" style={{ margin: '0 4px 12px' }}>اضغط أي مادة حتى نلوّنلك شنو لازم تعبر قبلها وشنو يتعطل إذا رسبت بيها.</p>}
      {sel && <div className="legend"><span className="lg pre">لازم قبلها</span><span className="lg me">المادة</span><span className="lg post">تتعطل إذا رسبت</span><button className="btn soft sm" onClick={() => setSel(null)}>مسح</button></div>}

      {view === 'stages' ? (
        <div className="stack stagger">
          {BY_STAGE.map(({ st, sems }) => (
            <div key={st.id} className={`rmap ${profile.stage === st.id ? 'cur' : ''}`}>
              <div className="rh"><span className="rs">{st.id}</span>{st.name}{profile.stage === st.id && <span className="pill gold" style={{ fontSize: 11 }}>مرحلتك</span>}</div>
              <div className="rcols">
                {sems.map((cs, k) => (
                  <div key={k} className="rcol">
                    <div className="rsem">الفصل {k ? 'الثاني' : 'الأول'}</div>
                    {cs.map((c) => {
                      const st2 = sel ? (sel === c.id ? 'me' : pre.includes(c.id) ? 'pre' : blocked.includes(c.id) ? 'post' : 'dim') : ''
                      const opens = after(c.id).length
                      return (
                        <button key={c.id} className={`rn ${st2} ${mine.has(c.id) ? 'mine' : ''}`} onClick={() => { tap(); setSel(sel === c.id ? null : c.id) }}>
                          <span className="t">{c.name}</span>
                          <span className="m"><b>{c.ects}</b> وحدات{opens ? ` · تفتح ${opens}` : ''}</span>
                        </button>
                      )
                    })}
                    {!cs.length && <div className="small muted" style={{ padding: 6 }}>—</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
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
      )}
      <p className="small muted" style={{ marginTop: 14 }}>
        <span style={{ boxShadow: 'inset 0 -3px 0 var(--gold)', padding: '0 4px' }}>الخط الذهبي</span> = مادة من مرحلتك الحالية. الرقم الأصفر = عدد وحدات المادة. المصدر: مخطط المتطلبات لبكالوريوس الهندسة المدنية 2023/2024.
      </p>
      </>}
    </div>
  )
}
