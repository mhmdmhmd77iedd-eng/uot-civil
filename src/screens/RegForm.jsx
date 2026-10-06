import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { semCourses, BRANCHES, STAGES } from '../data/catalog'
import { currentSemester } from '../lib/profile'
import { I } from '../components/icons'
import { Bar, tap } from '../components/ui'

// استمارة التسجيل على المقررات حسب مسار بولونيا (الاستمارة الرسمية للكلية)
// المواد ووحداتها تنملي من خطة الوحدات، وباقي الحقول يكتبها الطالب
const ROWS = [411, 461, 512, 561, 610, 660, 709, 757].map((y) => (y / 1210) * 100)
const pctR = (x) => `${((935 - x) / 935) * 100}%`
const pctL = (x) => `${(x / 935) * 100}%`
const pctT = (y) => `${(y / 1210) * 100}%`

function academicYear() {
  const d = new Date(), y = d.getFullYear()
  return d.getMonth() >= 7 ? [y, y + 1] : [y - 1, y]
}

export default function RegForm({ back, nav, sem: sem0 }) {
  const { profile: p, plan, regForm } = useStore()
  const [sem, setSem] = useState(sem0 || currentSemester())
  const f = { name: p.name || '', uid: '', letter: '', ...regForm }
  const setF = (k, v) => setState((s) => ({ regForm: { ...s.regForm, [k]: v } }))
  const exOnly = new Set(plan?.examOnly || [])
  const list = semCourses(p, plan, sem)
  const full = list.filter((c) => !(c.carried && exOnly.has(c.id)))
  const exam = list.filter((c) => c.carried && exOnly.has(c.id))
  const [y1, y2] = academicYear()
  const branch = p.stage >= 2 ? BRANCHES.find((b) => b.id === p.branch)?.name : 'المرحلة الأولى (عام)'
  const level = STAGES.find((s) => s.id === p.stage)?.name?.replace('المرحلة ', '') || ''
  const today = new Date().toLocaleDateString('en-GB')
  const sum = (a) => a.reduce((t, c) => t + c.ects, 0)
  const over = full.length > 8 || exam.length > 8

  function doPrint() {
    tap()
    document.body.classList.add('preg')
    const done = () => { document.body.classList.remove('preg'); removeEventListener('afterprint', done) }
    addEventListener('afterprint', done)
    setTimeout(() => { print(); setTimeout(done, 1500) }, 60)
  }

  return (
    <div className="screen">
      <Bar title="استمارة التسجيل" sub="الاستمارة الرسمية لمسار بولونيا، تنملي من خطة وحداتك" onBack={back} />

      <div className="seg no-print">
        <button className={sem === 1 ? 'on' : ''} onClick={() => { tap(); setSem(1) }}>الفصل الأول</button>
        <button className={sem === 2 ? 'on' : ''} onClick={() => { tap(); setSem(2) }}>الفصل الثاني</button>
      </div>

      <div className="card no-print" style={{ marginBottom: 12 }}>
        <div className="small muted" style={{ marginBottom: 8 }}>اكتب معلوماتك مرة وحدة وتنحفظ. المواد تنملي وحدها.</div>
        <label className="field"><span>اسم الطالب الكامل</span><input className="input" value={f.name} onChange={(e) => setF('name', e.target.value)} placeholder="الاسم الرباعي" /></label>
        <div className="grid2">
          <label className="field"><span>الرقم الجامعي</span><input className="input" inputMode="numeric" value={f.uid} onChange={(e) => setF('uid', e.target.value)} /></label>
          <label className="field"><span>الشعبة</span><input className="input" value={f.letter} onChange={(e) => setF('letter', e.target.value)} placeholder="مثلاً: أ" /></label>
        </div>
        <div className="regsum">
          <span><b>{full.length}</b> مواد دوام وامتحان · {sum(full)} وحدة</span>
          <span><b>{exam.length}</b> امتحان فقط · {sum(exam)} وحدة</span>
        </div>
        <button className="linkrow" style={{ marginTop: 10 }} onClick={() => nav('map', { tab: 'plan' })}><I n="sheet" size={17} />تعديل المواد أو المحمّلة من خطة الوحدات</button>
        {over && <div className="small tone-bad" style={{ marginTop: 8 }}>الاستمارة بيها 8 أسطر لكل جدول، والزايد ما يطلع. راجع الخطة.</div>}
      </div>

      <div className="regwrap">
        <div className="regpage">
          <img src="forms/bologna-reg.jpg" alt="استمارة التسجيل على المقررات الدراسية" />
          <span className="rf" style={{ right: pctR(595), top: pctT(143) }}>{branch}</span>
          <span className="rf" style={{ right: pctR(785), top: pctT(233) }}>{f.name}</span>
          <span className="rf ltr" style={{ right: pctR(380), top: pctT(233) }}>{f.uid}</span>
          <span className="rf tick" style={{ left: pctL(sem === 1 ? 676 : 522), top: pctT(270) }}>✓</span>
          <span className="rf ltr c" style={{ left: pctL(292), top: pctT(276) }}>{y1}</span>
          <span className="rf ltr c" style={{ left: pctL(205), top: pctT(276) }}>{y2}</span>
          {full.slice(0, 8).map((c, i) => (
            <span key={c.id}>
              <span className="rf cn" style={{ right: pctR(800), top: `${ROWS[i]}%`, width: '30.4%' }}>{c.name}</span>
              <span className="rf c" style={{ left: pctL(482), top: `${ROWS[i]}%` }}>{c.ects}</span>
            </span>
          ))}
          {exam.slice(0, 8).map((c, i) => (
            <span key={c.id}>
              <span className="rf cn" style={{ right: pctR(422), top: `${ROWS[i]}%`, width: '29.2%' }}>{c.name}</span>
              <span className="rf c" style={{ left: pctL(110), top: `${ROWS[i]}%` }}>{c.ects}</span>
            </span>
          ))}
          <span className="rf" style={{ right: pctR(790), top: pctT(853) }}>{f.name}</span>
          <span className="rf" style={{ right: pctR(815), top: pctT(915) }}>{f.letter}</span>
          <span className="rf" style={{ right: pctR(772), top: pctT(938) }}>{level}</span>
          <span className="rf ltr" style={{ right: pctR(815), top: pctT(960) }}>{today}</span>
        </div>
      </div>

      <button className="btn ac full no-print" style={{ marginTop: 14 }} onClick={doPrint}><I n="print" size={19} />طباعة أو حفظ PDF</button>
      <p className="small muted center no-print">اطبع 4 نسخ مثل ما مكتوب بالاستمارة، ووقّعها، وخذ توقيع المشرف الأكاديمي ورئيس القسم. التطبيق يساعدك بالملء بس، والتسجيل الرسمي يبقى من القسم.</p>
    </div>
  )
}
