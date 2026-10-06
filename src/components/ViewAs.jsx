import { useStore, setState } from '../lib/store'
import { useAcct, isStaff, refresh, fetchBoards, fetchExams } from '../lib/sb'
import { BRANCHES, STAGES, SHIFTS } from '../data/catalog'
import { label } from '../lib/profile'
import { I } from './icons'
import { tap } from './ui'

const SHORT = { str: 'إنشائية', cem: 'إدارة مشاريع', san: 'صحية وبيئية', hwy: 'طرق وجسور', wat: 'موارد مائية', geo: 'جيوماتك' }

// المطوّر والمشرف يتنقلون بين كل الفروع والمراحل حتى يشوفون شنو يشوف كل طالب
export function ViewAs() {
  const s = useStore()
  const a = useAcct()
  if (!isStaff(a) && !s.admin) return null
  const p = s.profile
  const real = s.realProfile
  const needBranch = p.stage >= 2
  function go(ch) {
    tap()
    const next = { ...p, ...ch }
    if (next.stage < 2) next.branch = null
    else if (!next.branch) next.branch = real?.branch || 'str'
    setState({ realProfile: real || p, profile: next })
    if (a.user) refresh().catch(() => {}); else { fetchBoards().catch(() => {}); fetchExams().catch(() => {}) }
  }
  function back() {
    tap()
    setState({ profile: real, realProfile: null })
    if (a.user) refresh().catch(() => {}); else { fetchBoards().catch(() => {}); fetchExams().catch(() => {}) }
  }
  return (
    <div className="card viewas">
      <div className="viewas-h">
        <b><I n="grid" size={17} />معاينة الأقسام</b>
        {real && <button className="btn soft sm" onClick={back}>رجوع لشعبتي</button>}
      </div>
      <div className="chips">{STAGES.map((x) => <button key={x.id} className={`chip ${p.stage === x.id ? 'on' : ''}`} onClick={() => go({ stage: x.id })}>{x.name.replace('المرحلة ', '')}</button>)}</div>
      {needBranch && <div className="chips">{BRANCHES.map((b) => <button key={b.id} className={`chip ${p.branch === b.id ? 'on' : ''}`} onClick={() => go({ branch: b.id })}>{SHORT[b.id]}</button>)}</div>}
      <div className="chips">{SHIFTS.map((x) => <button key={x.id} className={`chip ${p.shift === x.id ? 'on' : ''}`} onClick={() => go({ shift: x.id })}>{x.name}</button>)}</div>
      {real && <div className="small muted">تشوف التطبيق مثل طالب {label(p)}. شعبتك الأصلية: {label(real)}</div>}
    </div>
  )
}
