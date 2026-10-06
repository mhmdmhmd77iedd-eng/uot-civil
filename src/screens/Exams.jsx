import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { useAcct, canPostExam, saveExam, deleteExam, fetchExams } from '../lib/sb'
import { coursesFor, courseById, COURSES, carriedIds, STAGES } from '../data/catalog'
import { label } from '../lib/profile'
import { dateLong, fmtTime, ymd } from '../lib/schedule'
import { courseHue } from '../lib/look'
import { I } from '../components/icons'
import { Bar, Empty, Sheet, tap, useToast } from '../components/ui'

export const EXAM_KINDS = ['نهائي', 'مد', 'كويز', 'عملي', 'دور ثاني']
const dayKey = (d) => ymd(new Date(d))
const inDays = (d, now = new Date()) => Math.round((new Date(ymd(new Date(d))) - new Date(ymd(now))) / 864e5)
const whenText = (n) => (n === 0 ? 'اليوم' : n === 1 ? 'باجر' : n === -1 ? 'أمس' : n > 0 ? `بعد ${n} يوم` : `قبل ${-n} يوم`)

function ExamForm({ init, profile, onDone }) {
  const toast = useToast()
  const d0 = init ? new Date(init.starts_at) : null
  const [f, setF] = useState(init ? { id: init.id, course: init.course_id, kind: init.kind, day: ymd(d0), time: d0.toTimeString().slice(0, 5), room: init.room || '', note: init.note || '', allBranches: !init.branch, bothShifts: !init.shift }
    : { course: '', kind: 'نهائي', day: ymd(new Date(Date.now() + 7 * 864e5)), time: '09:00', room: '', note: '', allBranches: profile.stage < 3, bothShifts: true })
  const [busy, setBusy] = useState(false)
  const mine = coursesFor(profile)
  async function save() {
    tap(); setBusy(true)
    const e = await saveExam({ ...f, date: `${f.day}T${f.time || '09:00'}` })
    setBusy(false)
    if (e) return toast('ما انحفظ. تأكد من صلاحيتك والنت')
    toast(init ? 'انحفظ التعديل' : 'انضاف للجدول، ويبين لكل الطلاب'); onDone()
  }
  return (
    <>
      <label className="field"><span>المادة</span>
        <select className="input" value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })}>
          <option value="">اختر المادة</option>
          <optgroup label="مواد المرحلة">{mine.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
          <optgroup label="مواد ثانية">{COURSES.filter((c) => !mine.includes(c)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
        </select>
      </label>
      <div className="field"><span>النوع</span><div className="chips">{EXAM_KINDS.map((k) => <button key={k} className={`chip ${f.kind === k ? 'on' : ''}`} onClick={() => setF({ ...f, kind: k })}>{k}</button>)}</div></div>
      <div className="grid2">
        <label className="field"><span>اليوم</span><input className="input" type="date" value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })} /></label>
        <label className="field"><span>الساعة</span><input className="input" type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></label>
      </div>
      <div className="grid2">
        <label className="field"><span>القاعة</span><input className="input" value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} placeholder="اختياري" /></label>
        <label className="field"><span>ملاحظة</span><input className="input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="مثلاً: فصل 1-4" /></label>
      </div>
      <div className="chips" style={{ marginBottom: 14 }}>
        {profile.stage >= 2 && <button className={`chip ${f.allBranches ? 'on' : ''}`} onClick={() => setF({ ...f, allBranches: !f.allBranches })}>لكل فروع المرحلة</button>}
        <button className={`chip ${f.bothShifts ? 'on' : ''}`} onClick={() => setF({ ...f, bothShifts: !f.bothShifts })}>صباحي ومسائي</button>
      </div>
      <button className="btn ac full" disabled={busy || !f.course || !f.day} onClick={save}>{busy ? 'لحظة…' : init ? 'حفظ' : 'إضافة للجدول'}</button>
      {init && <button className="btn danger full" style={{ marginTop: 10 }} onClick={async () => { if (!confirm('تحذف هذا الامتحان؟')) return; const e = await deleteExam(init.id); toast(e ? 'ما انحذف' : 'انحذف'); onDone() }}><I n="trash" size={18} />حذف</button>}
    </>
  )
}

export default function Exams({ back, nav }) {
  const s = useStore()
  const a = useAcct()
  const [tab, setTab] = useState('next')
  const [edit, setEdit] = useState(null)
  const can = canPostExam(a)
  const now = new Date()
  useEffect(() => { fetchExams() }, [])
  const all = (s.srvExams || []).map((e) => ({ ...e, n: inDays(e.starts_at, now) }))
  const list = all.filter((e) => (tab === 'next' ? e.n >= 0 : e.n < 0))
  if (tab === 'past') list.reverse()
  const groups = list.reduce((m, e) => ((m[dayKey(e.starts_at)] ||= []).push(e), m), {})
  const next = all.find((e) => e.n >= 0)
  // المواد المحمّلة: موعد امتحانها مع مرحلتها، وتنبيه إذا يتعارض مع امتحان من مرحلتي
  const car = carriedIds(s.profile, s.plan).map((id) => courseById[id]).filter(Boolean)
  const exOnly = new Set(s.plan?.examOnly || [])
  const clash = (e) => all.some((x) => x.id !== e.id && x.carried !== e.carried && Math.abs(new Date(x.starts_at) - new Date(e.starts_at)) < 3 * 36e5)
  const stName = (n) => STAGES.find((x) => x.id === n)?.name

  return (
    <div className="screen">
      <Bar title="جدول الامتحانات" sub={label(s.profile)} onBack={back}
        end={can ? <button className="iconbtn ac" onClick={() => { tap(); setEdit({ isNew: true }) }} aria-label="إضافة امتحان"><I n="plus" size={21} /></button> : null} />

      {next && tab === 'next' && (
        <button className="xnext" style={{ '--h': courseHue(next.course_id) }} onClick={() => nav('course', { id: next.course_id, type: 'past' })}>
          <div className="xn-d"><b>{next.n === 0 ? 'اليوم' : next.n}</b><span>{next.n === 0 ? fmtTime(new Date(next.starts_at).toTimeString().slice(0, 5)) : next.n === 1 ? 'يوم (باجر)' : 'يوم'}</span></div>
          <div style={{ minWidth: 0 }}>
            <div className="small" style={{ opacity: .85 }}>أقرب امتحان · {next.kind}</div>
            <div className="xn-t">{courseById[next.course_id]?.name || next.course_id}</div>
            <div className="small" style={{ opacity: .85 }}>{dateLong(new Date(next.starts_at))}{next.room ? ` · ${next.room}` : ''}</div>
          </div>
          <span className="xn-go"><I n="paper" size={16} />الأسئلة السابقة</span>
        </button>
      )}

      {car.length > 0 && tab === 'next' && (
        <div className="card xcar">
          <div className="xcar-h"><I n="flag" size={17} /><b>موادك المحمّلة</b><button className="btn ghost sm" onClick={() => nav('map', { tab: 'plan' })}>تعديل</button></div>
          {car.map((c) => {
            const e = all.find((x) => x.course_id === c.id && x.n >= 0)
            const att = s.plan?.attempts?.[c.id]
            return (
              <button key={c.id} className="xcar-r" onClick={() => nav('course', { id: c.id, type: 'past' })}>
                <span className="t">{c.name}<small>{exOnly.has(c.id) ? `امتحان فقط${att ? ` · الدور ${att} من 6` : ''}` : 'دوام وامتحان'} · مع {stName(c.stage)}</small></span>
                <span className={`pill ${e ? (e.n <= 3 ? 'urgent' : '') : 'off'}`}>{e ? `${dateLong(new Date(e.starts_at))} · ${fmtTime(new Date(e.starts_at).toTimeString().slice(0, 5))}` : 'ما انشر موعده بعد'}</span>
              </button>
            )
          })}
          <div className="small muted" style={{ marginTop: 6 }}>أول ما ينشر ممثل المرحلة السابقة موعد امتحان مادتك، يطلع هنا ويوصلك تنبيه قبل 3 أيام وقبل يوم وصباح الامتحان.</div>
        </div>
      )}

      <div className="seg">
        <button className={tab === 'next' ? 'on' : ''} onClick={() => { tap(); setTab('next') }}>القادمة{all.filter((e) => e.n >= 0).length ? ` (${all.filter((e) => e.n >= 0).length})` : ''}</button>
        <button className={tab === 'past' ? 'on' : ''} onClick={() => { tap(); setTab('past') }}>المنتهية</button>
      </div>

      <div className="stagger" key={tab}>
        {Object.entries(groups).map(([k, es]) => (
          <section key={k} className="xday">
            <div className="xday-h"><b>{dateLong(new Date(k))}</b><span className={`pill ${es[0].n <= 2 && es[0].n >= 0 ? 'urgent' : 'off'}`}>{whenText(es[0].n)}</span></div>
            {es.map((e) => {
              const c = courseById[e.course_id]
              return (
                <button key={e.id} className="xrow" style={{ '--h': courseHue(e.course_id) }} onClick={() => (can ? setEdit({ item: e }) : nav('course', { id: e.course_id, type: 'past' }))}>
                  <span className="xt">{fmtTime(new Date(e.starts_at).toTimeString().slice(0, 5))}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span className="t">{c?.name || e.course_id}</span>
                    <span className="m">{e.kind}{e.room ? ` · قاعة ${e.room}` : ''}{e.note ? ` · ${e.note}` : ''}</span>
                    {e.carried && <span className="tg w" style={{ marginTop: 3 }}>محمّلة · مع {stName(e.stage)}</span>}
                    {clash(e) && <span className="tg b" style={{ marginTop: 3, marginInlineStart: 4 }}><I n="warn" size={12} />قريب من امتحان ثاني، راجع القسم</span>}
                  </span>
                  <I n={can ? 'pencil' : 'chev'} size={17} className="chev" />
                </button>
              )
            })}
          </section>
        ))}
      </div>
      {!list.length && (
        <Empty e="calendar" t={tab === 'next' ? 'ما انشر جدول امتحانات لمرحلتك بعد' : 'ماكو امتحانات منتهية'}>
          {tab === 'next' && <div className="small" style={{ marginTop: 6 }}>{can ? 'أضف أول امتحان من زر + فوق.' : 'ممثل مرحلتك أو شعبتك ينشره هنا، ويوصلك تنبيه.'}</div>}
        </Empty>
      )}

      <details className="card xrules">
        <summary><I n="info" size={17} />تعليمات القاعة الامتحانية</summary>
        <ol>
          <li>انتبه لساعة بدء كل امتحان لأنها تتغير حسب اليوم، وكون بالقاعة قبل 10 دقايق على الأقل. ما يدخل المتأخر بعد بدء الامتحان وتوزيع الأسئلة.</li>
          <li>الامتحان حضوري. الموبايل وأي جهاز إلكتروني يتسلّم قبل الدخول، والحقائب ممنوعة داخل القاعة، والقسم مو مسؤول عن الحقيبة إذا ضاعت.</li>
          <li>إذا صارت عطلة رسمية بيوم امتحان، يتأجل امتحان ذاك اليوم لبعد آخر يوم بالجدول.</li>
          <li>الزي الرسمي والهوية الجامعية، وجيب أقلامك وحاسبتك وكل مستلزماتك.</li>
          <li>استعارة أي شي داخل القاعة ممنوعة نهائياً.</li>
        </ol>
        <div className="small muted">من تعليمات جدول امتحانات كلية الهندسة المدنية 2025-2026.</div>
      </details>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.isNew ? 'امتحان جديد' : 'تعديل الامتحان'}>
        {edit && <ExamForm init={edit.item} profile={s.profile} key={edit.item?.id || 'new'} onDone={() => setEdit(null)} />}
      </Sheet>
    </div>
  )
}
