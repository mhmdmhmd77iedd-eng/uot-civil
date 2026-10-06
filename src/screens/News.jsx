import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { useAcct, isStaff, isRep, isStageRep, isVerified, postAnnouncement, deleteAnnouncement, fetchBoards, sb } from '../lib/sb'
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
  const [f, setF] = useState({ title: '', body: '', urgent: false })
  const [busy, setBusy] = useState(false)
  const list = by(board)
  const canPost = board === 'section' ? !!a.section && isRep(a) : board === 'stage' ? isStageRep(a) : isStaff(a)
  const stageName = STAGES.find((x) => x.id === p.stage)?.name

  async function seen(x) {
    tap()
    setState((st) => ({ seenAnns: { ...st.seenAnns, ['srv' + x.id]: true } }))
    if (a.user) try { await sb.from('announcement_seen').insert({ announcement_id: x.id, user_id: a.user.id }) } catch {}
  }
  async function post() {
    setBusy(true)
    const e = await postAnnouncement({ ...f, title: f.title.trim(), body: f.body.trim(), board })
    setBusy(false)
    if (e) return toast('ما انشر. تأكد من صلاحيتك والنت')
    setOpen(false); setF({ title: '', body: '', urgent: false }); toast('انشر الإعلان')
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
                <h3>{x.title}</h3>
                <p>{x.body}</p>
                <div className="ann-f">
                  <button className={`btn sm ${isNew ? 'ac' : 'soft'}`} disabled={!isNew} onClick={() => seen(x)}><I n="check" size={16} />{isNew ? 'شفته' : 'تمام، شفته'}</button>
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

      <Sheet open={open} onClose={() => setOpen(false)} title={`إعلان جديد · ${BOARDS.find((x) => x.id === board).n}`}>
        <div className="small muted" style={{ marginBottom: 12 }}>{{ stage: `يوصل لكل طلاب ${stageName} بكل الفروع، صباحي ومسائي.`, section: `يوصل لطلاب ${label(p)} المقبولين بالشعبة.`, general: 'يوصل لكل مستخدمي التطبيق.' }[board]}</div>
        <label className="field"><span>العنوان</span><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="مثلاً: تأجيل امتحان الهيدروليك" /></label>
        <label className="field"><span>التفاصيل</span><textarea className="input" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
        <button className={`chip ${f.urgent ? 'on' : ''}`} style={{ marginBottom: 14 }} onClick={() => setF({ ...f, urgent: !f.urgent })}><I n="bell" size={15} />عاجل</button>
        <button className="btn ac full" disabled={busy || !f.title.trim() || !f.body.trim()} onClick={post}>{busy ? 'لحظة…' : 'نشر'}</button>
      </Sheet>
    </div>
  )
}
