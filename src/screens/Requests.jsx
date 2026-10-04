import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { COURSES, courseById, FILE_TYPES } from '../data/catalog'
import { exportRequests } from '../lib/excel'
import { Bar, Sheet, Empty, tap, useToast } from '../components/ui'

export default function Requests({ course, type, back, nav }) {
  const { requests, admin, profile } = useStore()
  const toast = useToast()
  const [open, setOpen] = useState(!!course)
  const [f, setF] = useState({ course: course || '', type: type || 'past', note: '' })
  const [tab, setTab] = useState('open')
  const list = requests.filter((r) => (tab === 'open' ? !r.done : r.done)).sort((a, b) => b.votes - a.votes)

  function add() {
    tap()
    const same = requests.find((r) => !r.done && r.course === f.course && r.type === f.type)
    if (same) {
      if (!same.mine) setState((s) => ({ requests: s.requests.map((r) => (r === same ? { ...r, votes: r.votes + 1, mine: true } : r)) }))
      toast('نفس الطلب موجود، انضاف صوتك له')
    } else {
      setState((s) => ({ requests: [{ id: 'r' + Date.now().toString(36), ...f, note: f.note.trim(), votes: 1, mine: true, done: false, at: new Date().toISOString().slice(0, 10) }, ...s.requests] }))
      toast('انرسل طلبك ✓')
    }
    setOpen(false)
    setF({ course: '', type: 'past', note: '' })
  }
  const vote = (r) => { tap(); setState((s) => ({ requests: s.requests.map((x) => (x.id === r.id ? { ...x, votes: x.votes + (x.mine ? -1 : 1), mine: !x.mine } : x)) })) }
  const done = (r) => { tap(); setState((s) => ({ requests: s.requests.map((x) => (x.id === r.id ? { ...x, done: !x.done } : x)) })) }

  return (
    <div className="screen">
      <Bar title="الطلبات" sub="ناقصك ملف؟ اطلبه، والمشرفين يشوفون الأكثر طلباً أولاً" onBack={back}
        end={admin && requests.length > 0 ? <button className="iconbtn" aria-label="تصدير إكسل" onClick={() => exportRequests(requests.map((r) => ({ ...r, course: courseById[r.course]?.name, type: FILE_TYPES.find((t) => t.id === r.type)?.name }))).then(() => toast('انحفظ الإكسل ✓'))}>📊</button> : null} />
      <button className="btn ac full" onClick={() => { tap(); setOpen(true) }}>＋ طلب ملف</button>
      <div className="tabs" style={{ marginTop: 14 }}>
        <button className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>بانتظار التوفير</button>
        <button className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>تم التوفير</button>
      </div>
      <div className="stack stagger" key={tab}>
        {list.map((r) => (
          <div key={r.id} className="row" style={{ cursor: 'default' }}>
            <button onClick={() => vote(r)} className="ic" style={{ border: 'none', cursor: 'pointer', flexDirection: 'column', lineHeight: 1.1, background: r.mine ? 'var(--ac)' : 'var(--acs)', color: r.mine ? '#fff' : 'var(--ac)' }} aria-label="أنا هم أحتاجه">
              <span style={{ fontSize: 11 }}>▲</span><span style={{ fontSize: 14 }}>{r.votes}</span>
            </button>
            <div style={{ minWidth: 0, flex: 1 }} onClick={() => nav('course', { id: r.course })}>
              <div className="t">{FILE_TYPES.find((t) => t.id === r.type)?.name} · {courseById[r.course]?.name}</div>
              <div className="m">{r.note || 'بدون تفاصيل'} · {r.at}</div>
            </div>
            {admin && <button className="btn soft sm" onClick={() => done(r)}>{r.done ? 'إرجاع' : 'تم ✓'}</button>}
          </div>
        ))}
      </div>
      {!list.length && <Empty e={tab === 'open' ? '🙋' : '✅'} t={tab === 'open' ? 'ما أكو طلبات حالياً' : 'ما انوفر شي بعد'} />}

      <Sheet open={open} onClose={() => setOpen(false)} title="طلب ملف">
        <label className="field"><span>المادة</span>
          <select className="input" value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })}>
            <option value="">اختر المادة</option>
            {COURSES.filter((c) => c.stage === profile.stage).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <optgroup label="مراحل ثانية">{COURSES.filter((c) => c.stage !== profile.stage).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
          </select>
        </label>
        <div className="field"><span>النوع</span>
          <div className="chips">{FILE_TYPES.map((t) => <button key={t.id} className={`chip ${f.type === t.id ? 'on' : ''}`} onClick={() => setF({ ...f, type: t.id })}>{t.icon} {t.name}</button>)}</div>
        </div>
        <label className="field"><span>تفاصيل (اختياري)</span>
          <input className="input" value={f.note} maxLength={120} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="مثلاً: أسئلة 2023 دور ثاني" />
        </label>
        <button className="btn ac full" disabled={!f.course} onClick={add}>إرسال الطلب</button>
      </Sheet>
    </div>
  )
}
