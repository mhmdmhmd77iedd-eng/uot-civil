import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { useAcct, isStaff, isOwner, devOverview, grantRole, revokeRole } from '../lib/sb'
import { label } from '../lib/profile'
import { STAGES } from '../data/catalog'
import { ago } from '../lib/schedule'
import { I, HUES } from '../components/icons'
import { Bar, Empty, tap, useToast } from '../components/ui'

const ROLE_N = { owner: 'المطوّر', supervisor: 'مشرف', doctor: 'دكتور مادة', stage_rep: 'ممثل مرحلة', rep: 'ممثل شعبة' }
const secLabel = (x) => label({ branch: x.stage >= 2 ? x.branch : null, stage: x.stage, shift: x.shift })
const daysSince = (iso) => (iso ? (Date.now() - new Date(iso).getTime()) / 864e5 : Infinity)
const lastAct = (x) => [x.task_at, x.ann_at, x.classes_at].filter(Boolean).sort().pop()

// التنبيهات: وين التقصير ووين المشاكل، مرتبة من الأهم
function alerts(o) {
  const out = []
  for (const x of o.sections) {
    const reps = x.reps.length
    if (x.pending > 0 && daysSince(x.oldest_pending) > 2) out.push({ lv: 3, i: 'user', t: `${x.pending} طالب ينتظر القبول من ${Math.floor(daysSince(x.oldest_pending))} أيام`, m: secLabel(x) + (reps ? ` · الممثل: ${x.reps.map((r) => r.name || 'بدون اسم').join('، ')}` : ' · بدون ممثل') })
    if (!reps && (x.members > 0 || x.pending > 0)) out.push({ lv: 3, i: 'shield', t: 'شعبة فيها طلاب بدون ممثل', m: `${secLabel(x)} · ${x.members + x.pending} طالب` })
    if (reps && x.classes === 0) out.push({ lv: 2, i: 'week', t: 'الممثل ما نزّل جدول الشعبة', m: `${secLabel(x)} · ${x.reps.map((r) => r.name || 'بدون اسم').join('، ')}` })
    else if (reps && daysSince(lastAct(x)) > 7) out.push({ lv: 1, i: 'clock', t: `ماكو نشاط بالشعبة من ${Number.isFinite(daysSince(lastAct(x))) ? Math.floor(daysSince(lastAct(x))) + ' يوم' : 'البداية'}`, m: `${secLabel(x)} · ${x.reps.map((r) => r.name || 'بدون اسم').join('، ')}` })
  }
  if (o.open_requests > 0 && daysSince(o.oldest_request) > 3) out.push({ lv: 2, i: 'ask', t: `${o.open_requests} طلب ملف مفتوح، أقدمها من ${Math.floor(daysSince(o.oldest_request))} أيام`, m: 'المشرفين يرفعون الأكثر طلباً أول', go: 'requests' })
  for (const st of STAGES) if (!o.staff.some((r) => r.role === 'stage_rep' && r.stage === st.id)) out.push({ lv: 1, i: 'megaphone', t: `${st.name} بدون ممثل عام`, m: 'عيّن ممثل مرحلة حتى ينشر أخبارها' })
  for (const r of o.staff) if (r.role === 'supervisor' && !r.files_week) out.push({ lv: 1, i: 'upload', t: `المشرف ${r.name || 'بدون اسم'} ما رفع ملفات هذا الأسبوع`, m: r.last_file ? `آخر رفع ${ago(r.last_file)}` : 'ما رفع شي بعد' })
  return out.sort((a, b) => b.lv - a.lv)
}

function Grant({ owner, onDone }) {
  const toast = useToast()
  const [f, setF] = useState({ email: '', role: 'rep', stage: 1 })
  const [busy, setBusy] = useState(false)
  const roles = [['rep', 'ممثل شعبة'], ['stage_rep', 'ممثل مرحلة'], ...(owner ? [['supervisor', 'مشرف']] : [])]
  async function go() {
    tap(); setBusy(true)
    const e = await grantRole(f.email, f.role, f.role === 'stage_rep' ? f.stage : null)
    setBusy(false)
    toast(e || 'تعيّن، ويبين له أول ما يفتح التطبيق')
    if (!e) { setF({ ...f, email: '' }); onDone() }
  }
  return (
    <div className="card" style={{ display: 'grid', gap: 10 }}>
      <input className="input" type="email" dir="ltr" placeholder="إيميل حسابه بالتطبيق" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <div className="chips">{roles.map(([id, n]) => <button key={id} className={`chip ${f.role === id ? 'on' : ''}`} onClick={() => setF({ ...f, role: id })}>{n}</button>)}</div>
      {f.role === 'stage_rep' && <div className="chips">{STAGES.map((x) => <button key={x.id} className={`chip ${f.stage === x.id ? 'on' : ''}`} onClick={() => setF({ ...f, stage: x.id })}>{x.name}</button>)}</div>}
      <div className="small muted">{{ rep: 'ممثل الشعبة يتعيّن على الشعبة اللي اختارها بحسابه (المرحلة والفرع وصباحي/مسائي)، وينقبل بيها تلقائياً.', stage_rep: 'ممثل المرحلة ينشر أخبار المرحلة لكل فروعها، وجدول امتحاناتها.', supervisor: 'المشرف يرفع الملفات، ويعيّن الممثلين، ويشوف هاي اللوحة.' }[f.role]}</div>
      <button className="btn ac" disabled={busy || !f.email.includes('@')} onClick={go}>{busy ? 'لحظة…' : 'تعيين'}</button>
    </div>
  )
}

export default function DevPanel({ back, nav }) {
  const a = useAcct()
  const { profile } = useStore()
  const toast = useToast()
  const [o, setO] = useState(undefined)
  const [stage, setStage] = useState(0)
  const [allSecs, setAllSecs] = useState(false)
  const load = () => devOverview().then(setO)
  useEffect(() => { if (isStaff(a)) load() }, [a.roles.length])

  if (!isStaff(a)) return <div className="screen"><Bar title="لوحة المطوّر" onBack={back} /><Empty e="shield" t="هاي الصفحة للمطوّر والمشرفين بس" /></div>
  if (o === undefined) return <div className="screen"><Bar title="لوحة المطوّر" onBack={back} /><div className="sk" style={{ height: 90, marginBottom: 10 }} /><div className="sk" style={{ height: 200 }} /></div>
  if (!o) return <div className="screen"><Bar title="لوحة المطوّر" onBack={back} /><Empty e="warn" t="ما قدرنا نجيب البيانات. تأكد إن التحديث 4 منشغّل بالخادم وإن النت شغال"><button className="btn soft sm" style={{ marginTop: 12 }} onClick={load}>جرّب مرة ثانية</button></Empty></div>

  const al = alerts(o)
  const active = o.sections.filter((x) => x.reps.length || x.members || x.pending)
  const secs = (allSecs ? o.sections : active).filter((x) => !stage || x.stage === stage)
  const owner = isOwner(a)

  async function revoke(r) {
    if (!confirm(`تشيل صلاحية ${ROLE_N[r.role]} من ${r.name || 'هذا الحساب'}؟`)) return
    const e = await revokeRole(r.id); toast(e || 'انشالت الصلاحية'); if (!e) load()
  }

  return (
    <div className="screen">
      <Bar title="لوحة المطوّر" sub="شنو يصير بالتطبيق، ووين يحتاج تدخّلك" onBack={back}
        end={<button className="iconbtn" onClick={() => { tap(); load(); toast('تحدّثت') }} aria-label="تحديث"><I n="history" size={19} /></button>} />

      <div className="kpis stagger">
        <div style={{ '--h': HUES.teal }}><I n="user" size={18} /><b>{o.users}</b><span>مستخدم{o.users_week ? ` · +${o.users_week} هالأسبوع` : ''}</span></div>
        <div style={{ '--h': HUES.ocean }}><I n="folder" size={18} /><b>{o.files}</b><span>ملف{o.files_week ? ` · +${o.files_week} هالأسبوع` : ''}</span></div>
        <button style={{ '--h': HUES.clay }} onClick={() => nav('requests')}><I n="ask" size={18} /><b>{o.open_requests}</b><span>طلب ينتظر</span></button>
        <div style={{ '--h': HUES.plum }}><I n="shield" size={18} /><b>{o.sections.filter((x) => x.reps.length).length}</b><span>شعبة عندها ممثل</span></div>
      </div>

      <div className="sec">يحتاج انتباهك {al.length ? `(${al.length})` : ''}</div>
      {al.length ? (
        <div className="stack stagger">
          {al.slice(0, 12).map((x, i) => (
            <button key={i} className={`alert lv${x.lv}`} onClick={() => x.go && nav(x.go)}>
              <span className="ic"><I n={x.i} size={18} /></span>
              <span style={{ minWidth: 0 }}><span className="t">{x.t}</span><span className="m">{x.m}</span></span>
            </button>
          ))}
        </div>
      ) : <div className="card small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><I n="done" size={18} style={{ color: 'var(--good)' }} />كلشي ماشي زين، ماكو تقصير واضح.</div>}

      <div className="sec">الشعب <button onClick={() => setAllSecs(!allSecs)}>{allSecs ? 'الفعّالة بس' : 'كل الشعب'}</button></div>
      <div className="chips" style={{ marginBottom: 10 }}>
        <button className={`chip ${!stage ? 'on' : ''}`} onClick={() => setStage(0)}>الكل</button>
        {STAGES.map((x) => <button key={x.id} className={`chip ${stage === x.id ? 'on' : ''}`} onClick={() => setStage(x.id)}>{x.name.replace('المرحلة ', '')}</button>)}
      </div>
      <div className="stack">
        {secs.map((x) => {
          const la = lastAct(x)
          const tone = !x.reps.length ? 'bad' : x.classes === 0 || daysSince(la) > 7 || (x.pending && daysSince(x.oldest_pending) > 2) ? 'mid' : 'good'
          return (
            <div key={x.id} className="secrow">
              <span className={`dot tone-${tone}`} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="t">{secLabel(x)}</div>
                <div className="m">{x.reps.length ? `الممثل: ${x.reps.map((r) => r.name || 'بدون اسم').join('، ')}` : 'بدون ممثل'}{la ? ` · آخر نشاط ${ago(la)}` : ''}</div>
              </div>
              <div className="nums"><span><b>{x.members}</b>طالب</span>{x.pending > 0 && <span className="tone-mid"><b>{x.pending}</b>ينتظر</span>}<span><b>{x.classes}</b>محاضرة</span></div>
            </div>
          )
        })}
        {!secs.length && <div className="small muted" style={{ padding: 8 }}>ماكو شعب فعّالة بهاي المرحلة بعد.</div>}
      </div>

      <div className="sec">الفريق</div>
      <div className="stack">
        {o.staff.map((r) => (
          <div key={r.id} className="secrow">
            <span className="ic" style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--acs)', color: 'var(--ac)', flex: 'none' }}><I n={r.role === 'owner' ? 'hardhat' : r.role === 'stage_rep' ? 'megaphone' : 'shield'} size={18} /></span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="t">{r.name || 'بدون اسم'} <span className="pill gold">{ROLE_N[r.role]}{r.stage ? ` ${STAGES.find((s) => s.id === r.stage)?.name.replace('المرحلة ', '')}` : ''}</span></div>
              <div className="m">{r.files_week ? `رفع ${r.files_week} ملف هالأسبوع` : r.last_file ? `آخر رفع ${ago(r.last_file)}` : 'ما رفع ملفات'}{r.last_ann ? ` · آخر إعلان ${ago(r.last_ann)}` : ''}</div>
            </div>
            {r.role !== 'owner' && (owner || r.role !== 'supervisor') && <button className="iconbtn sm" onClick={() => revoke(r)} aria-label="شيل الصلاحية"><I n="trash" size={16} /></button>}
          </div>
        ))}
      </div>

      <div className="sec">تعيين صلاحية</div>
      <Grant owner={owner} onDone={load} />

      <div className="sec">أدوات سريعة</div>
      <div className="tiles">
        {[['upload', 'رفع ملف', 'upload', HUES.teal], ['megaphone', 'إعلان عام', 'news', HUES.rose, { board: 'general' }], ['bag', 'المتجر', 'store', HUES.amber], ['calendar', 'الامتحانات', 'exams', HUES.sage]].map(([i, t, go, h, p]) => (
          <button key={t} className="tile" style={{ '--h': h }} onClick={() => { tap(); nav(go, p) }}><span className="e"><I n={i} size={22} /></span>{t}</button>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>تشوف الشعب حسب {label(profile)}؟ استخدم «معاينة الأقسام» بالرئيسية حتى تتنقل بين الأقسام.</p>
    </div>
  )
}
