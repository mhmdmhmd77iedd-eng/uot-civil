import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { semCourses } from '../data/catalog'
import { calc, STATUS_TEXT, RULES } from '../lib/grade'
import { exportGrades } from '../lib/excel'
import { label } from '../lib/profile'
import { I } from '../components/icons'
import { Bar, PrintFrame, tap, useToast } from '../components/ui'

function Slider({ name, value, max, onChange }) {
  return (
    <label className="field" style={{ marginBottom: 10 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>{name}<b style={{ fontVariantNumeric: 'tabular-nums' }}>{value} / {max}</b></span>
      <input type="range" min="0" max={max} step="0.5" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

function GradeCard({ c, g, abs, onSet, nav }) {
  const has = g.saee != null && g.saee !== ''
  const r = has ? calc({ saee: g.saee, mid: g.mid }) : null
  const tone = r ? STATUS_TEXT[r.status].tone : null
  const bad = r && (r.status === 'blocked' || r.status === 'impossible')
  return (
    <div className={`gcard ${tone ? 't-' + tone : ''}`} style={{ '--c': tone ? `var(--${tone})` : 'var(--ln)' }}>
      <button className="gh" onClick={() => nav('course', { id: c.id })}>
        <span className="t">{c.name}{c.carried && <span className="tg w" style={{ marginInlineStart: 6 }}>محمّلة</span>}</span>
        <I n="chev" size={16} className="chev" />
      </button>
      <div className="gb">
        <label><span>السعي /40</span><input className="input" inputMode="decimal" placeholder="—" value={g.saee ?? ''} onChange={(e) => onSet('saee', e.target.value.replace(/[^\d.]/g, '').slice(0, 4))} /></label>
        <label><span>المد /10</span><input className="input" inputMode="decimal" placeholder="—" value={g.mid ?? ''} onChange={(e) => onSet('mid', e.target.value.replace(/[^\d.]/g, '').slice(0, 4))} /></label>
        <div className="gr">
          {r ? <><b>{bad ? '!' : r.need}</b><span>{r.status === 'blocked' ? 'سعي أقل من 14' : r.need === 0 ? 'ناجح قبل النهائي' : 'تحتاج بالنهائي'}</span></> : <span className="muted">اكتب سعيك</span>}
        </div>
      </div>
      {abs > 0 && <div className="small muted" style={{ padding: '0 14px 10px' }}>{abs} غياب مسجّل</div>}
    </div>
  )
}

export default function Calc({ back, nav }) {
  const { profile, grades, absences, plan } = useStore()
  const toast = useToast()
  const [round, setRound] = useState(1)
  const [quick, setQuick] = useState(false)
  const [q, setQ] = useState({ saee: 22, mid: 6 })
  const r = calc({ ...q, round })
  const st = STATUS_TEXT[r.status]
  const courses = [...semCourses(profile, plan, 1), ...semCourses(profile, plan, 2)]
  const RISK = { blocked: 0, impossible: 0, hard: 1, work: 2, easy: 3, safe: 4 }
  const rs = courses.map((c) => { const g = grades[c.id] || {}; return g.saee != null && g.saee !== '' ? RISK[calc({ saee: g.saee, mid: g.mid }).status] : null })
  const risky = rs.filter((x) => x != null && x <= 1).length
  const safe = rs.filter((x) => x != null && x >= 3).length
  const empty = rs.filter((x) => x == null).length
  const setG = (id, k, v) => setState((s) => ({ grades: { ...s.grades, [id]: { ...(s.grades[id] || {}), [k]: v } } }))

  async function xls() {
    tap()
    const rows = courses.filter((c) => grades[c.id]).map((c) => ({ name: c.name, saee: grades[c.id].saee, mid: grades[c.id].mid }))
    if (!rows.length) return toast('اكتب درجات مادة وحدة على الأقل')
    try { await exportGrades(rows, label(profile)); toast('انحفظ ملف الإكسل') } catch { toast('ما قدرنا ننشئ الملف') }
  }

  return (
    <div className="screen">
      <PrintFrame title="درجاتي وحاسبة السعي" />
      <Bar title="وضعي بالمواد" sub="اكتب سعيك ومدّك، ونگلك شكد تحتاج بالنهائي" onBack={back} />

      <div className="stat" style={{ marginBottom: 14 }}>
        <div><b style={{ color: 'var(--bad)' }}>{risky}</b>تحتاج تركيز</div>
        <div><b style={{ color: 'var(--good)' }}>{safe}</b>بأمان</div>
        <div><b>{empty}</b>بدون درجات</div>
      </div>

      {[1, 2].map((sm) => {
        const cs = courses.filter((c) => c.sem === sm)
        if (!cs.length) return null
        return (
          <div key={sm}>
            <div className="sec">الفصل {sm === 1 ? 'الأول' : 'الثاني'}</div>
            <div className="stack">{cs.map((c) => <GradeCard key={c.id} c={c} g={grades[c.id] || {}} abs={absences[c.id] || 0} nav={nav} onSet={(k, v) => setG(c.id, k, v)} />)}</div>
          </div>
        )
      })}
      <p className="small muted" style={{ margin: '10px 4px 0' }}>النجاح 50 من 100: سعي 40 + مد 10 + نهائي 50، ولازم سعيك 14 أو أكثر حتى تدخل النهائي. لما الدكتور أو الممثل يرفع الدرجات تنملي هنا وحدها.</p>

      <button className="linkrow no-print" onClick={() => { tap(); setQuick(!quick) }}><I n="calc" size={17} />{quick ? 'إخفاء الحاسبة السريعة' : 'حاسبة سريعة: جرّب أرقام بدون ما تحفظها'}</button>
      {quick && (
        <div className="card no-print" style={{ animation: 'up .35s var(--ease)' }}>
          <div className="seg">
            <button className={round === 1 ? 'on' : ''} onClick={() => setRound(1)}>الدور الأول</button>
            <button className={round === 2 ? 'on' : ''} onClick={() => setRound(2)}>الدور الثاني</button>
          </div>
          <Slider name="السعي" value={q.saee} max={RULES.saeeMax} onChange={(v) => setQ({ ...q, saee: v })} />
          <Slider name="المد" value={q.mid} max={RULES.midMax} onChange={(v) => setQ({ ...q, mid: v })} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div className="small muted">تحتاج بالنهائي</div>
              <div className={`big tone-${st.tone}`}>{r.status === 'blocked' ? '—' : r.need}<span style={{ fontSize: 18, color: 'var(--mu)' }}> / 50</span></div>
            </div>
            <div className="small muted" style={{ textAlign: 'left' }}>{round === 2 ? 'السعي + المد' : 'قبل النهائي'}<br /><b style={{ color: 'var(--tx)', fontSize: 16 }}>{r.before} / 50</b></div>
          </div>
          <div className={`small tone-${st.tone}`} style={{ marginTop: 10, fontWeight: 600 }}>{st.t}</div>
          {round === 2 && <div className="small muted" style={{ marginTop: 6 }}>بالدور الثاني درجة المد تنضم للسعي فيصير من 50، وما يطبق حد الـ14.</div>}
        </div>
      )}

      <div className="grid2 no-print" style={{ marginTop: 14 }}>
        <button className="btn soft" onClick={xls}><I n="sheet" size={19} />تصدير إكسل</button>
        <button className="btn soft" onClick={() => { tap(); print() }}><I n="print" size={19} />طباعة / PDF</button>
      </div>
      <p className="small muted center">درجاتك تنحفظ على جهازك، وما يشوفها أحد غيرك.</p>
    </div>
  )
}
