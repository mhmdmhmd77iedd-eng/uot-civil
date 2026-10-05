import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { useAcct, isStaff, isOwner, pendingMembers, decide, makeRep, makeSupervisor, resetUserPassword, publishClasses, postAnnouncement, syncSection } from '../lib/sb'
import { label } from '../lib/profile'
import { I } from '../components/icons'
import { Bar, Empty, Sheet, tap, useToast } from '../components/ui'

// لوحة الممثل: قبول الطلاب، نشر الجدول، إعلان للشعبة
export default function RepPanel({ back, nav }) {
  const a = useAcct()
  const s = useStore()
  const toast = useToast()
  const [list, setList] = useState(null)
  const [ann, setAnn] = useState(false)
  const [f, setF] = useState({ title: '', body: '', urgent: false, general: false })
  const [busy, setBusy] = useState(false)
  const [rp, setRp] = useState({ email: '', pass: '' })
  const load = () => pendingMembers().then(setList).catch(() => setList([]))
  useEffect(() => { if (a.section) load() }, [a.section?.id])

  if (!a.section) return <div className="screen"><Bar title="إدارة شعبتي" onBack={back} /><Empty e="shield" t="سجّل دخولك واختر شعبتك أولاً" /></div>
  const pending = (list || []).filter((m) => m.status === 'pending')
  const approved = (list || []).filter((m) => m.status === 'approved')
  const myClasses = s.classes.length

  async function act(fn, ok) { tap(); setBusy(true); const e = await fn(); setBusy(false); if (e) toast('ما نجحت العملية. تأكد من صلاحيتك'); else { toast(ok); load() } }

  return (
    <div className="screen">
      <Bar title="إدارة شعبتي" sub={`${label(s.profile)} · شعبة ${a.section.letter}`} onBack={back} />

      <div className="sec">طلبات الانضمام {pending.length ? `(${pending.length})` : ''}</div>
      <div className="stack">
        {pending.map((m) => (
          <div key={m.user_id} className="row" style={{ cursor: 'default' }}>
            <span className="ic"><I n="user" /></span>
            <div style={{ minWidth: 0 }}><div className="t">{m.name}</div><div className="m">طلب بتاريخ {m.created_at?.slice(0, 10)}</div></div>
            <div style={{ display: 'flex', gap: 6, marginInlineStart: 'auto' }}>
              <button className="btn ac sm" disabled={busy} onClick={() => act(() => decide(m.user_id, 'approved'), 'انقبل')}>قبول</button>
              <button className="btn ghost sm" disabled={busy} onClick={() => act(() => decide(m.user_id, 'rejected'), 'انرفض')}>رفض</button>
            </div>
          </div>
        ))}
      </div>
      {list && !pending.length && <p className="small muted" style={{ margin: '0 4px' }}>ماكو طلبات جديدة. اقبل بس الطلاب اللي تعرفهم من شعبتك.</p>}
      {!list && <div className="sk" style={{ height: 64 }} />}

      <div className="sec">الجدول والمواعيد</div>
      <div className="card" style={{ display: 'grid', gap: 10 }}>
        <div className="small">اكتب الجدول بصفحة «جدولي» مثل أي طالب، وبعدها اضغط نشر حتى يوصل لكل شعبتك ({myClasses} محاضرة حالياً). الكوزات والتقارير: لما تضيفها فعّل «انشرها لكل الشعبة».</div>
        <div className="grid2">
          <button className="btn soft sm" onClick={() => nav('schedule')}><I n="week" size={17} />افتح جدولي</button>
          <button className="btn ac sm" disabled={busy || !myClasses} onClick={() => act(publishClasses, 'انشر الجدول لكل الشعبة')}><I n="upload" size={17} />انشر الجدول</button>
        </div>
      </div>

      <div className="sec">إعلان</div>
      <button className="btn ac full" onClick={() => setAnn(true)}><I n="megaphone" size={19} />إعلان جديد لشعبتي</button>

      {approved.length > 0 && (
        <>
          <div className="sec">طلاب الشعبة ({approved.length})</div>
          <div className="stack">
            {approved.map((m) => (
              <div key={m.user_id} className="row" style={{ cursor: 'default', padding: '10px 12px' }}>
                <span className="ic" style={{ width: 34, height: 34 }}><I n="user" size={18} /></span>
                <div className="t" style={{ minWidth: 0 }}>{m.name}</div>
                {isStaff(a) && <button className="btn soft sm" style={{ marginInlineStart: 'auto' }} disabled={busy} onClick={() => act(() => makeRep(m.user_id), 'صار ممثل للشعبة')}>اجعله ممثل</button>}
                {isOwner(a) && <button className="btn ghost sm" disabled={busy} onClick={() => act(() => makeSupervisor(m.user_id), 'صار مشرف')}>مشرف</button>}
              </div>
            ))}
          </div>
        </>
      )}
      {isStaff(a) && (
        <>
          <div className="sec">طالب نسى كلمة السر</div>
          <div className="card" style={{ display: 'grid', gap: 10 }}>
            <div className="small muted">تأكد إنه صاحب الحساب فعلاً (مثلاً يراسلك من رقمه)، بعدين اكتب إيميله وكلمة سر جديدة ودزها إله.</div>
            <input className="input" type="email" dir="ltr" placeholder="إيميل الطالب" value={rp.email} onChange={(e) => setRp({ ...rp, email: e.target.value })} />
            <input className="input" dir="ltr" placeholder="كلمة السر الجديدة (6 أو أكثر)" value={rp.pass} onChange={(e) => setRp({ ...rp, pass: e.target.value })} />
            <button className="btn soft sm" disabled={busy || !rp.email.includes('@') || rp.pass.length < 6} onClick={async () => { tap(); setBusy(true); const e = await resetUserPassword(rp.email, rp.pass); setBusy(false); toast(e || 'تغيّرت كلمة السر'); if (!e) setRp({ email: '', pass: '' }) }}>غيّر كلمة السر</button>
          </div>
        </>
      )}
      <button className="btn ghost full" style={{ marginTop: 16 }} onClick={() => { tap(); syncSection().then(load); toast('تحدّثت') }}><I n="history" size={18} />تحديث</button>

      <Sheet open={ann} onClose={() => setAnn(false)} title="إعلان جديد">
        <label className="field"><span>العنوان</span><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="مثلاً: تغيير قاعة محاضرة الطرق" /></label>
        <label className="field"><span>النص</span><textarea className="input" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
        <div className="chips" style={{ marginBottom: 14 }}>
          <button className={`chip ${f.urgent ? 'on' : ''}`} onClick={() => setF({ ...f, urgent: !f.urgent })}><I n="bell" size={15} />عاجل</button>
          {isStaff(a) && <button className={`chip ${f.general ? 'on' : ''}`} onClick={() => setF({ ...f, general: !f.general })}>لكل طلاب القسم</button>}
        </div>
        <button className="btn ac full" disabled={busy || !f.title.trim() || !f.body.trim()} onClick={async () => { setBusy(true); const e = await postAnnouncement({ ...f, title: f.title.trim(), body: f.body.trim() }); setBusy(false); if (e) toast('ما انشر، تأكد من صلاحيتك'); else { setAnn(false); setF({ title: '', body: '', urgent: false, general: false }); toast('انشر الإعلان') } }}>نشر</button>
      </Sheet>
    </div>
  )
}
