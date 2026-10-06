import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { coursesFor, courseById } from '../data/catalog'
import { DEFAULT_ANNOUNCEMENTS, DEFAULT_EXAMS } from '../data/content'
import { ViewAs } from '../components/ViewAs'
import { label, greeting, currentSemester } from '../lib/profile'
import { tap } from '../components/ui'
import { I, HUES, Bridge } from '../components/icons'
import { InstallCard } from '../components/Install'
import { QuoteOfDay } from './Quotes'
import { nextClass, upcomingTasks, taskType, dueText, fmtTime, courseName, DAYS, weekSummary, daysLeft, dayIdx } from '../lib/schedule'

function useNow() {
  const [n, setN] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setN(Date.now()), 30000); return () => clearInterval(t) }, [])
  return n
}

const HUE_LIST = Object.values(HUES)
export const courseHue = (id) => HUE_LIST[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % HUE_LIST.length]
export const initial = (name) => name.replace(/^ال/, '').trim()[0]

export default function Home({ nav }) {
  const s = useStore()
  const p = s.profile
  const now = useNow()
  // الامتحان القادم: من جدول المشرف أو من امتحانات الطالب بجدولي
  const fromTasks = s.tasks.filter((t) => t.type === 'exam' && !t.done).map((t) => ({ course: t.course, title: t.title, kind: 'امتحان', date: `${t.due}T${t.time || '08:30'}` }))
  const exams = [...(s.exams ?? DEFAULT_EXAMS).filter((e) => e.stage === p.stage), ...fromTasks].filter((e) => new Date(e.date).getTime() > now).sort((a, b) => new Date(a.date) - new Date(b.date))
  const next = exams[0]
  const examMode = next && new Date(next.date).getTime() - now < 7 * 864e5
  const anns = (s.announcements ?? DEFAULT_ANNOUNCEMENTS).filter((a) => !a.stage || a.stage === p.stage).slice(0, 2)
  const sem = currentSemester()
  const mine = coursesFor(p).filter((c) => c.sem === sem)
  const pending = s.requests.filter((r) => r.mine && !r.done).length
  const g = greeting()
  const nc = nextClass(s.classes, new Date(now))
  const up = upcomingTasks(s.tasks, new Date(now)).slice(0, 4)
  const wk = weekSummary(s, new Date(now))
  const weekStart = [6, 0, 1].includes(dayIdx(new Date(now))) // الجمعة والسبت والأحد: ملخص بداية الأسبوع

  let cd = null
  if (next) {
    const d = Math.max(0, new Date(next.date).getTime() - now)
    cd = { d: Math.floor(d / 864e5), h: Math.floor((d % 864e5) / 36e5), m: Math.floor((d % 36e5) / 6e4) }
  }

  const tiles = [
    { i: 'week', h: HUES.ocean, t: 'جدولي', go: 'schedule' },
    { i: 'books', h: HUES.teal, t: 'المكتبة', go: 'library' },
    { i: 'target', h: HUES.rose, t: 'وضعي بالمواد', go: 'calc' },
    { i: 'route', h: HUES.indigo, t: 'خريطة موادي', go: 'map' },
    { i: 'ask', h: HUES.clay, t: 'الطلبات', go: 'requests' },
    { i: 'calendar', h: HUES.sage, t: 'الامتحانات', go: 'exams' },
    { i: 'bag', h: HUES.amber, t: 'المتجر', go: 'store' },
    { i: 'quote', h: HUES.plum, t: 'اقتباسات', go: 'quotes' },
    { i: 'megaphone', h: HUES.rose, t: 'الإعلانات', go: 'news' },
    { i: 'sheet', h: HUES.sage, t: 'خطة الوحدات', go: 'map', p: { tab: 'plan' } },
    { i: 'cap', h: HUES.bronze, t: 'دليل بولونيا', go: 'bologna' },
    { i: 'hardhat', h: HUES.clay, t: 'المطوّر', go: 'developer' },
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

      {next ? (
        <div className={`hero ${examMode ? 'exam' : ''}`} role="button" style={{ cursor: 'pointer' }} onClick={() => next.course && nav('course', { id: next.course })}>
          <div className="grid" /><Bridge className="deco" />
          <div className="l">{examMode ? 'وضع الامتحانات' : 'الامتحان القادم'}{next.example ? ' (مثال)' : ''}</div>
          <div className="s">{courseById[next.course]?.name || next.title} · {next.kind || 'نهائي'}</div>
          <div className="cd"><div><b>{cd.d}</b><span>يوم</span></div><div><b>{String(cd.h).padStart(2, '0')}</b><span>ساعة</span></div><div><b>{String(cd.m).padStart(2, '0')}</b><span>دقيقة</span></div></div>
          {examMode && next.course && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14, position: 'relative', zIndex: 1 }}>
              <button className="btn sm" style={{ background: '#fff', color: '#9a3412' }} onClick={(e) => { e.stopPropagation(); tap(); nav('course', { id: next.course, type: 'past' }) }}><I n="paper" size={17} />الأسئلة السابقة</button>
              <button className="btn sm" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }} onClick={(e) => { e.stopPropagation(); tap(); nav('course', { id: next.course }) }}><I n="info" size={17} />التعليمات</button>
            </div>
          )}
        </div>
      ) : (
        <div className="hero" role="button" style={{ cursor: 'pointer' }} onClick={() => nav('schedule')}>
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
              <div style={{ fontSize: 13, opacity: .92, maxWidth: '62%' }}>اكتب جدولك مرة وحدة، ونذكّرك بالكوزات والتقارير قبل موعدها بيوم.</div>
            </>
          )}
        </div>
      )}

      <InstallCard />

      {up.length > 0 && (
        <>
          <div className="sec">قريباً عليك <button onClick={() => nav('schedule', { tab: 'tasks' })}>الكل</button></div>
          <div className="strip">
            {up.map((t) => {
              const tt = taskType(t.type), d = dueText(t, new Date(now))
              const soon = daysLeft(t, new Date(now)) <= 1
              return (
                <button key={t.id} className="mini" style={{ '--h': soon ? 'var(--bad)' : tt.h }} onClick={() => nav('schedule', { tab: 'tasks' })}>
                  <span className="k"><I n={tt.i} size={15} />{tt.n} · {typeof d.b === 'number' ? `باقي ${d.b} ${d.s}` : `${d.b} ${d.s}`}</span>
                  <span className="t">{t.title}</span>
                  <span className="m">{courseName(t.course)}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {(s.classes.length > 0 || s.tasks.length > 0) && (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <I n="chart" size={19} style={{ color: 'var(--ac)' }} /><b style={{ fontSize: 14 }}>{weekStart ? 'ملخص أسبوعك الجديد' : 'أسبوعك'}</b>
          </div>
          <div className="stat">
            <div><b>{wk.lectures}</b>محاضرة بالأسبوع</div>
            <div><b style={{ color: wk.left ? 'var(--mid)' : undefined }}>{wk.left}</b>تسليم باقي</div>
            <div><b style={{ color: 'var(--good)' }}>{wk.done}</b>خلصتها</div>
          </div>
        </div>
      )}

      <QuoteOfDay nav={nav} />

      <button className="btn ac full" style={{ margin: '16px 0 4px' }} onClick={() => { tap(); nav('library') }}><I n="books" size={20} />افتح موادي</button>

      <div className="sec">اختصارات</div>
      <div className="tiles stagger">
        {tiles.map((x) => (
          <button key={x.t} className="tile" style={{ '--h': x.h }} onClick={() => { tap(); nav(x.go, x.p) }}><span className="e"><I n={x.i} size={23} /></span>{x.t}</button>
        ))}
      </div>

      {pending > 0 && (
        <button className="row" style={{ marginTop: 14, '--h': HUES.clay }} onClick={() => nav('requests')}>
          <span className="ic"><I n="ask" /></span><div><div className="t">عندك {pending} طلب بانتظار التوفير</div><div className="m">نبلغك أول ما المشرف يرفعه</div></div><I n="chev" size={18} className="chev" />
        </button>
      )}

      <div className="sec">آخر الإعلانات <button onClick={() => nav('news')}>الكل</button></div>
      <div className="stack stagger">
        {anns.map((a) => (
          <button key={a.id} className="row" style={{ '--h': a.urgent ? 'var(--bad)' : HUES.plum }} onClick={() => nav('news')}>
            <span className="ic"><I n={a.urgent ? 'bell' : 'megaphone'} /></span>
            <div style={{ minWidth: 0 }}><div className="t">{a.title}</div><div className="m" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.body}</div></div>
          </button>
        ))}
      </div>

      <div className="sec">موادك هذا الفصل <button onClick={() => nav('library')}>كل المواد</button></div>
      <div className="stack stagger">
        {mine.map((c) => (
          <button key={c.id} className="row" style={{ '--h': courseHue(c.id) }} onClick={() => nav('course', { id: c.id })}>
            <span className="ic">{initial(c.name)}</span>
            <div><div className="t">{c.name}</div><div className="m">{c.en} · {c.ects} وحدات</div></div><I n="chev" size={18} className="chev" />
          </button>
        ))}
      </div>
    </div>
  )
}
