import { useMemo, useState } from 'react'
import { useStore, setState } from '../lib/store'
import { QUOTES, QUOTE_CATS } from '../data/quotes'
import { I } from '../components/icons'
import { Bar, Empty, tap, useToast } from '../components/ui'

// اقتباس اليوم: نفس الاقتباس لكل الطلاب باليوم الواحد، ويتغير كل يوم
export function quoteOfDay(d = new Date()) {
  const day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5) + d.getFullYear() * 400
  return QUOTES[(day * 7919) % QUOTES.length]
}
const catName = (c) => QUOTE_CATS.find((x) => x.id === c)?.n || ''

async function share(q, toast) {
  const text = `«${q.t}»\n— ${q.a}\n\nمن تطبيق المدني`
  try {
    if (navigator.share) await navigator.share({ text })
    else { await navigator.clipboard.writeText(text); toast('انسخ الاقتباس') }
  } catch {}
}

export function QuoteCard({ q, fav, onFav, compact }) {
  const toast = useToast()
  return (
    <div className="qcard">
      <I n="quote" size={compact ? 26 : 30} className="qi" />
      <div className="qt" style={compact ? { fontSize: 15.5 } : null}>{q.t}</div>
      <div className="qa">
        <span style={{ flex: 1, minWidth: 0 }}>— <b>{q.a}</b>{!compact && <span className="pill off" style={{ marginInlineStart: 6 }}>{catName(q.c)}</span>}</span>
        {onFav && <button className="x" style={{ background: 'none', border: 'none', cursor: 'pointer', color: fav ? 'var(--bad)' : 'var(--mu)', padding: 4 }} onClick={() => { tap(); onFav() }} aria-label="مفضلة"><I n="heart" size={19} style={fav ? { fill: 'currentColor' } : null} /></button>}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mu)', padding: 4 }} onClick={() => { tap(); share(q, toast) }} aria-label="مشاركة"><I n="share" size={19} /></button>
      </div>
    </div>
  )
}

// اقتباس قصير أسفل كل صفحة: يتغير حسب الصفحة واليوم
const SHORT = QUOTES.filter((q) => q.t.length <= 110)
export function quoteFor(seed, d = new Date()) {
  const day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5) + d.getFullYear() * 400
  const h = [...String(seed)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100003, 7)
  return SHORT[(day * 131 + h * 977) % SHORT.length]
}
export function QuoteBand({ seed, nav }) {
  const q = quoteFor(seed)
  if (!q) return null
  return (
    <button className="qband no-print" onClick={() => { tap(); nav('quotes') }} aria-label="اقتباسات">
      <I n="quote" size={18} className="qi" />
      <span className="qt">{q.t}</span>
      <span className="qa">{q.a}</span>
    </button>
  )
}

export function QuoteOfDay({ nav }) {
  const { favQuotes } = useStore()
  const q = quoteOfDay()
  if (!q) return null
  return (
    <>
      <div className="sec">اقتباس اليوم <button onClick={() => nav('quotes')}>المزيد</button></div>
      <QuoteCard q={q} compact fav={favQuotes?.[q.t]} onFav={() => setState((s) => ({ favQuotes: { ...s.favQuotes, [q.t]: !s.favQuotes?.[q.t] } }))} />
    </>
  )
}

export default function Quotes({ back }) {
  const { favQuotes } = useStore()
  const [c, setC] = useState('all')
  const [seed, setSeed] = useState(() => Math.random())
  const fav = favQuotes || {}
  const list = useMemo(() => {
    const base = c === 'fav' ? QUOTES.filter((q) => fav[q.t]) : c === 'all' ? QUOTES : QUOTES.filter((q) => q.c === c)
    // ترتيب عشوائي ثابت لحين الضغط على «غيرها»
    return base.map((q, i) => [Math.sin(i * 9301 + seed * 49297) % 1, q]).sort((a, b) => a[0] - b[0]).map((x) => x[1])
  }, [c, seed, c === 'fav' ? fav : null])
  const [n, setN] = useState(20)
  const toggle = (q) => setState((s) => ({ favQuotes: { ...s.favQuotes, [q.t]: !s.favQuotes?.[q.t] } }))
  return (
    <div className="screen">
      <Bar title="اقتباسات" sub={`${QUOTES.length} اقتباس من فلاسفة وشعراء وكتّاب، عرب وأجانب`} onBack={back}
        end={<button className="iconbtn" onClick={() => { tap(); setSeed(Math.random()); setN(20) }} aria-label="غيرها"><I n="history" size={20} /></button>} />
      <div className="chips" style={{ marginBottom: 14 }}>
        <button className={`chip ${c === 'all' ? 'on' : ''}`} onClick={() => { setC('all'); setN(20) }}>الكل</button>
        {QUOTE_CATS.map((x) => <button key={x.id} className={`chip ${c === x.id ? 'on' : ''}`} onClick={() => { tap(); setC(x.id); setN(20) }}>{x.n}</button>)}
        <button className={`chip ${c === 'fav' ? 'on' : ''}`} onClick={() => { setC('fav'); setN(20) }}><I n="heart" size={15} />مفضلتي</button>
      </div>
      <div className="stack">
        {list.slice(0, n).map((q) => <QuoteCard key={q.t} q={q} fav={fav[q.t]} onFav={() => toggle(q)} />)}
      </div>
      {list.length > n && <button className="btn soft full" style={{ marginTop: 14 }} onClick={() => setN(n + 20)}>عرض المزيد</button>}
      {!list.length && <Empty e="heart" t="ما عندك اقتباسات بالمفضلة بعد. اضغط القلب على أي اقتباس يعجبك." />}
    </div>
  )
}
