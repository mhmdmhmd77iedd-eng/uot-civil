import { useState } from 'react'
import { useStore } from '../lib/store'
import { useAcct, signInEmail, signUpEmail, changePassword, signOut, joinSection, claimOwner, isRep, isStaff, isOwner, isVerified, AUTH_LIVE } from '../lib/sb'
import { label } from '../lib/profile'
import { I, HUES } from './icons'
import { tap, useToast } from './ui'

const ROLE_N = { owner: 'المطوّر', supervisor: 'مشرف', doctor: 'دكتور مادة', rep: 'ممثل الشعبة' }

export function AccountCard({ nav }) {
  const a = useAcct()
  const { admin, profile } = useStore()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  if (!AUTH_LIVE && !admin) return null

  if (!a.user) return <LoginCard />

  if (!a.deviceOk) return (
    <div className="card" style={{ display: 'grid', gap: 10 }}>
      <b className="tone-bad" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><I n="warn" size={18} />حسابك مفتوح على 3 أجهزة</b>
      <div className="small muted">الحد 3 أجهزة لكل حساب. اطلع من حسابك على جهاز ما تستخدمه (من «حسابي» ثم «خروج») وارجع جرّب.</div>
      <button className="btn ghost full" onClick={signOut}>خروج من هذا الجهاز</button>
    </div>
  )

  const status = isVerified(a) ? { t: 'طالب مؤكَّد', c: 'ok' } : a.member === 'pending' ? { t: 'بانتظار موافقة ممثل شعبتك', c: 'warm' } : a.member === 'rejected' ? { t: 'الممثل ما وافق، راجعه', c: 'urgent' } : { t: 'غير منضم لشعبة', c: 'off' }
  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {a.user.user_metadata?.avatar_url ? <img src={a.user.user_metadata.avatar_url} alt="" referrerPolicy="no-referrer" style={{ width: 46, height: 46, borderRadius: '50%' }} /> : <span className="ic" style={{ width: 46, height: 46, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--acs)', color: 'var(--ac)' }}><I n="user" /></span>}
        <div style={{ minWidth: 0 }}>
          <b style={{ fontSize: 15 }}>{a.user.user_metadata?.full_name || profile?.name || 'حسابي'}</b>
          <div className="small muted" style={{ direction: 'ltr', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.user.email}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span className={`pill ${status.c}`}>{status.t}</span>
        {a.roles.map((r, i) => <span key={i} className="pill gold">{ROLE_N[r.role]}</span>)}
      </div>
      {a.section && <div className="small muted">شعبتك: {label(profile)} · شعبة {a.section.letter}</div>}
      {a.member === 'none' && !isVerified(a) && a.section && (
        <button className="btn ac full" onClick={async () => { tap(); const e = await joinSection(); toast(e ? 'ما انرسل الطلب، جرّب مرة ثانية' : 'انرسل طلبك لممثل الشعبة') }}>اطلب الانضمام لشعبتك</button>
      )}
      {(isRep(a) || isStaff(a)) && a.section && (
        <button className="btn soft full" onClick={() => nav('rep')}><I n="shield" size={18} />إدارة شعبتي</button>
      )}
      {admin && !a.roles.length && (
        <button className="btn ghost full" onClick={async () => { tap(); const ok = await claimOwner(); toast(ok ? 'صرت المطوّر (owner)' : 'المطوّر محدد مسبقاً') }}>أنا المطوّر (مرة وحدة بس)</button>
      )}
      <PassChange />
      <button className="btn ghost sm" onClick={async () => { await signOut(); toast('طلعت من حسابك') }}>خروج</button>
      {isOwner(a) && <div className="small muted">أنت المطوّر: تقدر تعيّن مشرفين وممثلين من «إدارة شعبتي».</div>}
    </div>
  )
}

function LoginCard() {
  const toast = useToast()
  const [mode, setMode] = useState('in')
  const [f, setF] = useState({ name: '', email: '', pass: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const up = mode === 'up'
  const ok = /\S+@\S+\.\S+/.test(f.email) && f.pass.length >= 6 && (!up || f.name.trim().length >= 2)
  async function go() {
    tap(); setBusy(true)
    const e = up ? await signUpEmail(f.email, f.pass, f.name) : await signInEmail(f.email, f.pass)
    setBusy(false)
    if (e) toast(e); else toast(up ? 'انسوى حسابك' : 'هلا بيك')
  }
  return (
    <div className="card" style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span className="ic" style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--grad)', color: '#fff', flex: 'none' }}><I n="user" /></span>
        <div><b style={{ fontSize: 15 }}>{up ? 'حساب جديد' : 'سجّل دخولك'}</b><div className="small muted">حتى يوصلك جدول شعبتك وإعلانات الممثل، وتتزامن بياناتك على 3 أجهزة.</div></div>
      </div>
      <div className="chips">
        <button className={`chip ${!up ? 'on' : ''}`} onClick={() => setMode('in')}>عندي حساب</button>
        <button className={`chip ${up ? 'on' : ''}`} onClick={() => setMode('up')}>حساب جديد</button>
      </div>
      {up && <label className="field" style={{ margin: 0 }}><span>اسمك الثلاثي</span><input className="input" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="حتى يعرفك ممثل الشعبة" /></label>}
      <label className="field" style={{ margin: 0 }}><span>الإيميل</span><input className="input" type="email" dir="ltr" autoComplete="email" inputMode="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="name@gmail.com" /></label>
      <label className="field" style={{ margin: 0 }}><span>كلمة السر{up ? ' (6 أحرف أو أكثر)' : ''}</span>
        <div style={{ position: 'relative' }}>
          <input className="input" type={show ? 'text' : 'password'} dir="ltr" autoComplete={up ? 'new-password' : 'current-password'} value={f.pass} onChange={(e) => setF({ ...f, pass: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && ok && !busy && go()} style={{ paddingInlineStart: 64 }} />
          <button type="button" className="btn ghost sm" style={{ position: 'absolute', insetInlineStart: 6, top: '50%', transform: 'translateY(-50%)', padding: '4px 10px' }} onClick={() => setShow(!show)}>{show ? 'إخفاء' : 'إظهار'}</button>
        </div>
      </label>
      <button className="btn ac full" disabled={busy || !ok} onClick={go}>{busy ? 'لحظة...' : up ? 'سوّي الحساب' : 'دخول'}</button>
      <div className="small muted">{up ? 'احفظ كلمة السر. ما نرسل رسائل للإيميل.' : 'نسيت كلمة السر؟ راسل المطوّر (من صفحة المطوّر) حتى يغيّرها إلك.'}</div>
    </div>
  )
}

function PassChange() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [p, setP] = useState('')
  if (!open) return <button className="btn ghost sm" onClick={() => setOpen(true)}>تغيير كلمة السر</button>
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input className="input" type="password" dir="ltr" autoComplete="new-password" placeholder="كلمة سر جديدة" value={p} onChange={(e) => setP(e.target.value)} />
      <button className="btn ac sm" disabled={p.length < 6} onClick={async () => { const e = await changePassword(p); toast(e || 'تغيّرت كلمة السر'); if (!e) { setOpen(false); setP('') } }}>حفظ</button>
    </div>
  )
}
