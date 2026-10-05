import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { COURSES, coursesFor, STAGES } from '../data/catalog'
import { courseHue, initial } from './Home'
import { Bar, Empty, tap } from '../components/ui'

const norm = (t) => t.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')

export default function Library({ nav }) {
  const { profile: p, uploads, srvFiles } = useStore()
  const [q, setQ] = useState('')
  const [all, setAll] = useState(false)
  const count = useMemo(() => [...uploads, ...(srvFiles || [])].reduce((m, u) => ((m[u.course] = (m[u.course] || 0) + 1), m), {}), [uploads])

  const list = useMemo(() => {
    let base = all ? COURSES.filter((c) => !c.branches || !p.branch || c.branches.includes(p.branch) || p.stage === 1) : coursesFor(p)
    if (q.trim()) {
      const n = norm(q.trim())
      base = COURSES.filter((c) => norm(c.name).includes(n) || norm(c.en).includes(n) || norm(c.code).includes(n))
    }
    return base
  }, [p, q, all])

  const groups = useMemo(() => {
    const g = {}
    list.forEach((c) => { const k = `${c.stage}-${c.sem}`; (g[k] ||= []).push(c) })
    return Object.entries(g).sort()
  }, [list])

  return (
    <div className="screen">
      <Bar title="المكتبة" sub="اختر المادة لترى ملازمها وأسئلتها" />
      <input className="input" type="search" placeholder="ابحث عن مادة… (مثلاً: خرسانة أو STMA)" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />
      {!q && (
        <div className="tabs">
          <button className={!all ? 'on' : ''} onClick={() => { tap(); setAll(false) }}>موادي</button>
          <button className={all ? 'on' : ''} onClick={() => { tap(); setAll(true) }}>كل المراحل</button>
        </div>
      )}
      {groups.map(([k, cs]) => {
        const [st, sem] = k.split('-').map(Number)
        return (
          <div key={k}>
            <div className="sec">{STAGES.find((s) => s.id === st)?.name} · الفصل {sem === 1 ? 'الأول' : 'الثاني'}</div>
            <div className="stack stagger">
              {cs.map((c) => (
                <button key={c.id} className="row" style={{ '--h': courseHue(c.id) }} onClick={() => { tap(); nav('course', { id: c.id }) }}>
                  <span className="ic">{initial(c.name)}</span>
                  <div style={{ minWidth: 0 }}><div className="t">{c.name}</div><div className="m">{c.en} · {c.code.includes('-') ? 'مادة فرع' : c.code}</div></div>
                  <span className="end">{count[c.id] ? `${count[c.id]} ملف` : ''}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
      {!list.length && <Empty e="search" t="ما لگينا مادة بهذا الاسم" />}
    </div>
  )
}
