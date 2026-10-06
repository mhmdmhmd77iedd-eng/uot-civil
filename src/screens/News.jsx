import { useState } from 'react'
import { useStore, setState, getState } from '../lib/store'
import { useAcct, isStaff, isRep, isStageRep, isVerified, postAnnouncement, deleteAnnouncement, pinAnnouncement, canModAnn, fetchBoards, sb } from '../lib/sb'
import { Comments } from '../components/Comments'
import { label } from '../lib/profile'
import { STAGES } from '../data/catalog'
import { ago } from '../lib/schedule'
import { I } from '../components/icons'
import { Bar, Empty, Sheet, tap, useToast } from '../components/ui'

// ثلاث لوحات: أخبار المرحلة (الممثل العام)، تبليغات القسم (ممثل الشعبة)، إعلانات الكلية (المشرفين)
export const BOARDS = [
  { id: 'stage', n: 'مرحلتي', i: 'megaphone', who: 'ممثل المرحلة' },
  { id: 'section', n: 'قسمي', i: 'week', who: 'ممثل الشعبة' },
  { id: 'general', n: 'الكلية', i: 'cap', who: 'إدارة التطبيق' },
]
export const boardOf = (a) => (a.section_id ? 'section' : a.stage ? 'stage' : 'general')

// نموذج إعلان جديد: يستخدم بصفحة الإعلانات وبالشاشة المميزة
export function canPostTo(b, a) { return b === 'section' ? !!a.section && isRep(a) : b === 'stage' ? isStageRep(a) : isStaff(a) }
export function AnnForm({ board: b0, onDone }) {
  const a = useAcct()
  const toast = useToast()
  const p = getState().profile
  const allowed = BOARDS.filter((x) => canPostTo(x.id, a))
  const [board, setBoard] = useState(b0 && canPostTo(b0, a) ? b0 : allowed[0]?.id)
  const [f, setF] = useState({ title: '', body: '', urgent: false, pinned: false, comments_on: true })
  const [busy, setBusy] = useState(false)
  const stageName = STAGES.find((x) => x.id === p.stage)?.name
  async function send() {
    setBusy(true)
    const e = await postAnnouncement({ ...f, title: f.title.trim(), body: f.body.trim(), board })
    setBusy(false)
    if (e) return toast('ما انشر. تأكد من صلاحيتك والنت')
    toast(f.pinned ? 'انشر وصار على الشاشة المميزة' : 'انشر الإعلان'); onDone?.()
  }
  if (!board) return <p className="small muted">ما عندك صلاحية نشر إعلانات.</p>
  return (
    <>
      {allowed.length > 1 && <div className="seg" style={{ marginBottom: 10 }}>{allowed.map((x) => <button key={x.id} className={board === x.id ? 'on' : ''} onClick={() => setBoard(x.id)}><I n={x.i} size={16} />{x.n}</button>)}</div>}
      <div className="small muted" style={{ marginBottom: 12 }}>{{ stage: `يوصل لكل طلاب ${stageName || 'المرحلة'} بكل الفروع، صباحي ومسائي.`, section: `يوصل لطلاب ${label(p)} المقبولين بالشعبة.`, general: 'يوصل لكل مستخدمي التطبيق.' }[board]}</div>
      <label className="field"><span>العنوان</span><input className="input" value={f.title} maxLength={90} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="مثلاً: تأجيل امتحان الهيدروليك" /></label>
      <label className="field"><span>التفاصيل</span><textarea className="input" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
      <div className="chips" style={{ marginBottom: 14 }}>
        <button className={`chip ${f.urgent ? 'on' : ''}`} onClick={() => setF({ ...f, urgent: !f.urgent })}><I n="bell" size={15} />عاجل</button>
        <button className={`chip ${f.pinned ? 'on' : ''}`} onClick={() => setF({ ...f, pinned: !f.pinned })}><I n="spark" size={15} />على الشاشة المميزة</button>
        <button className={`chip ${f.comments_on ? 'on' : ''}`} onClick={() => setF({ ...f, comments_on: !f.comments_on })}><I n="ask" size={15} />{f.comments_on ? 'التعليقات مفتوحة' : 'بدون تعليقات'}</button>
      </div>
      <button className="btn ac full" disabled={busy || !f.title.trim() || !f.body.trim()} onClick={send}>{busy ? 'لحظة…' : 'نشر'}</button>
    </>
  )
}

export function unseenCount(s) {
  return (s.srvAnns || []).filter((a) => !s.seenAnns?.['srv' + a.id]).length
}

export default function News({ back, nav, board: b0 }) {
  const s = useStore()
  const a = useAcct()
  const toast = useToast()
  const p = s.profile
  const anns = s.srvAnns || []
  const by = (b) => anns.filter((x) => boardOf(x) === b).sort((x, y) => (y.pinned - x.pinned) || (new Date(y.created_at) - new Date(x.created_at)))
  const unseen = (b) => by(b).filter((x) => !s.seenAnns?.['srv' + x.id]).length
  const first = b0 || BOARDS.find((x) => unseen(x.id))?.id || 'stage'
  const [board, setBoard] = useState(first)
  const [open, setOpen] = useState(false)
  const [cm, setCm] = useState(null)
  const list = by(board)
  const canPost = canPostTo(board, a)
  const stageName = STAGES.find((x) => x.id === p.stage)?.name

  async function seen(x) {
    tap()
    setState((st) => ({ seenAnns: { ...st.seenAnns, ['srv' + x.id]: true } }))
    if (a.user) try { await sb.from('announcement_seen').insert({ announcement_id: x.id, user_id: a.user.id }) } catch {}
  }
  async function del(x) {
    if (!confirm('تحذف هذا الإعلان؟')) return
    const e = await deleteAnnouncement(x.id)
    toast(e ? 'ما انحذف' : 'انحذف')
  }

  const desc = { stage: `أخبار ${stageName || 'مرحلتك'} لكل الفروع، من ممثل المرحلة العام`, section: `تبليغات ${label(p)} من ممثل شعبتك`, general: 'إعلانات عامة لكل طلاب القسم' }[board]

  return (
    <div className="screen">
      <Bar title="الإعلانات" sub={desc} onBack={back}
        end={canPost ? <button className="iconbtn ac" onClick={() => { tap(); setOpen(true) }} aria-label="إعلان جديد"><I n="plus" size={21} /></button> : <button className="iconbtn" onClick={() => { tap(); fetchBoards(); toast('تحدّثت') }} aria-label="تحديث"><I n="history" size={19} /></button>} />

      <Billboard anns={anns} nav={nav} />

      <div className="seg">
        {BOARDS.map((x) => (
          <button key={x.id} className={board === x.id ? 'on' : ''} onClick={() => { tap(); setBoard(x.id) }}>
            <I n={x.i} size={17} />{x.n}{unseen(x.id) > 0 && <span className="dotn">{unseen(x.id)}</span>}
          </button>
        ))}
      </div>

      {board === 'section' && !isVerified(a) ? (
        <div className="card join">
          <span className="ic"><I n="shield" size={24} /></span>
          <b>تبليغات قسمك توصل لطلاب الشعبة بس</b>
          <div className="small muted">{a.user ? 'اطلب الانضمام لشعبتك من «حسابي»، ولما يقبلك الممثل تبين هنا تبليغاته.' : 'سجّل دخولك واطلب الانضمام لشعبتك حتى توصلك تبليغات الممثل.'}</div>
          <button className="btn ac sm" onClick={() => nav('settings')}><I n="user" size={17} />روح لحسابي</button>
        </div>
      ) : (
        <div className="stack stagger" key={board}>
          {list.map((x) => {
            const isNew = !s.seenAnns?.['srv' + x.id]
            return (
              <article key={x.id} className={`ann ${isNew ? 'new' : ''} ${x.urgent ? 'urgent' : ''}`}>
                <div className="ann-h">
                  <span className="src"><I n={BOARDS.find((b) => b.id === board).i} size={14} />{BOARDS.find((b) => b.id === board).who}</span>
                  {x.urgent && <span className="pill urgent"><I n="bell" size={12} />عاجل</span>}
                  <span className="when">{ago(x.created_at)}</span>
                </div>
                <h3>{x.pinned && <I n="spark" size={16} className="pinmark" />}{x.title}</h3>
                <p>{x.body}</p>
                <div className="ann-f">
                  <button className={`btn sm ${isNew ? 'ac' : 'soft'}`} disabled={!isNew} onClick={() => seen(x)}><I n="check" size={16} />{isNew ? 'شفته' : 'تمام، شفته'}</button>
                  <button className="btn ghost sm" onClick={() => { tap(); setCm(x) }}><I n="ask" size={16} />التعليقات</button>
                  {canModAnn(x, a) && <button className={`btn ghost sm ${x.pinned ? 'pinon' : ''}`} onClick={async () => { tap(); const e = await pinAnnouncement(x.id, !x.pinned); toast(e ? 'ما صار' : x.pinned ? 'انشال من الشاشة' : 'صار على الشاشة المميزة') }} aria-label="الشاشة المميزة"><I n="spark" size={16} /></button>}
                  {canPost && <button className="btn ghost sm" onClick={() => del(x)} aria-label="حذف"><I n="trash" size={16} /></button>}
                </div>
              </article>
            )
          })}
        </div>
      )}
      {!(board === 'section' && !isVerified(a)) && !list.length && (
        <Empty e="megaphone" t={{ stage: 'ماكو أخبار للمرحلة بعد', section: 'ماكو تبليغات لقسمك بعد', general: 'ماكو إعلانات عامة بعد' }[board]}>
          {canPost && <button className="btn soft sm" style={{ marginTop: 12 }} onClick={() => setOpen(true)}><I n="plus" size={17} />أول إعلان</button>}
        </Empty>
      )}

      <Sheet open={!!cm} onClose={() => setCm(null)} title={cm ? `التعليقات · ${cm.title}` : ''}>
        {cm && <Comments ann={cm} />}
      </Sheet>

      <Sheet open={open} onClose={() => setOpen(false)} title="إعلان جديد">
        {open && <AnnForm board={board} onDone={() => setOpen(false)} />}
      </Sheet>
    </div>
  )
}

// شريط الشاشة المميزة أعلى صفحة الإعلانات والرئيسية
export function Billboard({ anns, nav }) {
  const top = [...anns].sort((x, y) => (y.pinned - x.pinned) || (new Date(y.created_at) - new Date(x.created_at)))
  const lead = top[0]
  return (
    <button className="bboard" onClick={() => { tap(); nav('spotlight') }}>
      <span className="bb-grid" />
      <span className="bb-tag"><i />الشاشة</span>
      <span className="bb-t">{lead ? lead.title : 'شاشة الإعلانات المميزة'}</span>
      <span className="bb-run"><span>{(top.length ? top.slice(0, 6).map((x) => x.title) : ['أخبار المرحلة', 'تبليغات القسم', 'إعلانات الكلية']).join('   ·   ')}</span></span>
      <I n="chev" size={18} className="bb-go" />
    </button>
  )
}
