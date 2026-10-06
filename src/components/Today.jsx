import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { DAYS, dayIdx, toMin, fmtTime, courseName, dateLong } from '../lib/schedule'
import { courseHue } from '../lib/look'
import { I } from './icons'
import { tap } from './ui'

export function useMinute() {
  const [n, setN] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setN(new Date()), 30000); return () => clearInterval(t) }, [])
  return n
}
const inMin = (m) => (m < 60 ? `${m} دقيقة` : `${Math.floor(m / 60)} س${m % 60 ? ` و${m % 60} د` : ''}`)

// محاضرات يوم واحد كخط زمني: اللي خلصت باهتة، الحالية بشريط تقدّم، والجاية بعدّاد
export function DayLine({ day, now, onOpen, compact }) {
  const { classes } = useStore()
  const today = dayIdx(now)
  const cur = now.getHours() * 60 + now.getMinutes()
  const list = classes.filter((c) => c.day === day).sort((a, b) => toMin(a.start) - toMin(b.start))
  const nextIdx = day === today ? list.findIndex((c) => toMin(c.start) > cur) : -1
  return (
    <div className="dline">
      {list.map((c, i) => {
        const s0 = toMin(c.start), e0 = toMin(c.end)
        const live = day === today && s0 <= cur && e0 > cur
        const past = day === today && e0 <= cur
        const pct = live ? Math.round(((cur - s0) / (e0 - s0)) * 100) : 0
        return (
          <button key={c.id} className={`dl ${live ? 'live' : ''} ${past ? 'past' : ''}`} style={{ '--h': courseHue(c.course), '--d': `${i * 50}ms` }} onClick={() => { tap(); onOpen(c) }}>
            <span className="dl-t"><b>{fmtTime(c.start).split(' ')[0]}</b><small>{fmtTime(c.start).split(' ')[1]}</small></span>
            <span className="dl-dot" />
            <span className="dl-b">
              <span className="t">{c.title || courseName(c.course)}</span>
              <span className="m">
                {fmtTime(c.start)} - {fmtTime(c.end)}{c.room ? ` · ${c.room}` : ''}{!compact && c.kind ? ` · ${c.kind}` : ''}
              </span>
              {live && <span className="dl-p"><i style={{ width: `${pct}%` }} /><em>باقي {inMin(e0 - cur)}</em></span>}
              {i === nextIdx && !live && <span className="pill warm" style={{ marginTop: 4 }}>تبدي بعد {inMin(s0 - cur)}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// بطاقة «اليوم» بالرئيسية
export function TodayCard({ nav }) {
  const now = useMinute()
  const { classes } = useStore()
  const d = dayIdx(now)
  const list = classes.filter((c) => c.day === d)
  const cur = now.getHours() * 60 + now.getMinutes()
  const left = list.filter((c) => toMin(c.end) > cur).length
  return (
    <section className="today">
      <div className="today-h">
        <div><b>اليوم</b><span>{dateLong(now)}</span></div>
        <button className="btn soft sm" onClick={() => { tap(); nav('schedule') }}><I n="week" size={16} />جدولي</button>
      </div>
      {d === 6 ? <div className="today-e"><I n="sun" size={20} />الجمعة عطلة، ارتاح وجهّز لأسبوعك.</div>
        : !classes.length ? <div className="today-e"><I n="week" size={20} /><span>ما نزل جدولك بعد. <button className="lnk" onClick={() => nav('schedule')}>أضفه هنا</button></span></div>
        : !list.length ? <div className="today-e"><I n="done" size={20} />ماكو محاضرات اليوم.</div>
        : <>
            <DayLine day={d} now={now} compact onOpen={(c) => (c.course ? nav('course', { id: c.course }) : nav('schedule'))} />
            <div className="today-f">{left ? `باقي ${left} من ${list.length} محاضرات` : `خلصت محاضرات اليوم (${list.length})`}</div>
          </>}
    </section>
  )
}
export { DAYS }
