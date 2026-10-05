import { useState } from 'react'
import { BRANCHES, STAGES, SHIFTS } from '../data/catalog'
import { setState } from '../lib/store'
import { APP_NAME, APP_EN, DISCLAIMER } from '../lib/brand'
import { I, Bridge } from '../components/icons'
import { tap, transition, Footer } from '../components/ui'

export default function Onboarding({ initial, onDone }) {
  const [step, setStep] = useState(initial ? 1 : 0)
  const [p, setP] = useState(initial || { stage: null, branch: null, shift: null, name: '' })
  const go = (s) => transition(() => setStep(s))
  const needBranch = p.stage && p.stage > 1
  const ready = p.stage && p.shift && (!needBranch || p.branch)

  function finish() {
    tap()
    const profile = { ...p, branch: needBranch ? p.branch : null, name: p.name.trim() }
    setState({ profile, seenWelcome: true })
    onDone?.()
  }

  if (step === 0)
    return (
      <div className="screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, paddingTop: 20 }}>
          <div className="brand stagger" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
            <img src="icons/icon-192.png" alt="" style={{ width: 76, height: 76, borderRadius: 22, boxShadow: '0 14px 30px -12px rgba(47,110,105,.6)' }} />
            <div>
              <div className="n" style={{ fontSize: 36 }}>{APP_NAME}</div>
              <div className="e">{APP_EN}</div>
            </div>
          </div>
          <div className="welcome-art" aria-hidden="true"><Bridge draw sw={1.1} /></div>
          <div className="stagger">
            <h1 className="welcome-title" style={{ marginBottom: 8 }}>كل دراستك بمكان واحد، <em>مرتبة وهادئة</em>.</h1>
            <p className="muted" style={{ margin: '0 0 14px' }}>ملازم، أسئلة سابقة حسب السنة، ملخصات، إعلانات القسم، وحاسبة سعي حسب نظام بولونيا. بدون ما يضيع شي بين رسائل القروبات.</p>
            <div className="feat"><span><I n="book" size={16} />ملازم</span><span><I n="paper" size={16} />أسئلة سابقة</span><span><I n="calc" size={16} />حاسبة السعي</span><span><I n="route" size={16} />خريطة المواد</span></div>
          </div>
          <div className="stack stagger">
            <button className="btn ac full" onClick={() => { tap(); go(1) }}>ابدأ الآن</button>
            <button className="btn ghost full" disabled title="يتفعل بعد ربط الخادم">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
              الدخول بحساب Google (قريباً)
            </button>
          </div>
        </div>
        <p className="small muted center" style={{ marginTop: 24 }}>{DISCLAIMER}</p>
        <Footer />
      </div>
    )

  return (
    <div className="screen">
      <div className="bar">
        {!initial && <button className="iconbtn" onClick={() => go(0)} aria-label="رجوع">→</button>}
        <div><h2>{initial ? 'تعديل معلوماتي' : 'خلّينا نعرفك'}</h2><div className="sub">حتى نعرض لك موادك أنت فقط</div></div>
      </div>

      <label className="field"><span>اسمك (اختياري)</span>
        <input className="input" value={p.name} maxLength={30} placeholder="مثلاً: عبدالله" onChange={(e) => setP({ ...p, name: e.target.value })} />
      </label>

      <div className="field"><span>المرحلة</span>
        <div className="chips">{STAGES.map((s) => <button key={s.id} className={`chip ${p.stage === s.id ? 'on' : ''}`} onClick={() => { tap(); setP({ ...p, stage: s.id }) }}>{s.name}</button>)}</div>
      </div>

      {needBranch && (
        <div className="field" style={{ animation: 'up .4s var(--ease)' }}><span>الفرع</span>
          <div className="chips">{BRANCHES.map((b) => <button key={b.id} className={`chip ${p.branch === b.id ? 'on' : ''}`} onClick={() => { tap(); setP({ ...p, branch: b.id }) }}>{b.name}</button>)}</div>
        </div>
      )}
      {p.stage === 1 && <p className="small muted" style={{ marginTop: -6 }}>المرحلة الأولى عامة وموحدة لكل الفروع.</p>}

      <div className="field"><span>الدراسة</span>
        <div className="chips">{SHIFTS.map((s) => <button key={s.id} className={`chip ${p.shift === s.id ? 'on' : ''}`} onClick={() => { tap(); setP({ ...p, shift: s.id }) }}>{s.name}</button>)}</div>
      </div>

      <button className="btn ac full" disabled={!ready} onClick={finish} style={{ marginTop: 10 }}>{initial ? 'حفظ' : 'دخول'}</button>
    </div>
  )
}
