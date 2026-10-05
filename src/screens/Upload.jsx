import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { COURSES, courseById, FILE_TYPES } from '../data/catalog'
import { putBlob, fileHash, fmtSize } from '../lib/files'
import { I, HUES } from '../components/icons'
import { Bar, tap, useToast } from '../components/ui'

const YEARS = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - i)

export default function Upload({ course: c0, type: t0, back, nav }) {
  const { uploads } = useStore()
  const toast = useToast()
  const [f, setF] = useState({ official: (t0 || 'notes') === 'notes', course: c0 || '', type: t0 || 'notes', title: '', year: '', round: '', exam: '', author: '', url: '' })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dup, setDup] = useState(null)
  const isVideo = f.type === 'video'
  const isPast = f.type === 'past'
  const ok = f.course && f.type && f.title.trim() && (isVideo ? /^https?:\/\//.test(f.url) : file) && (!isPast || (f.year && f.round))
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function pick(e) {
    const x = e.target.files?.[0]
    setDup(null)
    if (!x) return setFile(null)
    setFile(x)
    if (!f.title) setF((p) => ({ ...p, title: x.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') }))
    const h = await fileHash(x)
    const d = uploads.find((u) => u.hash === h)
    if (d) setDup(d)
    x._hash = h
  }

  async function save() {
    tap()
    if (dup) return toast('هذا الملف مرفوع مسبقاً')
    setBusy(true)
    try {
      const id = 'f' + Date.now().toString(36)
      const rec = { id, official: f.official, course: f.course, type: f.type, title: f.title.trim(), year: f.year ? Number(f.year) : null, round: f.round ? Number(f.round) : null, exam: f.exam || null, author: f.author.trim() || null, at: new Date().toISOString().slice(0, 10) }
      if (isVideo) Object.assign(rec, { kind: 'link', url: f.url.trim() })
      else { await putBlob(id, file); Object.assign(rec, { kind: 'file', hash: file._hash || (await fileHash(file)), size: file.size, name: file.name }) }
      setState((s) => ({ uploads: [rec, ...s.uploads] }))
      toast('انرفع الملف')
      nav('course', { id: f.course }, true)
    } catch {
      toast('صار خطأ بالحفظ، جرّب مرة ثانية')
    } finally { setBusy(false) }
  }

  return (
    <div className="screen">
      <Bar title="رفع ملف" sub="كل الحقول المعلّمة مطلوبة حتى يبقى المحتوى مرتب" onBack={back} />
      <div className="demo"><I n="info" size={18} style={{ color: 'var(--mid)', marginTop: 1 }} /><span>بهذي النسخة التجريبية الملف ينحفظ على جهازك فقط. بعد ربط الخادم يوصل لكل الطلاب.</span></div>

      <label className="field"><span>المادة *</span>
        <select className="input" value={f.course} onChange={set('course')}>
          <option value="">اختر المادة</option>
          {[1, 2, 3, 4].map((st) => (
            <optgroup key={st} label={`المرحلة ${['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة'][st]}`}>
              {COURSES.filter((c) => c.stage === st).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="field"><span>النوع *</span>
        <div className="chips">{FILE_TYPES.map((t) => <button key={t.id} className={`chip ${f.type === t.id ? 'on' : ''}`} onClick={() => setF({ ...f, type: t.id, official: t.id === 'notes' })}><I n={t.icon} size={16} />{t.name}</button>)}</div>
      </div>

      <div className="field"><span>التصنيف *</span>
        <div className="chips">
          <button className={`chip ${f.official ? 'on' : ''}`} onClick={() => setF({ ...f, official: true })}><I n="seal" size={16} />معتمد من القسم</button>
          <button className={`chip ${!f.official ? 'on' : ''}`} onClick={() => setF({ ...f, official: false })}>غير رسمي (ملخص، ترجمة، حلول طلاب)</button>
        </div>
      </div>

      {isVideo ? (
        <label className="field"><span>رابط الفيديو (يوتيوب) *</span>
          <input className="input" dir="ltr" value={f.url} onChange={set('url')} placeholder="https://youtu.be/…" />
        </label>
      ) : (
        <label className="field"><span>الملف *</span>
          <input className="input" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*" onChange={pick} />
          {file && <div className="small muted" style={{ marginTop: 6 }}>{file.name} · {fmtSize(file.size)}</div>}
          {dup && <div className="small tone-bad" style={{ marginTop: 6 }}>نفس الملف مرفوع مسبقاً باسم «{dup.title}» في {courseById[dup.course]?.name}.</div>}
        </label>
      )}

      <label className="field"><span>العنوان *</span>
        <input className="input" value={f.title} onChange={set('title')} placeholder="مثلاً: أسئلة النهائي مع الحل" />
      </label>

      <div className="grid2">
        <label className="field"><span>السنة {isPast && '*'}</span>
          <select className="input" value={f.year} onChange={set('year')}><option value="">—</option>{YEARS.map((y) => <option key={y}>{y}</option>)}</select>
        </label>
        <label className="field"><span>الدور {isPast && '*'}</span>
          <select className="input" value={f.round} onChange={set('round')}><option value="">—</option><option value="1">دور أول</option><option value="2">دور ثاني</option></select>
        </label>
      </div>
      {isPast && (
        <div className="field"><span>نوع الامتحان</span>
          <div className="chips">{['نهائي', 'مد', 'كويز'].map((x) => <button key={x} className={`chip ${f.exam === x ? 'on' : ''}`} onClick={() => setF({ ...f, exam: x })}>{x}</button>)}</div>
        </div>
      )}
      {f.type === 'summary' && (
        <label className="field"><span>صاحب الملخص (تقديراً لجهده)</span>
          <input className="input" value={f.author} onChange={set('author')} placeholder="اسم الطالب" />
        </label>
      )}

      <button className="btn ac full" disabled={!ok || busy || !!dup} onClick={save}>{busy ? 'جاري الرفع…' : 'رفع'}</button>
    </div>
  )
}
