import { useEffect, useRef, useState } from 'react'
import { useStore, setState } from '../lib/store'
import { useAcct, isVerified, canModAnn, pinAnnouncement, deleteAnnouncement, commentCounts, fetchBoards, fetchComments, sb } from '../lib/sb'
import { STAGES } from '../data/catalog'
import { label } from '../lib/profile'
import { ago, dateLong } from '../lib/schedule'
import { BOARDS, boardOf, AnnForm, canPostTo } from './News'
import { Comments } from '../components/Comments'
import { I } from '../components/icons'
import { Sheet, tap, useToast } from '../components/ui'
import { soft } from '../lib/sound'

const DUR = 7000
const GAP = 1700

// التعليقات الموافق عليها تطير فوق الإعلان مثل البث المباشر، والضغط عليها يفتح التعليقات
function LiveComments({ ann, hold, onOpen, onHas }) {
  const cache = useRef({})
  const [list, setList] = useState([])
  const [shown, setShown] = useState([])
  const k = useRef(0)
  useEffect(() => {
    setShown([]); k.current = 0
    if (!ann || ann.comments_on === false) { setList([]); return }
    const hit = cache.current[ann.id]
    if (hit) { setList(hit); return }
    let dead = false
    fetchComments(ann.id).then((d) => { if (dead) return; const ok = (d || []).filter((c) => c.status === 'approved').slice(-20); cache.current[ann.id] = ok; setList(ok) }).catch(() => {})
    return () => { dead = true }
  }, [ann?.id])
  useEffect(() => {
    if (hold || !list.length) return
    const push = () => { const c = list[k.current % list.length]; const key = k.current++; setShown((a) => [...a.slice(-2), { key, c }]) }
    if (!k.current) push()
    const t = setInterval(push, list.length === 1 ? 5200 : GAP)
    return () => clearInterval(t)
  }, [list, hold])
  useEffect(() => { onHas(list.length > 0) }, [list.length])
  if (!list.length) return null
  return (
    <div className="sp-live">
      {shown.map(({ key, c }) => (
        <button key={key} className={`sp-bub h${key % 4}`} onClick={(e) => { e.stopPropagation(); onOpen() }}>
          <span className="av">{(c.name || 'ط').trim()[0]}</span>
          <span className="tx"><b>{c.name || 'طالب'}</b>{c.body}{c.reply && <em>رد: {c.reply}</em>}</span>
        </button>
      ))}
      <span className="sp-livecount"><i />{list.length} تعليق مباشر</span>
    </div>
  )
}
const EN = { stage: 'STAGE NEWS', section: 'SECTION BOARD', general: 'COLLEGE' }

// شاشة الإعلانات المميزة: لوحة ليلية مضيئة تتقلب وحدها، مثل شاشات الشوارع
export default function Spotlight({ back, nav, id }) {
  const s = useStore()
  const a = useAcct()
  const toast = useToast()
  const p = s.profile
  const all = (s.srvAnns || []).filter((x) => boardOf(x) !== 'section' || isVerified(a))
  const slides = [...all].sort((x, y) => (y.pinned - x.pinned) || (y.urgent - x.urgent) || (new Date(y.created_at) - new Date(x.created_at))).slice(0, 12)
  const start = Math.max(0, slides.findIndex((x) => x.id === id))
  const [i, setI] = useState(start)
  const [cm, setCm] = useState(false)
  const [post, setPost] = useState(false)
  const [counts, setCounts] = useState({})
  const [paused, setPaused] = useState(false)
  const [live, setLive] = useState(false)
  const t0 = useRef(Date.now())
  const x = slides[Math.min(i, slides.length - 1)]
  const hold = paused || cm || post
  const canPost = BOARDS.some((b) => canPostTo(b.id, a))

  useEffect(() => { commentCounts().then(setCounts).catch(() => {}) }, [s.srvAnns])
  useEffect(() => { t0.current = Date.now() }, [i])
  useEffect(() => {
    if (hold || slides.length < 2) return
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), DUR - Math.min(DUR - 500, Date.now() - t0.current))
    return () => clearTimeout(t)
  }, [i, hold, slides.length])
  useEffect(() => { if (x && !s.seenAnns?.['srv' + x.id]) markSeen(x) }, [x?.id])

  async function markSeen(y) {
    setState((st) => ({ seenAnns: { ...st.seenAnns, ['srv' + y.id]: true } }))
    if (a.user) try { await sb.from('announcement_seen').insert({ announcement_id: y.id, user_id: a.user.id }) } catch {}
  }
  const go = (d) => { soft(); setI((n) => (n + d + slides.length) % slides.length) }
  // لمس يمين/يسار للتنقل (الواجهة عربية: اليمين = السابق)
  const onTap = (e) => {
    if (e.target.closest('button')) return
    const r = e.currentTarget.getBoundingClientRect()
    go(e.clientX - r.left > r.width / 2 ? -1 : 1)
  }
  const sx = useRef(null)

  const b = x ? BOARDS.find((y) => y.id === boardOf(x)) : null
  const stageName = STAGES.find((y) => y.id === (x?.stage || p.stage))?.name
  const where = x ? { stage: stageName, section: label(p), general: 'كل الكلية' }[b.id] : ''
  const c = x ? counts[x.id] : null

  return (
    <div className={`spot ${live && x ? 'has-live' : ''}`} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerCancel={() => setPaused(false)}>
      <div className="sp-sky" /><div className="sp-floor" /><div className="sp-scan" />

      <div className="sp-top">
        <div className="sp-bars">{slides.map((y, k) => <i key={y.id} className={k < i ? 'done' : k === i ? 'now' : ''} style={k === i ? { animationDuration: `${DUR}ms`, animationPlayState: hold ? 'paused' : 'running' } : null} />)}</div>
        <div className="sp-head">
          <button className="sp-ic" onClick={back} aria-label="رجوع"><I n="back" size={20} /></button>
          <div className="sp-brand"><b>المدني</b><span>UOT CIVIL · {EN[b?.id] || 'BOARD'}</span></div>
          <button className="sp-ic" onClick={() => { tap(); fetchBoards(); toast('تحدّثت') }} aria-label="تحديث"><I n="history" size={19} /></button>
          {canPost && <button className="sp-ic ac" onClick={() => { tap(); setPost(true) }} aria-label="إعلان جديد"><I n="plus" size={20} /></button>}
        </div>
      </div>

      {x ? (
        <div className="sp-stage" onClick={onTap}
          onTouchStart={(e) => { sx.current = e.touches[0].clientX }}
          onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - (sx.current ?? 0); if (Math.abs(d) > 50) go(d > 0 ? 1 : -1); sx.current = null }}>
          <div className="sp-side">{(EN[b.id] + ' · ' + (x.stage || p.stage || '') + ' · UOT').trim()}</div>
          <article className={`sp-card ${x.urgent ? 'urgent' : ''}`} key={x.id}>
            <div className="sp-meta">
              <span className="sp-chip"><I n={b.i} size={14} />{b.n} · {where}</span>
              {x.urgent && <span className="sp-chip hot"><i />عاجل</span>}
              {x.pinned && <span className="sp-chip gold"><I n="spark" size={13} />مميز</span>}
            </div>
            <h2 className="sp-title">{x.title}</h2>
            <p className="sp-body">{x.body}</p>
            <div className="sp-foot">
              <span>{b.who}</span><span>{dateLong(new Date(x.created_at))}</span><span>{ago(x.created_at)}</span>
            </div>
          </article>
          <div className="sp-count"><b>{String(i + 1).padStart(2, '0')}</b>/{String(slides.length).padStart(2, '0')}</div>
        </div>
      ) : (
        <div className="sp-stage sp-empty">
          <div className="sp-card">
            <h2 className="sp-title">الشاشة فارغة هسه</h2>
            <p className="sp-body">أول ما ينشر ممثل المرحلة أو ممثل قسمك أو إدارة التطبيق إعلان، يضوي هنا.</p>
            {canPost && <button className="sp-btn" onClick={() => setPost(true)}><I n="plus" size={17} />انشر أول إعلان</button>}
          </div>
        </div>
      )}

      {x && <LiveComments ann={x} hold={hold} onHas={setLive} onOpen={() => { tap(); setCm(true) }} />}

      {x && (
        <div className="sp-actions">
          <button className="sp-btn" onClick={() => { tap(); setCm(true) }}><I n="ask" size={17} />التعليقات{c?.all ? ` (${c.all})` : ''}{canModAnn(x, a) && c?.pending ? <span className="sp-dot">{c.pending}</span> : null}</button>
          {canModAnn(x, a) && <button className={`sp-btn sq ${x.pinned ? 'on' : ''}`} onClick={async () => { tap(); const e = await pinAnnouncement(x.id, !x.pinned); toast(e ? 'ما صار' : x.pinned ? 'انشال التمييز' : 'صار مميز') }} aria-label="تمييز"><I n="spark" size={18} /></button>}
          {canModAnn(x, a) && <button className="sp-btn sq" onClick={async () => { if (!confirm('تحذف هذا الإعلان؟')) return; const e = await deleteAnnouncement(x.id); toast(e ? 'ما انحذف' : 'انحذف'); setI(0) }} aria-label="حذف"><I n="trash" size={18} /></button>}
          <button className="sp-btn sq" onClick={() => nav('news', { board: b.id })} aria-label="كل الإعلانات"><I n="grid" size={18} /></button>
        </div>
      )}

      <div className="sp-ticker" aria-hidden="true">
        <span className="sp-live"><i />مباشر</span>
        <div className="sp-run"><span>{(slides.length ? slides.map((y) => y.title) : ['المدني', 'شاشة الإعلانات']).join('   ◆   ')}&nbsp;&nbsp;&nbsp;◆&nbsp;&nbsp;&nbsp;{(slides.length ? slides.map((y) => y.title) : ['المدني', 'شاشة الإعلانات']).join('   ◆   ')}</span></div>
      </div>

      <Sheet open={cm} onClose={() => { setCm(false); commentCounts().then(setCounts).catch(() => {}) }} title={x ? `التعليقات · ${x.title}` : ''}>
        {cm && x && <Comments ann={x} />}
      </Sheet>
      <Sheet open={post} onClose={() => setPost(false)} title="إعلان جديد">
        {post && <AnnForm onDone={() => { setPost(false); setI(0) }} />}
      </Sheet>
    </div>
  )
}
