import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { courseById, before, after, FILE_TYPES } from '../data/catalog'
import { getBlob, fmtSize } from '../lib/files'
import { I } from '../components/icons'
import { Bar, Empty, Sheet, tap, useToast } from '../components/ui'
import { calc, STATUS_TEXT } from '../lib/grade'
import { isOfficial } from '../lib/files'
import { TaskRow } from './Schedule'
import { upcomingTasks } from '../lib/schedule'

export default function Course({ id, type: type0, nav, back }) {
  const s = useStore()
  const c = courseById[id]
  const toast = useToast()
  const [type, setType] = useState(type0 || 'notes')
  const [edit, setEdit] = useState(false)
  const [rules, setRules] = useState('')
  if (!c) return <div className="screen"><Bar title="المادة غير موجودة" onBack={back} /></div>

  // المعتمد من القسم يطلع أول، وبعده الأحدث
  const files = s.uploads.filter((u) => u.course === id && u.type === type).sort((a, b) => (isOfficial(b) - isOfficial(a)) || (b.helpful ? 1 : 0) - (a.helpful ? 1 : 0) || (b.year || 0) - (a.year || 0))
  const counts = s.uploads.filter((u) => u.course === id).reduce((m, u) => ((m[u.type] = (m[u.type] || 0) + 1), m), {})
  const examRules = s.examRules?.[id]
  const pre = before(id), nxt = after(id)
  const g = s.grades[id] || {}
  const hasG = g.saee != null && g.saee !== ''
  const r = calc({ saee: g.saee, mid: g.mid })
  const st = STATUS_TEXT[r.status]
  const setG = (k, v) => setState((x) => ({ grades: { ...x.grades, [id]: { ...(x.grades[id] || {}), [k]: v } } }))
  const abs = s.absences[id] || 0
  const setAbs = (n) => { tap(); setState((x) => ({ absences: { ...x.absences, [id]: Math.max(0, n) } })) }
  const lim = s.absenceLimit
  const myTasks = upcomingTasks(s.tasks).filter((t) => t.course === id)

  async function open(f) {
    tap()
    if (f.kind === 'link') return window.open(f.url, '_blank', 'noopener')
    const blob = await getBlob(f.id).catch(() => null)
    if (!blob) return toast('الملف مو موجود على هذا الجهاز')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  return (
    <div className="screen">
      <Bar title={c.name} sub={`${c.en} · ${c.code.includes('-') ? 'مادة فرع' : c.code} · ${c.ects} وحدات`} onBack={back} />

      {(examRules || s.admin) && (
        <div className="card" style={{ marginBottom: 12, borderInlineStart: '4px solid var(--gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><I n="info" size={18} style={{ color: 'var(--mid)' }} />تعليمات الامتحان</b>
            {s.admin && <button className="btn soft sm" onClick={() => { setRules(examRules || ''); setEdit(true) }}>تعديل</button>}
          </div>
          <div className="small" style={{ whiteSpace: 'pre-wrap', marginTop: 6, color: examRules ? 'var(--tx)' : 'var(--mu)' }}>
            {examRules || 'ما انضافت تعليمات بعد. أضف شنو داخل وشنو محذوف ونوع الامتحان.'}
          </div>
        </div>
      )}

      {myTasks.length > 0 && (
        <div className="stack" style={{ marginBottom: 12 }}>
          {myTasks.slice(0, 3).map((t) => <TaskRow key={t.id} t={t} onEdit={() => nav('schedule', { tab: 'tasks' })} />)}
        </div>
      )}

      <div className="grid2" style={{ marginBottom: 14 }}>
        <div className="card" style={{ padding: 13 }}>
          <div className="small muted" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><I n="target" size={15} />درجاتي</div>
          <div className="grid2" style={{ gap: 6, marginTop: 8 }}>
            <input className="input" style={{ padding: '9px 8px', textAlign: 'center' }} inputMode="decimal" placeholder="سعي/40" value={g.saee ?? ''} onChange={(e) => setG('saee', e.target.value.replace(/[^\d.]/g, '').slice(0, 4))} />
            <input className="input" style={{ padding: '9px 8px', textAlign: 'center' }} inputMode="decimal" placeholder="مد/10" value={g.mid ?? ''} onChange={(e) => setG('mid', e.target.value.replace(/[^\d.]/g, '').slice(0, 4))} />
          </div>
          <div className={`small tone-${hasG ? st.tone : 'mid'}`} style={{ marginTop: 8, fontWeight: 600, lineHeight: 1.4 }}>
            {!hasG ? <span className="muted" style={{ fontWeight: 400 }}>اكتب سعيك ونحسبلك شكد تحتاج</span> : r.status === 'blocked' ? 'أقل من 14، ما يحق لك الدور الأول' : r.need === 0 ? 'ناجح قبل النهائي' : `تحتاج ${r.need} من 50 بالنهائي`}
          </div>
        </div>
        <div className="card" style={{ padding: 13 }}>
          <div className="small muted" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><I n="user" size={15} />غياباتي</div>
          <div className="stepper" style={{ marginTop: 8, justifyContent: 'space-between' }}>
            <button onClick={() => setAbs(abs - 1)} aria-label="نقص"><I n="minus" size={18} /></button>
            <b className={lim && abs >= lim * 0.8 ? 'tone-bad' : ''}>{abs}</b>
            <button onClick={() => setAbs(abs + 1)} aria-label="زيد"><I n="plus" size={18} /></button>
          </div>
          <div className="small muted" style={{ marginTop: 8, lineHeight: 1.4 }}>{lim ? `حد الحرمان ${lim}، باقي ${Math.max(0, lim - abs)}` : 'سجّل كل غياب حتى تبقى منتبه'}</div>
        </div>
      </div>

      <div className="tabs">
        {FILE_TYPES.map((t) => (
          <button key={t.id} className={type === t.id ? 'on' : ''} onClick={() => { tap(); setType(t.id) }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><I n={t.icon} size={17} />{t.name}{counts[t.id] ? ` (${counts[t.id]})` : ''}</span>
          </button>
        ))}
      </div>

      <div className="stack stagger" key={type}>
        {files.map((f) => (
          <button key={f.id} className="row" onClick={() => open(f)}>
            <span className="ic"><I n={f.kind === 'link' ? 'play' : FILE_TYPES.find((t) => t.id === f.type)?.icon} /></span>
            <div style={{ minWidth: 0 }}>
              <div className="t">{f.title}</div>
              <div className="m" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 8px' }}>
                {isOfficial(f) ? <span className="pill ok"><I n="seal" size={13} />معتمد من القسم</span> : <span className="pill off">غير رسمي</span>}
                <span>{[f.year, f.round && (f.round === 1 ? 'دور أول' : 'دور ثاني'), f.exam, f.author && `بواسطة ${f.author}`, fmtSize(f.size)].filter(Boolean).join(' · ')}</span>
              </div>
            </div>
            {!isOfficial(f) && (
              <span className="end" role="button" aria-label="مفيد" onClick={(e) => { e.stopPropagation(); tap(); setState((x) => ({ helpful: { ...x.helpful, [f.id]: !x.helpful[f.id] } })) }}
                style={{ display: 'flex', alignItems: 'center', gap: 3, color: s.helpful[f.id] ? 'var(--ac)' : 'var(--mu)', fontSize: 12, padding: 4 }}>
                <I n="thumb" size={18} />مفيد
              </span>
            )}
          </button>
        ))}
      </div>
      {!files.length && (
        <Empty e={FILE_TYPES.find((t) => t.id === type)?.icon} t={`ما انرفعت ${FILE_TYPES.find((t) => t.id === type)?.name} لهذي المادة بعد`}>
          <button className="btn soft sm" style={{ marginTop: 12 }} onClick={() => nav('requests', { course: id, type })}>اطلبها من المشرفين</button>
        </Empty>
      )}

      {s.admin && <button className="btn ac full" style={{ marginTop: 14 }} onClick={() => nav('upload', { course: id, type })}><I n="upload" size={20} />رفع ملف لهذي المادة</button>}

      {(pre.length > 0 || nxt.length > 0) && (
        <>
          <div className="sec">تسلسل المادة <button onClick={() => nav('map', { focus: id })}>الخريطة</button></div>
          <div className="card small">
            {pre.length > 0 && <div>لازم تعبر قبلها: <b>{pre.map((x) => courseById[x].name).join('، ')}</b></div>}
            {nxt.length > 0 && <div style={{ marginTop: pre.length ? 6 : 0 }}>تفتح لك: <b>{nxt.map((x) => courseById[x].name).join('، ')}</b></div>}
          </div>
        </>
      )}

      <Sheet open={edit} onClose={() => setEdit(false)} title="تعليمات الامتحان">
        <textarea className="input" rows={6} value={rules} onChange={(e) => setRules(e.target.value)} placeholder={'مثال:\n• الامتحان مسائل فقط\n• لا توجد ورقة قوانين\n• محذوف: الفصل السادس'} />
        <button className="btn ac full" style={{ marginTop: 12 }} onClick={() => { setState((st) => ({ examRules: { ...(st.examRules || {}), [id]: rules.trim() } })); setEdit(false); toast('انحفظت التعليمات') }}>حفظ</button>
      </Sheet>
    </div>
  )
}
