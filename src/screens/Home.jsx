import { useStore } from '../lib/store'
import { semCourses, courseById } from '../data/catalog'
import { ViewAs } from '../components/ViewAs'
import { label, greeting, currentSemester } from '../lib/profile'
import { tap } from '../components/ui'
import { I, HUES, Bridge } from '../components/icons'
import { InstallCard } from '../components/Install'
import { QuoteOfDay } from './Quotes'
import { TaskRow } from './Schedule'
import { CourseRow } from '../components/CourseRow'
import { TodayCard, useMinute } from '../components/Today'
import { BOARDS, boardOf } from './News'
import { courseHue, initial } from '../lib/look'
import { useAcct, isStaff } from '../lib/sb'
import { nextClass, upcomingTasks, fmtTime, courseName, DAYS, ago, dateLong } from '../lib/schedule'

export { courseHue, initial }

export default function Home({ nav }) {
  const s = useStore()
  const a = useAcct()
  const p = s.profile
  const nowD = useMinute()
  const now = nowD.getTime()
  // الامتحان القادم: من جدول الامتحانات المنشور أو امتحانات كتبها الطالب بجدولي
  const fromTasks = s.tasks.filter((t) => t.type === 'exam' && !t.done).map((t) => ({ course: t.course, title: t.title, kind: 'امتحان', date: `${t.due}T${t.time || '08:30'}` }))
  const fromSrv = (s.srvExams || []).map((e) => ({ course: e.course_id, kind: e.kind, date: e.starts_at, room: e.room }))
  const exams = [...fromSrv, ...fromTasks].filter((e) => new Date(e.date).getTime() > now).sort((x, y) => new Date(x.date) - new Date(y.date))
  const next = exams[0]
  const days = next ? (new Date(next.date).getTime() - now) / 864e5 : 99
  const showExam = next && days < 14
  const examMode = next && days < 7
  const anns = [...(s.srvAnns || [])].sort((x, y) => (!!s.seenAnns?.['srv' + x.id] - !!s.seenAnns?.['srv' + y.id]) || (new Date(y.created_at) - new Date(x.created_at))).slice(0, 2)
  const sem = currentSemester()
  const mine = semCourses(p, s.plan, sem)
  const units = mine.reduce((t, c) => t + c.ects, 0)
  const g = greeting()
  const nc = nextClass(s.classes, nowD)
  const up = upcomingTasks(s.tasks, nowD)

  let cd = null
  if (showExam) {
    const d = Math.max(0, new Date(next.date).getTime() - now)
    cd = { d: Math.floor(d / 864e5), h: Math.floor((d % 864e5) / 36e5), m: Math.floor((d % 36e5) / 6e4) }
  }

  const tiles = [
    { i: 'calendar', h: HUES.sage, t: 'الامتحانات', go: 'exams' },
    { i: 'target', h: HUES.rose, t: 'وضعي بالمواد', go: 'calc' },
    { i: 'route', h: HUES.indigo, t: 'خريطة موادي', go: 'map' },
    { i: 'sheet', h: HUES.ocean, t: 'خطة الوحدات', go: 'map', p: { tab: 'plan' } },
    { i: 'ask', h: HUES.clay, t: 'الطلبات', go: 'requests' },
    { i: 'bag', h: HUES.amber, t: 'المتجر', go: 'store' },
    { i: 'quote', h: HUES.plum, t: 'اقتباسات', go: 'quotes' },
    { i: 'cap', h: HUES.bronze, t: 'دليل بولونيا', go: 'bologna' },
    ...(isStaff(a) ? [{ i: 'shield', h: HUES.teal, t: 'لوحة المطوّر', go: 'devpanel' }] : [{ i: 'hardhat', h: HUES.teal, t: 'المطوّر', go: 'developer' }]),
  ]

  return (
    <div className="screen">
      <div className="top">
        <div>
          <div className="hi"><I n={g.i} size={15} />{g.t}{p.name ? `، ${p.name}` : ''}</div>
          <h1>{label(p)}</h1>
        </div>
        <img className="logo" src="icons/icon-192.png" alt="المدني" />
      </div>
      <ViewAs />

      {showExam ? (
        <div className={`hero ${examMode ? 'exam' : ''}`} role="button" style={{ cursor: 'pointer' }} onClick={() => nav('exams')}>
          <div className="grid" /><Bridge className="deco" />
          <div className="l">{examMode ? 'وضع الامتحانات' : 'الامتحان القادم'} · {next.kind || 'نهائي'}</div>
          <div className="s">{courseById[next.course]?.name || next.title}</div>
          <div className="cd"><div><b>{cd.d}</b><span>يوم</span></div><div><b>{String(cd.h).padStart(2, '0')}</b><span>ساعة</span></div><div><b>{String(cd.m).padStart(2, '0')}</b><span>دقيقة</span></div></div>
          <div className="hero-sub">{dateLong(new Date(next.date))}{next.room ? ` · قاعة ${next.room}` : ''}</div>
          {next.course && (
            <div className="hero-act">
              <button className="btn sm" style={{ background: '#fff', color: examMode ? '#9a3412' : '#0b6b60' }} onClick={(e) => { e.stopPropagation(); tap(); nav('course', { id: next.course, type: 'past' }) }}><I n="paper" size={17} />الأسئلة السابقة</button>
              <button className="btn sm" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }} onClick={(e) => { e.stopPropagation(); tap(); nav('exams') }}><I n="calendar" size={17} />كل الجدول</button>
            </div>
          )}
        </div>
      ) : (
        <div className="hero" role="button" style={{ cursor: 'pointer' }} onClick={() => (nc?.c.course ? nav('course', { id: nc.c.course }) : nav('schedule'))}>
          <div className="grid" /><Bridge className="deco" />
          <div className="l">{nc ? (nc.live ? 'محاضرتك هسه' : 'محاضرتك الجاية') : 'جدولي'}</div>
          {nc ? (
            <>
              <div className="s" style={{ marginBottom: 8 }}>{nc.c.title || courseName(nc.c.course)}</div>
              <div className="cd">
                <div><b style={{ fontSize: 17 }}>{nc.inDays === 0 ? 'اليوم' : nc.inDays === 1 ? 'باجر' : DAYS[nc.c.day]}</b><span>متى</span></div>
                <div><b style={{ fontSize: 17 }}>{fmtTime(nc.c.start)}</b><span>الوقت</span></div>
                {nc.c.room && <div><b style={{ fontSize: 17 }}>{nc.c.room}</b><span>القاعة</span></div>}
              </div>
            </>
          ) : (
            <>
              <div className="s" style={{ marginBottom: 6 }}>رتّب محاضراتك ومواعيدك</div>
              <div style={{ fontSize: 13, opacity: .92, maxWidth: '62%' }}>جدول شعبتك ينزل من الممثل، أو اكتبه بنفسك، ونذكّرك بالكوزات قبل موعدها بيوم.</div>
            </>
          )}
        </div>
      )}

      <InstallCard />
      <TodayCard nav={nav} />

      {up.length > 0 && (
        <>
          <div className="sec">قريباً عليك <button onClick={() => nav('schedule', { tab: 'tasks' })}>الكل ({up.length})</button></div>
          <div className="stack stagger">
            {up.slice(0, 3).map((t) => <TaskRow key={t.id} t={t} onEdit={() => nav('schedule', { tab: 'tasks' })} />)}
          </div>
        </>
      )}

      <div className="sec">اختصارات</div>
      <div className="tiles stagger">
        {tiles.map((x) => (
          <button key={x.t} className="tile" style={{ '--h': x.h }} onClick={() => { tap(); nav(x.go, x.p) }}><span className="e"><I n={x.i} size={23} /></span>{x.t}</button>
        ))}
      </div>

      {anns.length > 0 && (
        <>
          <div className="sec">آخر الإعلانات <button onClick={() => nav('news')}>الكل</button></div>
          <div className="stack stagger">
            {anns.map((x) => {
              const b = BOARDS.find((y) => y.id === boardOf(x))
              const isNew = !s.seenAnns?.['srv' + x.id]
              return (
                <button key={x.id} className="row" style={{ '--h': x.urgent ? 'var(--bad)' : HUES.plum }} onClick={() => nav('news', { board: b.id })}>
                  <span className="ic"><I n={x.urgent ? 'bell' : b.i} /></span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="t">{x.title} {isNew && <span className="pill urgent" style={{ fontSize: 10.5 }}>جديد</span>}</div>
                    <div className="m" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.who} · {ago(x.created_at)}</div>
                  </div>
                  <I n="chev" size={18} className="chev" />
                </button>
              )
            })}
          </div>
        </>
      )}

      <QuoteOfDay nav={nav} />

      <div className="sec">موادك هذا الفصل <button onClick={() => nav('library')}>المكتبة</button></div>
      <button className="unitsum" onClick={() => { tap(); nav('map', { tab: 'plan' }) }}><span><b>{units}</b> / 30 وحدة</span><i style={{ width: `${Math.min(100, units / 30 * 100)}%` }} /><span className="muted">{mine.length} مواد · الفصل {sem === 1 ? 'الأول' : 'الثاني'} · عدّل الخطة</span></button>
      <div className="stack">
        {mine.map((c, i) => <CourseRow key={c.id} c={c} nav={nav} i={i} />)}
      </div>
    </div>
  )
}
