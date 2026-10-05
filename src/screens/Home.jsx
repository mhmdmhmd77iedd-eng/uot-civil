import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { coursesFor, courseById } from '../data/catalog'
import { DEFAULT_ANNOUNCEMENTS, DEFAULT_EXAMS } from '../data/content'
import { label, greeting, currentSemester } from '../lib/profile'
import { tap } from '../components/ui'
import { I, HUES, Bridge } from '../components/icons'

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
  const exams = (s.exams ?? DEFAULT_EXAMS).filter((e) => e.stage === p.stage && new Date(e.date).getTime() > now).sort((a, b) => new Date(a.date) - new Date(b.date))
  const next = exams[0]
  const anns = (s.announcements ?? DEFAULT_ANNOUNCEMENTS).filter((a) => !a.stage || a.stage === p.stage).slice(0, 2)
  const sem = currentSemester()
  const mine = coursesFor(p).filter((c) => c.sem === sem)
  const pending = s.requests.filter((r) => r.mine && !r.done).length
  const g = greeting()

  let cd = null
  if (next) {
    const d = Math.max(0, new Date(next.date).getTime() - now)
    cd = { d: Math.floor(d / 864e5), h: Math.floor((d % 864e5) / 36e5), m: Math.floor((d % 36e5) / 6e4) }
  }

  const tiles = [
    { i: 'books', h: HUES.teal, t: 'المكتبة', go: 'library' },
    { i: 'calc', h: HUES.amber, t: 'حاسبة السعي', go: 'calc' },
    { i: 'route', h: HUES.ocean, t: 'خريطة موادي', go: 'map' },
    { i: 'ask', h: HUES.clay, t: 'الطلبات', go: 'requests' },
    { i: 'cap', h: HUES.indigo, t: 'دليل بولونيا', go: 'bologna' },
    { i: 'megaphone', h: HUES.plum, t: 'الإعلانات', go: 'news' },
    { i: 'calendar', h: HUES.sage, t: 'الامتحانات', go: 'exams' },
    { i: 'hardhat', h: HUES.bronze, t: 'المطوّر', go: 'developer' },
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

      {next ? (
        <button className="hero" style={{ border: 'none', width: '100%', textAlign: 'right', cursor: 'pointer' }} onClick={() => nav('course', { id: next.course })}>
          <div className="grid" /><Bridge className="deco" />
          <div className="l">الامتحان القادم{next.example ? ' (مثال)' : ''}</div>
          <div className="s">{courseById[next.course]?.name || next.title} · {next.kind || 'نهائي'}</div>
          <div className="cd"><div><b>{cd.d}</b><span>يوم</span></div><div><b>{String(cd.h).padStart(2, '0')}</b><span>ساعة</span></div><div><b>{String(cd.m).padStart(2, '0')}</b><span>دقيقة</span></div></div>
        </button>
      ) : (
        <div className="hero">
          <div className="grid" /><Bridge className="deco" />
          <div className="l">الامتحانات</div>
          <div className="s" style={{ marginBottom: 6 }}>ما انشر جدول الامتحانات بعد</div>
          <div style={{ fontSize: 13, opacity: .9, maxWidth: '58%' }}>أول ما ينزل الجدول يظهر هنا العد التنازلي لامتحانك القادم.</div>
        </div>
      )}

      <button className="btn full" style={{ margin: '16px 0 4px' }} onClick={() => { tap(); nav('library') }}><I n="books" size={20} />افتح موادي</button>

      <div className="sec">اختصارات</div>
      <div className="tiles stagger">
        {tiles.map((x) => (
          <button key={x.t} className="tile" style={{ '--h': x.h }} onClick={() => { tap(); nav(x.go) }}><span className="e"><I n={x.i} size={23} /></span>{x.t}</button>
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
