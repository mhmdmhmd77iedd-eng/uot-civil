import { useEffect, useState } from 'react'
import { useAcct, canModAnn, fetchComments, addComment, modComment, deleteComment } from '../lib/sb'
import { ago } from '../lib/schedule'
import { I } from './icons'
import { Empty, tap, useToast } from './ui'

// تعليقات الإعلان: الطالب يكتب، وما يظهر للكل إلا بعد موافقة المشرف أو ممثل اللوحة
export function Comments({ ann, onCount }) {
  const a = useAcct()
  const toast = useToast()
  const mod = canModAnn(ann, a)
  const [list, setList] = useState(null)
  const [tab, setTab] = useState('approved')
  const [txt, setTxt] = useState('')
  const [busy, setBusy] = useState(false)
  const [reply, setReply] = useState(null)

  const load = async () => { const d = await fetchComments(ann.id); setList(d || []); onCount?.(d ? d.filter((c) => c.status === 'approved').length : 0) }
  useEffect(() => { load() }, [ann.id])

  const pending = (list || []).filter((c) => c.status === 'pending')
  const hidden = (list || []).filter((c) => c.status === 'hidden')
  const shown = mod
    ? (list || []).filter((c) => c.status === tab)
    : (list || []).filter((c) => c.status === 'approved' || c.user_id === a.user?.id)

  async function send() {
    setBusy(true)
    const e = await addComment(ann.id, txt.trim())
    setBusy(false)
    if (e) return toast(/comments_off/.test(e.message) ? 'التعليقات مقفولة على هذا الإعلان' : 'ما انرسل. تأكد من النت')
    setTxt(''); toast(mod ? 'انشر تعليقك' : 'انرسل، ويظهر بعد موافقة المشرف'); load()
  }
  async function act(c, patch, msg) {
    tap()
    const e = await modComment(c.id, patch)
    if (e) return toast('ما صار. تأكد من صلاحيتك')
    toast(msg); setReply(null); load()
  }
  async function del(c) {
    if (!confirm('تحذف هذا التعليق؟')) return
    const e = await deleteComment(c.id)
    toast(e ? 'ما انحذف' : 'انحذف'); load()
  }

  return (
    <div className="cmts">
      {mod && (
        <div className="seg" style={{ marginBottom: 12 }}>
          <button className={tab === 'pending' ? 'on' : ''} onClick={() => setTab('pending')}>بانتظار الموافقة{pending.length > 0 && <span className="dotn">{pending.length}</span>}</button>
          <button className={tab === 'approved' ? 'on' : ''} onClick={() => setTab('approved')}>المنشورة</button>
          <button className={tab === 'hidden' ? 'on' : ''} onClick={() => setTab('hidden')}>المخفية{hidden.length > 0 && <span className="dotn" style={{ background: 'var(--mu)' }}>{hidden.length}</span>}</button>
        </div>
      )}
      {list === null && <div className="sk" style={{ height: 70, borderRadius: 16 }} />}
      {list && !shown.length && <Empty e="ask" t={mod && tab === 'pending' ? 'ماكو تعليقات تنتظر موافقتك' : 'ماكو تعليقات بعد'} />}
      <div className="stack">
        {shown.map((c) => (
          <div key={c.id} className={`cmt ${c.status}`}>
            <div className="cmt-h"><span className="av">{(c.name || 'ط').trim()[0]}</span><b>{c.name || 'طالب'}</b><span className="when">{ago(c.created_at)}</span></div>
            <p>{c.body}</p>
            {c.status === 'pending' && !mod && <div className="cmt-st"><I n="clock" size={13} />بانتظار موافقة المشرف، محد يشوفه غيرك هسه</div>}
            {c.reply && <div className="cmt-r"><I n="megaphone" size={13} /><span><b>رد الإدارة:</b> {c.reply}</span></div>}
            {reply?.id === c.id && (
              <div className="cmt-rf">
                <textarea className="input" value={reply.t} onChange={(e) => setReply({ ...reply, t: e.target.value.slice(0, 400) })} placeholder="اكتب ردك…" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn ac sm" disabled={!reply.t.trim()} onClick={() => act(c, { reply: reply.t.trim(), replied_at: new Date().toISOString(), status: 'approved' }, 'انشر الرد')}>نشر الرد</button>
                  <button className="btn ghost sm" onClick={() => setReply(null)}>إلغاء</button>
                </div>
              </div>
            )}
            {(mod || c.user_id === a.user?.id) && reply?.id !== c.id && (
              <div className="cmt-a">
                {mod && c.status !== 'approved' && <button className="btn soft sm" onClick={() => act(c, { status: 'approved' }, 'انشر التعليق')}><I n="check" size={15} />قبول</button>}
                {mod && c.status !== 'hidden' && <button className="btn ghost sm" onClick={() => act(c, { status: 'hidden' }, 'انخفى')}>إخفاء</button>}
                {mod && <button className="btn ghost sm" onClick={() => setReply({ id: c.id, t: c.reply || '' })}><I n="share" size={15} />رد</button>}
                <button className="btn ghost sm" onClick={() => del(c)} aria-label="حذف"><I n="trash" size={15} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
      {ann.comments_on === false ? (
        <p className="small muted center" style={{ marginTop: 14 }}>التعليقات مقفولة على هذا الإعلان.</p>
      ) : a.user ? (
        <div className="cmt-new">
          <textarea className="input" value={txt} maxLength={400} onChange={(e) => setTxt(e.target.value)} placeholder={mod ? 'اكتب تعليق (ينشر مباشرة)' : 'اكتب سؤالك أو تعليقك…'} />
          <button className="btn ac" disabled={busy || !txt.trim()} onClick={send} aria-label="إرسال"><I n="arrow" size={18} /></button>
        </div>
      ) : (
        <p className="small muted center" style={{ marginTop: 14 }}>سجّل دخولك من «حسابي» حتى تكدر تعلّق.</p>
      )}
      {!mod && a.user && <p className="small muted center" style={{ margin: '8px 0 0' }}>حتى نحافظ على احترام الكل، كل تعليق يمر على المشرف قبل ما ينشر.</p>}
    </div>
  )
}
