import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { coursesFor, courseById } from '../data/catalog'
import { DEFAULT_ANNOUNCEMENTS, DEFAULT_EXAMS } from '../data/content'
import { label, greeting, currentSemester } from '../lib/profile'
import { tap } from '../components/ui'

function useNow() {
  const [n, setN] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setN(Date.now()), 30000); return () => clearInterval(t) }, [])
  return n
}

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

  let cd = null
  if (next) {
    const d = Math.max(0, new Date(next.date).getTime() - now)
    cd = { d: Math.floor(d / 864e5), h: Math.floor((d % 864e5) / 36e5), m: Math.floor((d % 36e5) / 6e4) }
  }

  const tiles = [
    { e: '📚', t: 'المكتبة', go: () => nav('library') },
    { e: '🧮', t: 'حاسبة السعي', go: () => nav('calc') },
    { e: '🗺️', t: 'خريطة موادي', go: () => nav('map') },
    { e: '🙋', t: 'الطلبات', go: () => nav('requests') },
    { e: '🎓', t: 'دليل بولونيا', go: () => nav('bologna') },
    { e: '📣', t: 'الإعلانات', go: () => nav('news') },
    { e: '📅', t: 'الامتحانات', go: () => nav('exams') },
    { e: '👷', t: 'المطوّر', go: () => nav('developer') },
  ]

  return (
    <div className="screen">
      <div className="top">
        <div>
          <div className="hi">{greeting()}{p.name ? `، ${p.name}` : ''}</div>
          <h1>{label(p)}</h1>
        </div>
        <img src="icons/icon-192.png" alt="المدني" style={{ width: 44, height: 44, borderRadius: 13, boxShadow: 'var(--sh)' }} />
      </div>

      {next ? (
        <button className="hero" style={{ border: 'none', width: '100%', textAlign: 'right', cursor: 'pointer' }} onClick={() => nav('course', { id: next.course })}>
          <div className="l">الامتحان القادم{next.example ? ' (مثال)' : ''}</div>
          <div className="s">{courseById[next.course]?.name || next.title} · {next.kind || 'نهائي'}</div>
          <div className="cd"><div><b>{cd.d}</b><span>يوم</span></div><div><b>{String(cd.h).padStart(2, '0')}</b><span>ساعة</span></div><div><b>{String(cd.m).padStart(2, '0')}</b><span>دقيقة</span></div></div>
        </button>
      ) : (
        <div className="hero">
          <div className="l">الامتحانات</div>
          <div className="s" style={{ marginBottom: 6 }}>ما انشر جدول الامتحانات بعد</div>
          <div style={{ fontSize: 13, opacity: .9, position: 'relative', zIndex: 1 }}>أول ما ينزل الجدول يظهر هنا العد التنازلي لامتحانك القادم.</div>
        </div>
      )}

      <button className="btn full" style={{ margin: '16px 0 4px' }} onClick={() => { tap(); nav('library') }}>افتح موادي</button>

      <div className="sec">اختصارات</div>
      <div className="tiles stagger">
        {tiles.map((x) => (
          <button key={x.t} className="tile" onClick={() => { tap(); x.go() }}><span className="e">{x.e}</span>{x.t}</button>
        ))}
      </div>

      {pending > 0 && (
        <button className="row" style={{ marginTop: 14 }} onClick={() => nav('requests')}>
          <span className="ic">🙋</span><div><div className="t">عندك {pending} طلب بانتظار التوفير</div><div className="m">نبلغك أول ما المشرف يرفعه</div></div><span className="chev" />
        </button>
      )}

      <div className="sec">آخر الإعلانات <button onClick={() => nav('news')}>الكل</button></div>
      <div className="stack stagger">
        {anns.map((a) => (
          <button key={a.id} className="row" onClick={() => nav('news')}>
            <span className="ic">{a.urgent ? '🔔' : '📣'}</span>
            <div style={{ minWidth: 0 }}><div className="t">{a.title}</div><div className="m" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.body}</div></div>
          </button>
        ))}
      </div>

      <div className="sec">موادك هذا الفصل <button onClick={() => nav('library')}>كل المواد</button></div>
      <div className="stack stagger">
        {mine.map((c) => (
          <button key={c.id} className="row" onClick={() => nav('course', { id: c.id })}>
            <span className="ic">{c.name.replace(/^(ال)/, '').trim()[0]}</span>
            <div><div className="t">{c.name}</div><div className="m">{c.en} · {c.ects} وحدات</div></div><span className="chev" />
          </button>
        ))}
      </div>
    </div>
  )
}
