import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { coursesFor } from '../data/catalog'
import { calc, STATUS_TEXT, RULES } from '../lib/grade'
import { exportGrades } from '../lib/excel'
import { label } from '../lib/profile'
import { Bar, PrintFrame, tap, useToast } from '../components/ui'

function Slider({ name, value, max, onChange }) {
  return (
    <label className="field" style={{ marginBottom: 10 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>{name}<b style={{ fontVariantNumeric: 'tabular-nums' }}>{value} / {max}</b></span>
      <input type="range" min="0" max={max} step="0.5" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

export default function Calc({ back }) {
  const { profile, grades } = useStore()
  const toast = useToast()
  const [round, setRound] = useState(1)
  const [q, setQ] = useState({ saee: 22, mid: 6 })
  const r = calc({ ...q, round })
  const st = STATUS_TEXT[r.status]
  const courses = coursesFor(profile)
  const setG = (id, k, v) => setState((s) => ({ grades: { ...s.grades, [id]: { ...(s.grades[id] || {}), [k]: v } } }))

  async function xls() {
    tap()
    const rows = courses.filter((c) => grades[c.id]).map((c) => ({ name: c.name, saee: grades[c.id].saee, mid: grades[c.id].mid }))
    if (!rows.length) return toast('اكتب درجات مادة وحدة على الأقل')
    try { await exportGrades(rows, label(profile)); toast('انحفظ ملف الإكسل ✓') } catch { toast('ما قدرنا ننشئ الملف') }
  }

  return (
    <div className="screen">
      <PrintFrame title="درجاتي وحاسبة السعي" />
      <Bar title="حاسبة السعي" sub="حسب نظام بولونيا: سعي 40 + مد 10 + نهائي 50" onBack={back} />

      <div className="tabs no-print">
        <button className={round === 1 ? 'on' : ''} onClick={() => setRound(1)}>الدور الأول</button>
        <button className={round === 2 ? 'on' : ''} onClick={() => setRound(2)}>الدور الثاني</button>
      </div>

      <div className="card no-print">
        <Slider name="السعي" value={q.saee} max={RULES.saeeMax} onChange={(v) => setQ({ ...q, saee: v })} />
        <Slider name="المد" value={q.mid} max={RULES.midMax} onChange={(v) => setQ({ ...q, mid: v })} />
        <div className="meter" style={{ margin: '6px 0 16px' }}><i style={{ width: `${(r.before / 50) * 100}%` }} /></div>
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

      <div className="sec">درجاتي بكل مادة</div>
      <div className="stack">
        {courses.map((c) => {
          const g = grades[c.id] || {}
          const rr = calc({ saee: g.saee, mid: g.mid })
          const has = g.saee != null && g.saee !== ''
          return (
            <div key={c.id} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <b style={{ fontSize: 14 }}>{c.name}</b>
                {has && <span className={`pill ${rr.status === 'blocked' || rr.status === 'impossible' ? 'urgent' : ''}`}>{rr.status === 'blocked' ? 'أقل من 14' : `تحتاج ${rr.need}`}</span>}
              </div>
              <div className="grid2" style={{ marginTop: 8 }}>
                <input className="input" inputMode="decimal" placeholder="السعي /40" value={g.saee ?? ''} onChange={(e) => setG(c.id, 'saee', e.target.value.replace(/[^\d.]/g, '').slice(0, 4))} />
                <input className="input" inputMode="decimal" placeholder="المد /10" value={g.mid ?? ''} onChange={(e) => setG(c.id, 'mid', e.target.value.replace(/[^\d.]/g, '').slice(0, 4))} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid2 no-print" style={{ marginTop: 14 }}>
        <button className="btn soft" onClick={xls}>📊 تصدير إكسل</button>
        <button className="btn soft" onClick={() => { tap(); print() }}>🖨️ طباعة / PDF</button>
      </div>
      <p className="small muted center">درجاتك تنحفظ على جهازك تلقائياً، وما يشوفها أحد غيرك.</p>
    </div>
  )
}
