import { chime } from '../lib/sound'
import { useEffect, useState } from 'react'
import { useStore, setState } from '../lib/store'
import { COURSES, coursesFor } from '../data/catalog'
import { DAYS, CLASS_KINDS, TASK_TYPES, taskType, uid, ymd, toMin, fmtTime, dueText, daysLeft, dueAt, courseName, weekDates, dayIdx, askNotify, notifySupported, checkReminders, upcomingTasks, dateLong } from '../lib/schedule'
import { DayLine, useMinute } from '../components/Today'
import { courseHue } from '../lib/look'
import { timetablesFor } from '../data/timetables'
import { currentSemester } from '../lib/profile'
import { useAcct, isRep, publishTask, deleteSrvTask } from '../lib/sb'
import { I } from '../components/icons'
import { Bar, Empty, Sheet, tap, useToast } from '../components/ui'

function CourseSelect({ value, onChange, profile }) {
  const mine = coursesFor(profile)
  const others = COURSES.filter((c) => !mine.includes(c))
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">بدون مادة</option>
      <optgroup label="مواد مرحلتي">{mine.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
      <optgroup label="مواد ثانية (محمّلة)">{others.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
    </select>
  )
}

function ClassForm({ init, defDay, profile, onDone, course0 }) {
  const toast = useToast()
  const [f, setF] = useState(init || { course: course0 || '', kind: 'نظري', day: defDay ?? Math.min(dayIdx(), 5), start: '08:30', end: '10:30', room: '', prof: '' })
  const ok = f.course && f.start && f.end && toMin(f.end) > toMin(f.start)
  function save() {
    tap()
    setState((s) => ({ classes: init ? s.classes.map((c) => (c.id === init.id ? f : c)) : [...s.classes, { ...f, id: uid('c'), src: 'me' }] }))
    toast(init ? 'انحفظ التعديل' : 'انضافت المحاضرة')
    onDone()
  }
  return (
    <>
      <label className="field"><span>المادة *</span><CourseSelect value={f.course} onChange={(v) => setF({ ...f, course: v })} profile={profile} /></label>
      <div className="field"><span>اليوم *</span>
        <div className="chips">{DAYS.map((d, i) => <button key={d} className={`chip ${f.day === i ? 'on' : ''}`} onClick={() => setF({ ...f, day: i })}>{d}</button>)}</div>
      </div>
      <div className="grid2">
        <label className="field"><span>من *</span><input className="input" type="time" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></label>
        <label className="field"><span>إلى *</span><input className="input" type="time" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></label>
      </div>
      <div className="field"><span>النوع</span>
        <div className="chips">{CLASS_KINDS.map((k) => <button key={k} className={`chip ${f.kind === k ? 'on' : ''}`} onClick={() => setF({ ...f, kind: k })}>{k}</button>)}</div>
      </div>
      <div className="grid2">
        <label className="field"><span>القاعة</span><input className="input" value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} placeholder="مثلاً: قاعة 12" /></label>
        <label className="field"><span>الأستاذ</span><input className="input" value={f.prof} onChange={(e) => setF({ ...f, prof: e.target.value })} placeholder="اختياري" /></label>
      </div>
      <button className="btn ac full" disabled={!ok} onClick={save}>{init ? 'حفظ' : 'إضافة المحاضرة'}</button>
      {init && <button className="btn danger full" style={{ marginTop: 10 }} onClick={() => { setState((s) => ({ classes: s.classes.filter((c) => c.id !== init.id) })); toast('انحذفت'); onDone() }}><I n="trash" size={18} />حذف</button>}
    </>
  )
}

function TaskForm({ init, profile, onDone }) {
  const toast = useToast()
  const acct = useAcct()
  const rep = isRep(acct) && !!acct.section
  const [share, setShare] = useState(rep && !init)
  const srv = init?.src === 'srv'
  const tomorrow = new Date(Date.now() + 864e5)
  const [f, setF] = useState(init || { type: 'quiz', course: '', title: '', due: ymd(tomorrow), time: '', note: '' })
  const ok = f.due && (f.title.trim() || f.course)
  async function save() {
    tap()
    const rec = { ...f, title: f.title.trim() || taskType(f.type).n }
    if (share && !init) {
      const e = await publishTask(rec)
      toast(e ? 'ما انشر للشعبة، تأكد من الإنترنت' : 'انشر لكل الشعبة، وراح ينبههم قبل الموعد بيوم')
      return onDone()
    }
    setState((s) => ({ tasks: init ? s.tasks.map((t) => (t.id === init.id ? rec : t)) : [...s.tasks, { ...rec, id: uid('t'), done: false, src: 'me' }] }))
    toast(init ? 'انحفظ التعديل' : 'انضاف، وراح ننبهك قبل الموعد بيوم')
    onDone()
  }
  return (
    <>
      <div className="field"><span>النوع *</span>
        <div className="chips">{TASK_TYPES.map((t) => <button key={t.id} className={`chip ${f.type === t.id ? 'on' : ''}`} onClick={() => setF({ ...f, type: t.id })}><I n={t.i} size={16} />{t.n}</button>)}</div>
      </div>
      <label className="field"><span>المادة</span><CourseSelect value={f.course} onChange={(v) => setF({ ...f, course: v })} profile={profile} /></label>
      <label className="field"><span>العنوان</span><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="مثلاً: تقرير تجربة الجريان" /></label>
      <div className="grid2">
        <label className="field"><span>التاريخ *</span><input className="input" type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></label>
        <label className="field"><span>الساعة</span><input className="input" type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></label>
      </div>
      <label className="field"><span>ملاحظة</span><input className="input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="مثلاً: الفصل الثالث فقط" /></label>
      {rep && !init && <label className="chip" style={{ display: 'inline-flex', gap: 8, marginBottom: 14 }}><input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} /> انشرها لكل الشعبة</label>}
      {srv && <div className="small muted" style={{ marginBottom: 10 }}>هذا الموعد نشره ممثل الشعبة.</div>}
      {!srv && <button className="btn ac full" disabled={!ok} onClick={save}>{init ? 'حفظ' : 'إضافة'}</button>}
      {init && !srv && <button className="btn danger full" style={{ marginTop: 10 }} onClick={() => { setState((s) => ({ tasks: s.tasks.filter((t) => t.id !== init.id) })); toast('انحذف'); onDone() }}><I n="trash" size={18} />حذف</button>}
      {srv && rep && <button className="btn danger full" onClick={async () => { const e = await deleteSrvTask(init.sid); toast(e ? 'ما انحذف' : 'انحذف من الشعبة'); onDone() }}><I n="trash" size={18} />حذف من الشعبة</button>}
    </>
  )
}

export function TaskRow({ t, onEdit }) {
  const tt = taskType(t.type)
  const d = dueText(t)
  const toggle = (e) => { e.stopPropagation(); tap(); if (!t.done) chime(); setState((s) => ({ tasks: s.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) })) }
  return (
    <div className={`task ${t.done ? 'done' : ''}`} style={{ '--h': d.late && !t.done ? 'var(--bad)' : tt.h }} onClick={onEdit} role="button">
      <button className="ck" onClick={toggle} aria-label={t.done ? 'رجّعها' : 'خلصت'}>{t.done && <I n="check" size={16} />}</button>
      <div style={{ minWidth: 0 }}>
        <div className="t">{t.title}</div>
        <div className="m">{t.src === 'srv' && <span className="pill gold" style={{ marginInlineEnd: 4 }}>من الممثل</span>}{tt.n}{t.course ? ` · ${courseName(t.course)}` : ''}{t.note ? ` · ${t.note}` : ''}</div>
      </div>
      {!t.done && <div className="due"><b>{d.b}</b>{d.s}</div>}
    </div>
  )
}

function ClassInfo({ c, nav, onEdit, onClose }) {
  const srv = c.src === 'srv'
  return (
    <>
      <div className="cinfo" style={{ '--h': courseHue(c.course) }}>
        <div className="ci-t">{c.title || courseName(c.course)}</div>
        <div className="ci-g">
          <span><I n="calendar" size={15} />{DAYS[c.day]}</span>
          <span><I n="clock" size={15} />{fmtTime(c.start)} - {fmtTime(c.end)}</span>
          {c.room && <span><I n="pin" size={15} />{c.room}</span>}
          <span><I n="book" size={15} />{c.kind}</span>
          {c.prof && <span><I n="user" size={15} />{c.prof}</span>}
        </div>
      </div>
      {srv && <div className="small muted" style={{ margin: '10px 2px' }}>من جدول الشعبة اللي نشره الممثل.</div>}
      <div className="grid2" style={{ marginTop: 12 }}>
        {c.course ? <button className="btn ac" onClick={() => { onClose(); nav('course', { id: c.course }) }}><I n="folder" size={18} />ملفات المادة</button> : <span />}
        {!srv && <button className="btn soft" onClick={onEdit}><I n="pencil" size={18} />تعديل</button>}
      </div>
    </>
  )
}

export default function Schedule({ nav, tab: tab0, addFor }) {
  const s = useStore()
  const toast = useToast()
  const now = useMinute()
  const today = dayIdx(now)
  const [tab, setTab] = useState(tab0 || 'today')
  const [day, setDay] = useState(Math.min(today, 5))
  const [showDone, setShowDone] = useState(false)
  const [edit, setEdit] = useState(addFor ? { kind: 'class', isNew: true, course: addFor } : null) // { kind:'class'|'task'|'info', item }
  const [perm, setPerm] = useState(notifySupported() ? Notification.permission : 'unsupported')
  const dates = weekDates(now)
  const tasks = s.tasks.filter((t) => (showDone ? t.done : !t.done)).sort((a, b) => (showDone ? dueAt(b) - dueAt(a) : dueAt(a) - dueAt(b)))
  const tts = timetablesFor(s.profile, currentSemester())
  const [ttPick, setTtPick] = useState(0)
  const tt = tts[ttPick] || tts[0]
  const ttImported = tts.some((t) => s.ttKey === t.key)
  const hasSrv = s.classes.some((c) => c.src === 'srv')
  function importTT() {
    tap()
    setState((x) => ({ ttKey: tt.key, classes: [...x.classes.filter((c) => c.src !== 'rep'), ...tt.classes.map((c, i) => ({ ...c, id: `r${i}-${tt.key}`, src: 'rep' }))] }))
    toast('انضاف جدول شعبتك')
  }
  const openCount = s.tasks.filter((t) => !t.done && daysLeft(t) >= 0).length
  // اليوم: إذا الجمعة نعرض السبت
  const showDay = today === 6 ? 0 : today
  const soonTasks = upcomingTasks(s.tasks, now).filter((t) => daysLeft(t, now) <= 1)
  const dayCount = (i) => s.classes.filter((c) => c.day === i).length

  useEffect(() => { checkReminders() }, [])

  async function bell() {
    tap()
    const r = await askNotify()
    setPerm(r)
    if (r === 'granted') { toast('التنبيهات شغالة: قبل الموعد بيوم وصباح نفس اليوم'); checkReminders() }
    else if (r === 'unsupported') toast('جهازك ما يدعم التنبيهات. على الآيفون ثبّت التطبيق أولاً')
    else toast('التنبيهات مقفولة من المتصفح، فعّلها من إعداداته')
  }
  const add = () => { tap(); setEdit({ kind: tab === 'tasks' ? 'task' : 'class', isNew: true }) }
  const openClass = (c) => setEdit({ kind: 'info', item: c })

  return (
    <div className="screen">
      <Bar title="جدولي" sub={tab === 'today' ? dateLong(now) : 'محاضراتك وكوزاتك وتسليماتك'}
        end={<div style={{ display: 'flex', gap: 8 }}>
          <button className="iconbtn" onClick={bell} aria-label="التنبيهات" style={perm === 'granted' ? { color: 'var(--ac)' } : null}><I n={perm === 'granted' ? 'alarm' : 'bell'} size={20} /></button>
          <button className="iconbtn ac" onClick={add} aria-label="إضافة"><I n="plus" size={21} /></button>
        </div>} />

      <div className="seg">
        <button className={tab === 'today' ? 'on' : ''} onClick={() => { tap(); setTab('today') }}>اليوم</button>
        <button className={tab === 'week' ? 'on' : ''} onClick={() => { tap(); setTab('week') }}>الأسبوع</button>
        <button className={tab === 'tasks' ? 'on' : ''} onClick={() => { tap(); setTab('tasks') }}>التسليمات{openCount ? <span className="dotn" style={{ background: 'var(--mid)' }}>{openCount}</span> : null}</button>
      </div>

      {perm !== 'granted' && s.tasks.length > 0 && (
        <button className="install" style={{ width: '100%', border: 'none', textAlign: 'right', cursor: 'pointer', marginTop: 0, marginBottom: 14, color: 'var(--tx)' }} onClick={bell}>
          <span className="ic"><I n="alarm" size={22} /></span>
          <div><b style={{ fontSize: 14 }}>فعّل التنبيهات</b><div className="small muted">ننبهك قبل الكوز أو التقرير بيوم، وصباح نفس اليوم.</div></div>
        </button>
      )}
      {tab !== 'tasks' && tt && !ttImported && !hasSrv && (
        <div className="install" style={{ marginTop: 0, marginBottom: 14 }}>
          <span className="ic"><I n="week" size={22} /></span>
          <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 14 }}>جدول شعبتك جاهز</b><div className="small muted">{tt.classes.length} محاضرة بالأسبوع. {tts.length > 1 ? 'اختار شعبتك وأضفه.' : 'تضيفه بضغطة.'}</div>
            {tts.length > 1 && <div className="chips" style={{ marginTop: 8 }}>{tts.map((t, i) => <button key={t.key} className={`chip ${t === tt ? 'on' : ''}`} onClick={() => { tap(); setTtPick(i) }}>شعبة {t.group}</button>)}</div>}
          </div>
          <button className="btn warm sm" onClick={importTT}>أضفه</button>
        </div>
      )}

      {tab === 'today' && (
        <>
          <div className="card" style={{ padding: '10px 10px 6px' }}>
            {today === 6 && <div className="small muted" style={{ margin: '2px 6px 6px' }}>اليوم جمعة، هذا جدول باجر (السبت):</div>}
            {dayCount(showDay) ? <DayLine day={showDay} now={today === 6 ? new Date(now.getTime() + 864e5) : now} onOpen={openClass} />
              : <Empty e="week" t={s.classes.length ? 'ماكو محاضرات اليوم' : 'جدولك فارغ'}>{!s.classes.length && <button className="btn soft sm" style={{ marginTop: 12 }} onClick={() => setEdit({ kind: 'class', isNew: true })}><I n="plus" size={17} />أضف محاضراتك</button>}</Empty>}
          </div>
          <div className="sec">اليوم وباجر</div>
          <div className="stack stagger">{soonTasks.map((t) => <TaskRow key={t.id} t={t} onEdit={() => setEdit({ kind: 'task', item: t })} />)}</div>
          {!soonTasks.length && <div className="small muted" style={{ margin: '0 4px' }}>ماكو كوزات أو تسليمات اليوم أو باجر. <button className="lnk" onClick={() => setTab('tasks')}>شوف كل التسليمات</button></div>}
        </>
      )}

      {tab === 'week' && (
        <>
          <div className="days">
            {DAYS.map((d, i) => (
              <button key={d} className={day === i ? 'on' : ''} onClick={() => { tap(); setDay(i) }}>
                <span>{i === today ? 'اليوم' : d}</span><b>{dates[i].getDate()}</b>
                <small className="dc">{dayCount(i) ? `${dayCount(i)} محاضرة` : 'فارغ'}</small>
              </button>
            ))}
          </div>
          <div className="card" style={{ padding: '10px 10px 6px' }} key={day}>
            {dayCount(day) ? <DayLine day={day} now={now} onOpen={openClass} />
              : <Empty e="week" t={`ماكو محاضرات يوم ${DAYS[day]}`}><button className="btn soft sm" style={{ marginTop: 12 }} onClick={() => setEdit({ kind: 'class', isNew: true })}><I n="plus" size={17} />أضف محاضرة</button></Empty>}
          </div>
          {ttImported && tt.note && <div className="small muted" style={{ margin: '10px 4px 0', display: 'flex', gap: 5, alignItems: 'center' }}><I n="info" size={14} />{tt.note}</div>}
        </>
      )}

      {tab === 'tasks' && (
        <>
          <div className="chips" style={{ marginBottom: 12 }}>
            <button className={`chip ${!showDone ? 'on' : ''}`} onClick={() => setShowDone(false)}>القادمة</button>
            <button className={`chip ${showDone ? 'on' : ''}`} onClick={() => setShowDone(true)}>اللي خلصتها</button>
          </div>
          <div className="stack stagger" key={String(showDone)}>
            {tasks.map((t) => <TaskRow key={t.id} t={t} onEdit={() => setEdit({ kind: 'task', item: t })} />)}
          </div>
          {!tasks.length && (
            <Empty e="target" t={showDone ? 'بعدك ما خلصت شي' : 'ماكو كوزات أو تسليمات قريبة'}>
              {!showDone && <button className="btn soft sm" style={{ marginTop: 12 }} onClick={() => setEdit({ kind: 'task', isNew: true })}><I n="plus" size={17} />أضف موعد</button>}
            </Empty>
          )}
        </>
      )}

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.kind === 'info' ? 'المحاضرة' : edit?.kind === 'class' ? (edit.isNew ? 'محاضرة جديدة' : 'تعديل المحاضرة') : edit?.isNew ? 'كوز أو تسليم جديد' : 'تعديل الموعد'}>
        {edit?.kind === 'info' && <ClassInfo c={edit.item} nav={nav} onClose={() => setEdit(null)} onEdit={() => setEdit({ kind: 'class', item: edit.item })} />}
        {edit?.kind === 'class' && <ClassForm init={edit.isNew ? null : edit.item} defDay={tab === 'week' ? day : Math.min(today, 5)} key={edit.item?.id || 'new' + day} profile={s.profile} course0={edit.course} onDone={() => setEdit(null)} />}
        {edit?.kind === 'task' && <TaskForm init={edit.isNew ? null : edit.item} key={edit.item?.id || 'newt'} profile={s.profile} onDone={() => setEdit(null)} />}
      </Sheet>
    </div>
  )
}
