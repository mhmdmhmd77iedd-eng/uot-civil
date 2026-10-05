import { useState } from 'react'
import { useStore } from '../lib/store'
import { useAcct, signInGoogle, signOut, joinSection, claimOwner, isRep, isStaff, isOwner, isVerified, AUTH_LIVE } from '../lib/sb'
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

  if (!a.user) return (
    <div className="card" style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span className="install" style={{ all: 'unset' }}><span className="ic" style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--grad)', color: '#fff' }}><I n="user" /></span></span>
        <div><b style={{ fontSize: 15 }}>سجّل دخولك</b><div className="small muted">حتى يوصلك جدول شعبتك وإعلانات الممثل، وتتزامن بياناتك على 3 أجهزة.</div></div>
      </div>
      <button className="btn ac full" disabled={busy} onClick={async () => { tap(); setBusy(true); const { error } = await signInGoogle(); if (error) { setBusy(false); toast('ما قدرنا نفتح دخول Google، جرّب بعد شوية') } }}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#fff" opacity=".8" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#fff" opacity=".6" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#fff" opacity=".9" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.7 9.4 6 12 6z"/></svg>
        الدخول بحساب Google
      </button>
    </div>
  )

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
      <button className="btn ghost sm" onClick={async () => { await signOut(); toast('طلعت من حسابك') }}>خروج</button>
      {isOwner(a) && <div className="small muted">أنت المطوّر: تقدر تعيّن مشرفين وممثلين من «إدارة شعبتي».</div>}
    </div>
  )
}
