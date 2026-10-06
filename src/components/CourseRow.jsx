import { useStore } from '../lib/store'
import { courseHue } from '../lib/look'
import { DAYS, fmtTime, toMin, upcomingTasks } from '../lib/schedule'
import { calc } from '../lib/grade'
import { I } from './icons'
import { tap } from './ui'

// اختصار المادة على المربع الملوّن: أول 4 حروف من الكود، أو أول حرف من الاسم لمواد الفرع
const badge = (c) => (c.code && !c.code.includes('-') ? c.code.replace(/\d+[A-Z]?$/, '').slice(0, 4) : c.name.replace(/^ال/, '').trim()[0])

// صف مادة موحّد: يربط المادة بجدولها وتسليماتها وملفاتها ووحداتها
export function CourseRow({ c, nav, i = 0 }) {
  const s = useStore()
  const files = (s.srvFiles || []).filter((f) => f.course === c.id).length + s.uploads.filter((f) => f.course === c.id).length
  const cls = s.classes.filter((x) => x.course === c.id).sort((a, b) => a.day - b.day || toMin(a.start) - toMin(b.start))
  const due = upcomingTasks(s.tasks).filter((t) => t.course === c.id).length
  const g = s.grades[c.id] || {}
  const r = g.saee != null && g.saee !== '' ? calc({ saee: g.saee, mid: g.mid }) : null
  const risk = r && (r.status === 'blocked' || r.status === 'impossible' || r.status === 'hard')
  return (
    <button className="crow" style={{ '--h': courseHue(c.id), '--d': `${i * 40}ms` }} onClick={() => { tap(); nav('course', { id: c.id }) }}>
      <span className="cb">{badge(c)}</span>
      <span className="cm">
        <span className="t">{c.name}</span>
        <span className="tags">
          <span className="tg u">{c.ects} وحدات</span>
          {c.carried && <span className="tg w">محمّلة</span>}
          {cls[0] && <span className="tg"><I n="clock" size={12} />{DAYS[cls[0].day]} {fmtTime(cls[0].start)}{cls.length > 1 ? ` +${cls.length - 1}` : ''}</span>}
          {files > 0 && <span className="tg"><I n="folder" size={12} />{files} ملف</span>}
          {due > 0 && <span className="tg w"><I n="target" size={12} />{due} تسليم</span>}
          {risk && <span className="tg b"><I n="warn" size={12} />تحتاج تركيز</span>}
        </span>
      </span>
      <I n="chev" size={18} className="chev" />
    </button>
  )
}
