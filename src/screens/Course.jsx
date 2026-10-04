import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { courseById, before, after, FILE_TYPES } from '../data/catalog'
import { getBlob, fmtSize } from '../lib/files'
import { Bar, Empty, Sheet, tap, useToast } from '../components/ui'

export default function Course({ id, nav, back }) {
  const s = useStore()
  const c = courseById[id]
  const toast = useToast()
  const [type, setType] = useState('past')
  const [edit, setEdit] = useState(false)
  const [rules, setRules] = useState('')
  if (!c) return <div className="screen"><Bar title="المادة غير موجودة" onBack={back} /></div>

  const files = s.uploads.filter((u) => u.course === id && u.type === type).sort((a, b) => (b.year || 0) - (a.year || 0))
  const counts = s.uploads.filter((u) => u.course === id).reduce((m, u) => ((m[u.type] = (m[u.type] || 0) + 1), m), {})
  const examRules = s.examRules?.[id]
  const pre = before(id), nxt = after(id)

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
            <b style={{ fontSize: 14 }}>📌 تعليمات الامتحان</b>
            {s.admin && <button className="btn soft sm" onClick={() => { setRules(examRules || ''); setEdit(true) }}>تعديل</button>}
          </div>
          <div className="small" style={{ whiteSpace: 'pre-wrap', marginTop: 6, color: examRules ? 'var(--tx)' : 'var(--mu)' }}>
            {examRules || 'ما انضافت تعليمات بعد. أضف شنو داخل وشنو محذوف ونوع الامتحان.'}
          </div>
        </div>
      )}

      <div className="tabs">
        {FILE_TYPES.map((t) => (
          <button key={t.id} className={type === t.id ? 'on' : ''} onClick={() => { tap(); setType(t.id) }}>
            {t.icon} {t.name}{counts[t.id] ? ` (${counts[t.id]})` : ''}
          </button>
        ))}
      </div>

      <div className="stack stagger" key={type}>
        {files.map((f) => (
          <button key={f.id} className="row" onClick={() => open(f)}>
            <span className="ic">{f.kind === 'link' ? '▶️' : FILE_TYPES.find((t) => t.id === f.type)?.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div className="t">{f.title}</div>
              <div className="m">{[f.year, f.round && (f.round === 1 ? 'دور أول' : 'دور ثاني'), f.exam, f.author && `بواسطة ${f.author}`, fmtSize(f.size)].filter(Boolean).join(' · ')}</div>
            </div>
            <span className="end" style={{ color: 'var(--ac)', fontWeight: 600 }}>فتح</span>
          </button>
        ))}
      </div>
      {!files.length && (
        <Empty e={FILE_TYPES.find((t) => t.id === type)?.icon} t={`ما انرفعت ${FILE_TYPES.find((t) => t.id === type)?.name} لهذي المادة بعد`}>
          <button className="btn soft sm" style={{ marginTop: 12 }} onClick={() => nav('requests', { course: id, type })}>اطلبها من المشرفين</button>
        </Empty>
      )}

      {s.admin && <button className="btn ac full" style={{ marginTop: 14 }} onClick={() => nav('upload', { course: id, type })}>＋ رفع ملف لهذي المادة</button>}

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
