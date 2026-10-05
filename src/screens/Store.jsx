import { useEffect, useMemo, useState } from 'react'
import { useStore, setState } from '../lib/store'
import { sb, useAcct, isStaff } from '../lib/sb'
import { DEV } from '../lib/brand'
import { label } from '../lib/profile'
import { I, HUES } from '../components/icons'
import { Bar, Empty, Sheet, tap, useToast } from '../components/ui'

export const STORE_CATS = [
  { id: 'laptop', n: 'لابتوبات', i: 'mobile', h: HUES.indigo },
  { id: 'drawing', n: 'أدوات رسم هندسي', i: 'pencil', h: HUES.ocean },
  { id: 'bag', n: 'جنط', i: 'folder', h: HUES.bronze },
  { id: 'safety', n: 'يلكات وسلامة', i: 'hardhat', h: HUES.amber },
  { id: 'grad', n: 'روبات تخرج', i: 'cap', h: HUES.plum },
  { id: 'calc', n: 'حاسبات', i: 'calc', h: HUES.teal },
  { id: 'other', n: 'غيرها', i: 'spark', h: HUES.clay },
]
const cat = (id) => STORE_CATS.find((c) => c.id === id) || STORE_CATS[6]
export const iqd = (n) => `${Number(n || 0).toLocaleString('en-US')} د.ع`

// أمثلة تظهر بس إذا المتجر فارغ (حتى يبين الشكل)
const SAMPLE = [
  { id: 'e1', name: 'شنطة أدوات رسم هندسي كاملة', category: 'drawing', stages: [1], price: 35000, example: true },
  { id: 'e2', name: 'يلك سلامة عاكس للمختبرات والمواقع', category: 'safety', stages: [], price: 10000, example: true },
  { id: 'e3', name: 'روب وقبعة تخرج مع وشاح', category: 'grad', stages: [4], price: 45000, example: true },
  { id: 'e4', name: 'حاسبة علمية Casio fx-991', category: 'calc', stages: [], price: 30000, example: true },
]

async function loadProducts() {
  const { data, error } = await sb.from('products').select('*').order('sort').order('created_at', { ascending: false })
  if (!error && data) setState({ products: data })
}

function ProductForm({ init, onDone }) {
  const toast = useToast()
  const [f, setF] = useState(init || { name: '', description: '', category: 'drawing', stages: [], price: '', old_price: '', in_stock: true, active: true })
  const [img, setImg] = useState(null)
  const [busy, setBusy] = useState(false)
  const ok = f.name.trim().length >= 2 && String(f.price).length
  const toggleStage = (s) => setF({ ...f, stages: f.stages.includes(s) ? f.stages.filter((x) => x !== s) : [...f.stages, s].sort() })
  async function save() {
    tap(); setBusy(true)
    try {
      let image_url = f.image_url || null, image_path = f.image_path || null
      if (img) {
        image_path = `p/${Date.now().toString(36)}.${(img.name.split('.').pop() || 'jpg').toLowerCase()}`
        const up = await sb.storage.from('products').upload(image_path, img, { contentType: img.type })
        if (up.error) throw up.error
        image_url = sb.storage.from('products').getPublicUrl(image_path).data.publicUrl
      }
      const row = { name: f.name.trim(), description: f.description?.trim() || null, category: f.category, stages: f.stages, price: Number(f.price) || 0, old_price: f.old_price ? Number(f.old_price) : null, in_stock: f.in_stock, active: f.active, image_url, image_path, updated_at: new Date().toISOString() }
      const r = init?.id ? await sb.from('products').update(row).eq('id', init.id) : await sb.from('products').insert(row)
      if (r.error) throw r.error
      await loadProducts(); toast('انحفظ'); onDone()
    } catch { toast('ما انحفظ. تأكد إنك مسجّل دخول كمطوّر أو مشرف') } finally { setBusy(false) }
  }
  async function del() {
    if (!init?.id) return
    setBusy(true)
    const r = await sb.from('products').delete().eq('id', init.id)
    setBusy(false)
    if (r.error) return toast('ما انحذف')
    await loadProducts(); toast('انحذف'); onDone()
  }
  const num = (k) => (e) => setF({ ...f, [k]: e.target.value.replace(/[^\d]/g, '') })
  return (
    <>
      <label className="field"><span>اسم المنتج *</span><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="مثلاً: لابتوب Lenovo IdeaPad i5" /></label>
      <div className="grid2">
        <label className="field"><span>السعر (دينار) *</span><input className="input" inputMode="numeric" value={f.price} onChange={num('price')} placeholder="250000" /></label>
        <label className="field"><span>السعر قبل الخصم</span><input className="input" inputMode="numeric" value={f.old_price || ''} onChange={num('old_price')} placeholder="اختياري" /></label>
      </div>
      <div className="field"><span>القسم</span>
        <div className="chips">{STORE_CATS.map((c) => <button key={c.id} className={`chip ${f.category === c.id ? 'on' : ''}`} onClick={() => setF({ ...f, category: c.id })}>{c.n}</button>)}</div>
      </div>
      <div className="field"><span>يناسب المرحلة (اتركها فارغة = الكل)</span>
        <div className="chips">{[1, 2, 3, 4].map((s) => <button key={s} className={`chip ${f.stages.includes(s) ? 'on' : ''}`} onClick={() => toggleStage(s)}>{['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة'][s]}</button>)}</div>
      </div>
      <label className="field"><span>الوصف</span><textarea className="input" value={f.description || ''} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="المواصفات، الألوان، الضمان…" /></label>
      <label className="field"><span>الصورة</span><input className="input" type="file" accept="image/*" onChange={(e) => setImg(e.target.files?.[0] || null)} /></label>
      <div className="chips" style={{ marginBottom: 14 }}>
        <button className={`chip ${f.in_stock ? 'on' : ''}`} onClick={() => setF({ ...f, in_stock: !f.in_stock })}>{f.in_stock ? 'متوفر' : 'نفد'}</button>
        <button className={`chip ${f.active ? 'on' : ''}`} onClick={() => setF({ ...f, active: !f.active })}>{f.active ? 'ظاهر للطلاب' : 'مخفي'}</button>
      </div>
      <button className="btn ac full" disabled={!ok || busy} onClick={save}>{busy ? 'جاري الحفظ…' : 'حفظ'}</button>
      {init?.id && <button className="btn danger full" style={{ marginTop: 10 }} disabled={busy} onClick={del}><I n="trash" size={18} />حذف المنتج</button>}
    </>
  )
}

export default function Store({ back }) {
  const s = useStore()
  const a = useAcct()
  const toast = useToast()
  const admin = isStaff(a)
  const [c, setC] = useState('all')
  const [mine, setMine] = useState(true)
  const [edit, setEdit] = useState(null)
  const [view, setView] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  useEffect(() => { loadProducts().catch(() => {}) }, [])

  const all = s.products?.length ? s.products : SAMPLE
  const demo = !s.products?.length
  const list = useMemo(() => all.filter((p) => (c === 'all' || p.category === c) && (!mine || !p.stages?.length || p.stages.includes(s.profile.stage))), [all, c, mine, s.profile.stage])
  const cart = s.cart || {}
  const items = Object.entries(cart).map(([id, q]) => ({ p: all.find((x) => String(x.id) === id), q })).filter((x) => x.p)
  const total = items.reduce((t, x) => t + x.p.price * x.q, 0)
  const setQ = (id, q) => setState((st) => { const n = { ...(st.cart || {}) }; if (q > 0) n[id] = q; else delete n[id]; return { cart: n } })

  function order(list) {
    tap()
    const lines = list.map((x) => `• ${x.p.name} × ${x.q} = ${iqd(x.p.price * x.q)}`)
    const sum = list.reduce((t, x) => t + x.p.price * x.q, 0)
    const msg = `مرحباً، أريد أطلب من متجر تطبيق المدني:\n${lines.join('\n')}\nالمجموع: ${iqd(sum)}\n\nالاسم: ${s.profile.name || ''}\n${label(s.profile)}`
    window.open(`https://wa.me/${DEV.intl}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
  }

  return (
    <div className="screen">
      <Bar title="متجر المدني" sub="تجهيزات الطالب، والطلب مباشرة على الواتساب" onBack={back}
        end={<button className="iconbtn" onClick={() => setCartOpen(true)} aria-label="السلة" style={{ position: 'relative' }}><I n="bag" size={20} />{items.length > 0 && <span className="badge">{items.reduce((t, x) => t + x.q, 0)}</span>}</button>} />

      {demo && <div className="demo"><I n="info" size={18} style={{ color: 'var(--mid)', marginTop: 1 }} /><span>هذي منتجات مثال حتى يبين الشكل. المنتجات الحقيقية وأسعارها يضيفها المطوّر.</span></div>}
      {admin && <button className="btn ac full" style={{ marginBottom: 12 }} onClick={() => setEdit({})}><I n="plus" size={19} />أضف منتج</button>}

      <div className="days" style={{ marginBottom: 8 }}>
        <button className={c === 'all' ? 'on' : ''} onClick={() => setC('all')} style={{ minWidth: 64 }}><b style={{ fontSize: 13 }}>الكل</b></button>
        {STORE_CATS.map((x) => <button key={x.id} className={c === x.id ? 'on' : ''} onClick={() => { tap(); setC(x.id) }} style={{ minWidth: 86 }}><I n={x.i} size={18} /><span style={{ whiteSpace: 'nowrap' }}>{x.n}</span></button>)}
      </div>
      <div className="chips" style={{ marginBottom: 12 }}>
        <button className={`chip ${mine ? 'on' : ''}`} onClick={() => setMine(true)}>لمرحلتي</button>
        <button className={`chip ${!mine ? 'on' : ''}`} onClick={() => setMine(false)}>كل المراحل</button>
      </div>

      <div className="shop stagger">
        {list.map((p) => {
          const k = cat(p.category)
          return (
            <div key={p.id} className="prod" style={{ '--h': k.h }}>
              <button className="ph" onClick={() => setView(p)} aria-label={p.name}>
                {p.image_url ? <img src={p.image_url} alt="" loading="lazy" /> : <I n={k.i} size={40} />}
                {!p.in_stock && p.in_stock !== undefined && <span className="pill off oos">نفد</span>}
                {p.example && <span className="pill gold oos">مثال</span>}
              </button>
              <div className="nm">{p.name}</div>
              <div className="pr">{iqd(p.price)}{p.old_price ? <s>{iqd(p.old_price)}</s> : null}</div>
              {admin && !p.example
                ? <button className="btn soft sm" onClick={() => setEdit(p)}><I n="pencil" size={16} />تعديل</button>
                : cart[p.id]
                  ? <div className="stepper" style={{ justifyContent: 'space-between' }}><button onClick={() => setQ(p.id, cart[p.id] - 1)} aria-label="نقص"><I n="minus" size={16} /></button><b style={{ fontSize: 18 }}>{cart[p.id]}</b><button onClick={() => setQ(p.id, cart[p.id] + 1)} aria-label="زيد"><I n="plus" size={16} /></button></div>
                  : <button className="btn ac sm" disabled={p.in_stock === false} onClick={() => { tap(); setQ(p.id, 1); toast('انضاف للسلة') }}><I n="plus" size={16} />أضف للسلة</button>}
            </div>
          )
        })}
      </div>
      {!list.length && <Empty e="bag" t="ماكو منتجات بهذا القسم حالياً" />}

      {items.length > 0 && (
        <button className="btn ac full cartbar" onClick={() => setCartOpen(true)}><I n="bag" size={19} />السلة · {iqd(total)}</button>
      )}

      <Sheet open={cartOpen} onClose={() => setCartOpen(false)} title="سلتي">
        {items.length ? (
          <>
            <div className="stack">
              {items.map(({ p, q }) => (
                <div key={p.id} className="row" style={{ cursor: 'default' }}>
                  <div style={{ minWidth: 0, flex: 1 }}><div className="t">{p.name}</div><div className="m">{iqd(p.price)} × {q}</div></div>
                  <div className="stepper"><button onClick={() => setQ(p.id, q - 1)} aria-label="نقص"><I n="minus" size={16} /></button><b style={{ fontSize: 18 }}>{q}</b><button onClick={() => setQ(p.id, q + 1)} aria-label="زيد"><I n="plus" size={16} /></button></div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '14px 4px', fontWeight: 600 }}><span>المجموع</span><span>{iqd(total)}</span></div>
            <button className="btn ac full" onClick={() => order(items)}><I n="whatsapp" size={19} />اطلب على الواتساب</button>
            <p className="small muted center">ينفتح الواتساب برسالة جاهزة بطلبك إلى {DEV.phone}. التوصيل والدفع يتفق عليه هناك.</p>
          </>
        ) : <Empty e="bag" t="سلتك فارغة" />}
      </Sheet>

      <Sheet open={!!view} onClose={() => setView(null)} title={view?.name}>
        {view && (
          <>
            {view.image_url && <img src={view.image_url} alt="" style={{ width: '100%', borderRadius: 16, marginBottom: 12 }} />}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <span className="pill">{cat(view.category).n}</span>
              <span className="pill gold">{view.stages?.length ? 'المرحلة ' + view.stages.map((x) => ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة'][x]).join(' و') : 'لكل المراحل'}</span>
            </div>
            <div className="big" style={{ fontSize: 28 }}>{iqd(view.price)}</div>
            {view.description && <p style={{ whiteSpace: 'pre-wrap', color: 'var(--mu)' }}>{view.description}</p>}
            <button className="btn ac full" style={{ marginTop: 12 }} disabled={view.in_stock === false} onClick={() => order([{ p: view, q: 1 }])}><I n="whatsapp" size={19} />اطلبه الآن على الواتساب</button>
          </>
        )}
      </Sheet>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'تعديل المنتج' : 'منتج جديد'}>
        {edit && <ProductForm init={edit.id ? edit : null} key={edit.id || 'new'} onDone={() => setEdit(null)} />}
      </Sheet>
    </div>
  )
}
