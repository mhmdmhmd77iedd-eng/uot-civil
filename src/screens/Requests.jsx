import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { COURSES, courseById, FILE_TYPES, coursesFor } from '../data/catalog'
import { useAcct, isStaff, fetchRequests, addRequest, voteRequest, deleteRequest, setRequestDone } from '../lib/sb'
import { exportRequests } from '../lib/excel'
import { courseHue } from '../lib/look'
import { I } from '../components/icons'
import { Bar, Sheet, Empty, tap, useToast } from '../components/ui'

const typeOf = (id) => FILE_TYPES.find((t) => t.id === id) || FILE_TYPES[0]

// الطلبات مشتركة: كل الطلاب يشوفونها ويصوّتون، والمشرف لما يرفع الملف الطلب يتعلّم «تم التوفير» وحده
export default function Requests({ course, type, back, nav }) {
  const s = useStore()
  const a = useAcct()
  const toast = useToast()
  const staff = isStaff(a)
  const [open, setOpen] = useState(!!course)
  const [f, setF] = useState({ course: course || '', type: type || 'past', note: '' })
  const [tab, setTab] = useState('open')
  const [mineOnly, setMineOnly] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => { fetchRequests() }, [a.user?.id])
  const all = s.srvRequests || []
  const myStage = new Set(coursesFor(s.profile).map((c) => c.id))
  const list = all.filter((r) => (tab === 'open' ? !r.done : r.done)).filter((r) => !mineOnly || r.mine || r.own)
    .sort((x, y) => (myStage.has(y.course) - myStage.has(x.course)) || (y.votes - x.votes))
  const openN = all.filter((r) => !r.done).length

  async function add() {
    if (!a.user) { toast('سجّل دخولك من «حسابي» حتى تطلب'); return }
    tap(); setBusy(true)
    const e = await addRequest({ ...f, note: f.note.trim() })
    setBusy(false)
    if (e && e !== 'voted') return toast('ما انرسل، تأكد من النت')
    toast(e === 'voted' ? 'نفس الطلب موجود، انضاف صوتك له' : 'انرسل طلبك، ونبلغك أول ما ينرفع')
    setOpen(false); setF({ course: '', type: 'past', note: '' })
  }
  async function vote(r) {
    if (!a.user) return toast('سجّل دخولك حتى تصوّت')
    tap(); await voteRequest(r)
  }
  async function del(r) {
    if (!confirm('تمسح هذا الطلب؟')) return
    const e = await deleteRequest(r.id); toast(e ? 'ما انمسح' : 'انمسح الطلب')
  }

  return (
    <div className="screen">
      <Bar title="الطلبات" sub="ناقصك ملف؟ اطلبه، والأكثر طلباً يتوفّر أول" onBack={back}
        end={staff && all.length > 0 ? <button className="iconbtn" aria-label="تصدير إكسل" onClick={() => exportRequests(all.map((r) => ({ ...r, course: courseById[r.course]?.name, type: typeOf(r.type).name }))).then(() => toast('انحفظ الإكسل'))}><I n="sheet" size={20} /></button> : null} />

      <button className="btn ac full" onClick={() => { tap(); setOpen(true) }}><I n="plus" size={19} />اطلب ملف</button>

      <div className="seg" style={{ marginTop: 14 }}>
        <button className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>بانتظار التوفير{openN ? ` (${openN})` : ''}</button>
        <button className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>تم التوفير</button>
      </div>
      {a.user && <div className="chips" style={{ marginBottom: 12 }}><button className={`chip ${mineOnly ? 'on' : ''}`} onClick={() => setMineOnly(!mineOnly)}><I n="user" size={15} />طلباتي بس</button></div>}

      <div className="stack stagger" key={tab + mineOnly}>
        {list.map((r) => {
          const c = courseById[r.course]
          const t = typeOf(r.type)
          return (
            <div key={r.id} className={`req ${r.done ? 'done' : ''}`} style={{ '--h': courseHue(r.course) }}>
              <button className={`vote ${r.mine ? 'on' : ''}`} onClick={() => vote(r)} disabled={r.done} aria-label="أنا هم أحتاجه">
                <I n="arrow" size={15} style={{ transform: 'rotate(90deg)' }} /><b>{r.votes}</b>
              </button>
              <button className="req-b" onClick={() => nav('course', { id: r.course, type: r.type })}>
                <span className="t">{t.name} · {c?.name || r.course}</span>
                <span className="m">{r.note || 'بدون تفاصيل'} · {r.done ? `توفّر ${r.doneAt || ''}` : r.at}</span>
                {r.done && <span className="pill ok" style={{ marginTop: 4 }}><I n="done" size={13} />انرفع، افتحه من المادة</span>}
              </button>
              <div className="req-x">
                {staff && <button className="btn soft sm" onClick={async () => { tap(); await setRequestDone(r.id, !r.done); toast(r.done ? 'رجع للانتظار' : 'تعلّم تم التوفير') }}>{r.done ? 'إرجاع' : <><I n="check" size={15} />تم</>}</button>}
                {(r.own || staff) && <button className="iconbtn sm" onClick={() => del(r)} aria-label="مسح"><I n="trash" size={16} /></button>}
              </div>
            </div>
          )
        })}
      </div>
      {!list.length && <Empty e={tab === 'open' ? 'ask' : 'done'} t={tab === 'open' ? 'ماكو طلبات بانتظار التوفير' : 'ما انوفر شي بعد'} />}
      <p className="small muted" style={{ margin: '14px 4px 0' }}>لما المشرف يرفع ملف لنفس المادة ونفس النوع، الطلب ينتقل لـ«تم التوفير» تلقائياً.</p>

      <Sheet open={open} onClose={() => setOpen(false)} title="طلب ملف">
        <label className="field"><span>المادة</span>
          <select className="input" value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })}>
            <option value="">اختر المادة</option>
            <optgroup label="مواد مرحلتي">{COURSES.filter((c) => myStage.has(c.id)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
            <optgroup label="مواد ثانية">{COURSES.filter((c) => !myStage.has(c.id)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
          </select>
        </label>
        <div className="field"><span>شنو تحتاج؟</span>
          <div className="chips">{FILE_TYPES.map((t) => <button key={t.id} className={`chip ${f.type === t.id ? 'on' : ''}`} onClick={() => setF({ ...f, type: t.id })}><I n={t.icon} size={16} />{t.name}</button>)}</div>
        </div>
        <label className="field"><span>تفاصيل (اختياري)</span>
          <input className="input" value={f.note} maxLength={120} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="مثلاً: أسئلة 2023 دور ثاني" />
        </label>
        <button className="btn ac full" disabled={!f.course || busy} onClick={add}>{busy ? 'لحظة…' : 'إرسال الطلب'}</button>
      </Sheet>
    </div>
  )
}
