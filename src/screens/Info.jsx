import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { DEFAULT_ANNOUNCEMENTS, DEFAULT_EXAMS, BOLOGNA_FAQ, BOLOGNA_NOTE } from '../data/content'
import { COURSES, courseById, STAGES } from '../data/catalog'
import { Bar, Sheet, Empty, tap, useToast } from '../components/ui'

export function News({ back }) {
  const s = useStore()
  const toast = useToast()
  const list = (s.announcements ?? DEFAULT_ANNOUNCEMENTS).filter((a) => !a.stage || a.stage === s.profile.stage)
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ title: '', body: '', urgent: false, stage: s.profile.stage })
  const like = (a) => { tap(); setState((st) => ({ likes: { ...st.likes, [a.id]: !st.likes[a.id] } })) }
  function post() {
    const a = { id: 'a' + Date.now().toString(36), ...f, title: f.title.trim(), body: f.body.trim(), at: new Date().toISOString().slice(0, 10) }
    setState((st) => ({ announcements: [a, ...(st.announcements ?? DEFAULT_ANNOUNCEMENTS)] }))
    setOpen(false); setF({ title: '', body: '', urgent: false, stage: s.profile.stage }); toast('انشر الإعلان ✓')
  }
  return (
    <div className="screen">
      <Bar title="الإعلانات" sub="إعلانات القسم ومرحلتك" onBack={back} />
      {s.admin && <button className="btn ac full" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>＋ إعلان جديد</button>}
      <div className="stack stagger">
        {list.map((a) => (
          <div key={a.id} className="card">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              {a.urgent && <span className="pill urgent">🔔 عاجل</span>}
              <span className="small muted">{a.at}</span>
            </div>
            <b style={{ fontSize: 15.5 }}>{a.title}</b>
            <p style={{ margin: '6px 0 10px', whiteSpace: 'pre-wrap', fontSize: 14 }}>{a.body}</p>
            <button className={`btn sm ${s.likes[a.id] ? 'ac' : 'ghost'}`} onClick={() => like(a)}>{s.likes[a.id] ? '❤️ أعجبني' : '🤍 أعجبني'}</button>
          </div>
        ))}
      </div>
      {!list.length && <Empty e="📣" t="ما أكو إعلانات حالياً" />}
      <Sheet open={open} onClose={() => setOpen(false)} title="إعلان جديد">
        <label className="field"><span>العنوان</span><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
        <label className="field"><span>النص</span><textarea className="input" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
        <div className="field"><span>لمن؟</span>
          <div className="chips">
            <button className={`chip ${!f.stage ? 'on' : ''}`} onClick={() => setF({ ...f, stage: 0 })}>كل المراحل</button>
            {STAGES.map((x) => <button key={x.id} className={`chip ${f.stage === x.id ? 'on' : ''}`} onClick={() => setF({ ...f, stage: x.id })}>{x.name}</button>)}
          </div>
        </div>
        <label className="chip" style={{ display: 'inline-flex', gap: 8, marginBottom: 14 }}><input type="checkbox" checked={f.urgent} onChange={(e) => setF({ ...f, urgent: e.target.checked })} /> عاجل (يرسل إشعار بعد ربط الخادم)</label>
        <button className="btn ac full" disabled={!f.title.trim() || !f.body.trim()} onClick={post}>نشر</button>
      </Sheet>
    </div>
  )
}

export function Bologna({ back }) {
  return (
    <div className="screen">
      <Bar title="دليل بولونيا" sub="أكثر الأسئلة تكراراً، بكلام بسيط" onBack={back} />
      <div className="demo">ℹ️<span>{BOLOGNA_NOTE}</span></div>
      <div className="stack stagger">
        {BOLOGNA_FAQ.map((x, i) => <details key={i} className="faq"><summary>{x.q}</summary><p>{x.a}</p></details>)}
      </div>
    </div>
  )
}

export function Exams({ back, nav }) {
  const s = useStore()
  const toast = useToast()
  const all = (s.exams ?? DEFAULT_EXAMS).filter((e) => e.stage === s.profile.stage).sort((a, b) => new Date(a.date) - new Date(b.date))
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ course: '', date: '', kind: 'نهائي' })
  const now = Date.now()
  function add() {
    const e = { id: 'e' + Date.now().toString(36), ...f, stage: courseById[f.course].stage }
    setState((st) => ({ exams: [...(st.exams ?? DEFAULT_EXAMS), e] }))
    setOpen(false); setF({ course: '', date: '', kind: 'نهائي' }); toast('انضاف للجدول ✓')
  }
  const del = (e) => setState((st) => ({ exams: (st.exams ?? DEFAULT_EXAMS).filter((x) => x.id !== e.id) }))
  return (
    <div className="screen">
      <Bar title="جدول الامتحانات" sub="مرحلتك" onBack={back} />
      {s.admin && <button className="btn ac full" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>＋ إضافة امتحان</button>}
      <div className="stack stagger">
        {all.map((e) => {
          const d = Math.ceil((new Date(e.date) - now) / 864e5)
          const past = d < 0
          return (
            <div key={e.id} className="row" style={{ opacity: past ? .55 : 1 }} onClick={() => nav('course', { id: e.course })}>
              <span className="ic" style={{ flexDirection: 'column', lineHeight: 1.1, fontSize: 13 }}><b style={{ fontSize: 16 }}>{new Date(e.date).getDate()}</b>{new Date(e.date).toLocaleDateString('ar-IQ', { month: 'short' })}</span>
              <div><div className="t">{courseById[e.course]?.name}</div><div className="m">{e.kind} · {new Date(e.date).toLocaleDateString('ar-IQ', { weekday: 'long' })}</div></div>
              <span className="end">{past ? 'انتهى' : d === 0 ? 'اليوم' : `بعد ${d} يوم`}</span>
              {s.admin && <button className="btn danger sm" onClick={(ev) => { ev.stopPropagation(); del(e) }}>حذف</button>}
            </div>
          )
        })}
      </div>
      {!all.length && <Empty e="📅" t="ما انشر جدول الامتحانات بعد" />}
      <Sheet open={open} onClose={() => setOpen(false)} title="إضافة امتحان">
        <label className="field"><span>المادة</span>
          <select className="input" value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })}>
            <option value="">اختر</option>{COURSES.map((c) => <option key={c.id} value={c.id}>{c.name} (م{c.stage})</option>)}
          </select>
        </label>
        <label className="field"><span>الموعد</span><input className="input" type="datetime-local" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
        <div className="field"><span>النوع</span><div className="chips">{['نهائي', 'مد', 'كويز'].map((x) => <button key={x} className={`chip ${f.kind === x ? 'on' : ''}`} onClick={() => setF({ ...f, kind: x })}>{x}</button>)}</div></div>
        <button className="btn ac full" disabled={!f.course || !f.date} onClick={add}>إضافة</button>
      </Sheet>
    </div>
  )
}
