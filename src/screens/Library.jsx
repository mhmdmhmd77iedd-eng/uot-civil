import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { COURSES, coursesFor, semCourses, STAGES } from '../data/catalog'
import { currentSemester } from '../lib/profile'
import { CourseRow } from '../components/CourseRow'
import { I } from '../components/icons'
import { Bar, Empty, tap } from '../components/ui'

const norm = (t) => t.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
const SEM = ['', 'الفصل الأول', 'الفصل الثاني']

export default function Library({ nav }) {
  const { profile: p, plan, uploads, srvFiles } = useStore()
  const [q, setQ] = useState('')
  const [mode, setMode] = useState('now')
  const sem = currentSemester()
  const files = (uploads?.length || 0) + (srvFiles?.length || 0)

  // ثلاث طبقات واضحة: مواد هذا الفصل (من خطة الوحدات)، كل مواد مرحلتي، كل مواد الكلية
  const groups = useMemo(() => {
    if (q.trim()) {
      const n = norm(q.trim())
      return [['نتائج البحث', COURSES.filter((c) => norm(c.name).includes(n) || norm(c.en).includes(n) || norm(c.code).includes(n))]]
    }
    if (mode === 'now') return [[`${SEM[sem]} · ${STAGES.find((s) => s.id === p.stage)?.name || ''}`, semCourses(p, plan, sem)]]
    if (mode === 'stage') { const cs = coursesFor(p); return [1, 2].map((s) => [SEM[s], cs.filter((c) => c.sem === s)]) }
    const base = COURSES.filter((c) => !c.branches || !p.branch || c.branches.includes(p.branch))
    return STAGES.flatMap((st) => [1, 2].map((s) => [`${st.name} · ${SEM[s]}`, base.filter((c) => c.stage === st.id && c.sem === s)]))
  }, [p, plan, q, mode, sem])
  const total = groups.reduce((t, [, cs]) => t + cs.length, 0)

  return (
    <div className="screen">
      <Bar title="المكتبة" sub={files ? `${files} ملف مرفوع لحد الآن` : 'اختر المادة وتلگى ملازمها وأسئلتها'} />
      <div className="search">
        <I n="search" size={18} />
        <input type="search" placeholder="ابحث عن مادة… خرسانة، تربة، STMA" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {!q && (
        <div className="seg">
          <button className={mode === 'now' ? 'on' : ''} onClick={() => { tap(); setMode('now') }}>هذا الفصل</button>
          <button className={mode === 'stage' ? 'on' : ''} onClick={() => { tap(); setMode('stage') }}>مرحلتي</button>
          <button className={mode === 'all' ? 'on' : ''} onClick={() => { tap(); setMode('all') }}>كل المراحل</button>
        </div>
      )}
      {groups.filter(([, cs]) => cs.length).map(([t, cs]) => (
        <div key={t}>
          <div className="sec">{t} <span className="small muted" style={{ fontWeight: 500, marginInlineStart: 'auto' }}>{cs.length} مواد</span></div>
          <div className="stack">{cs.map((c, i) => <CourseRow key={c.id} c={c} nav={nav} i={i} />)}</div>
        </div>
      ))}
      {mode === 'now' && !q && <button className="linkrow" onClick={() => { tap(); nav('map', { tab: 'plan' }) }}><I n="sheet" size={17} />عندك مادة محمّلة أو ما راح تسجل مادة؟ عدّل خطة الوحدات</button>}
      {!total && <Empty e="search" t="ما لگينا مادة بهذا الاسم" />}
    </div>
  )
}
