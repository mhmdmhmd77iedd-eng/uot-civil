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
  const admin = isStaff(a)
  const [c, setC] = useState('all')
  const [mine, setMine] = useState(true)
  const [edit, setEdit] = useState(null)
  const [view, setView] = useState(null)
  const [qty, setQty] = useState(1)
  useEffect(() => { loadProducts().catch(() => {}) }, [])

  const all = s.products?.length ? s.products : SAMPLE
  const demo = !s.products?.length
  const list = useMemo(() => all.filter((p) => (c === 'all' || p.category === c) && (!mine || !p.stages?.length || p.stages.includes(s.profile.stage))), [all, c, mine, s.profile.stage])
  const used = new Set(all.map((p) => p.category))
  const open = (p) => { tap(); setQty(1); setView(p) }

  // طلب مباشر: منتج واحد بالكمية اللي يختارها الطالب، ورسالة جاهزة بالواتساب
  function order(p, q) {
    tap()
    const msg = `مرحباً، أريد أطلب من متجر تطبيق المدني:\n• ${p.name} × ${q} = ${iqd(p.price * q)}\n\nالاسم: ${s.profile.name || ''}\n${label(s.profile)}`
    window.open(`https://wa.me/${DEV.intl}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
  }

  return (
    <div className="screen">
      <Bar title="متجر المدني" sub="اختار المنتج واطلبه بالواتساب مباشرة" onBack={back}
        end={admin ? <button className="iconbtn ac" onClick={() => setEdit({})} aria-label="أضف منتج"><I n="plus" size={20} /></button> : null} />

      <div className="howto">
        <span><b>1</b>اختار المنتج</span><I n="chev" size={14} /><span><b>2</b>حدد الكمية</span><I n="chev" size={14} /><span><b>3</b>اطلب بالواتساب</span>
      </div>
      {demo && <div className="demo"><I n="info" size={18} style={{ color: 'var(--mid)', marginTop: 1 }} /><span>هذي منتجات مثال حتى يبين الشكل. المنتجات الحقيقية وأسعارها يضيفها المطوّر.</span></div>}

      <div className="chiprow">
        <button className={`chip ${c === 'all' ? 'on' : ''}`} onClick={() => { tap(); setC('all') }}>الكل</button>
        {STORE_CATS.filter((x) => used.has(x.id) || admin).map((x) => <button key={x.id} className={`chip ${c === x.id ? 'on' : ''}`} onClick={() => { tap(); setC(x.id) }}><I n={x.i} size={15} />{x.n}</button>)}
      </div>
      <label className="switchrow">
        <span>اعرض بس اللي يناسب مرحلتي</span>
        <input type="checkbox" className="sw" checked={mine} onChange={(e) => { tap(); setMine(e.target.checked) }} />
      </label>

      <div className="shop stagger">
        {list.map((p) => {
          const k = cat(p.category)
          const oos = p.in_stock === false
          return (
            <button key={p.id} className={`prod ${oos ? 'oosc' : ''}`} style={{ '--h': k.h }} onClick={() => (admin && !p.example ? setEdit(p) : open(p))}>
              <span className="ph">
                {p.image_url ? <img src={p.image_url} alt="" loading="lazy" /> : <I n={k.i} size={40} />}
                {oos && <span className="pill off oos">نفد</span>}
                {p.example && <span className="pill gold oos">مثال</span>}
                {p.old_price ? <span className="pill urgent disc">خصم</span> : null}
              </span>
              <span className="nm">{p.name}</span>
              <span className="pr">{iqd(p.price)}{p.old_price ? <s>{iqd(p.old_price)}</s> : null}</span>
              {admin && !p.example && <span className="small muted" style={{ display: 'flex', gap: 4, alignItems: 'center' }}><I n="pencil" size={13} />اضغط للتعديل</span>}
            </button>
          )
        })}
      </div>
      {!list.length && <Empty e="bag" t="ماكو منتجات بهذا القسم حالياً" />}

      <Sheet open={!!view} onClose={() => setView(null)} title={view?.name}>
        {view && (
          <>
            <div className="pview" style={{ '--h': cat(view.category).h }}>{view.image_url ? <img src={view.image_url} alt="" /> : <I n={cat(view.category).i} size={64} />}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <span className="pill">{cat(view.category).n}</span>
              <span className="pill gold">{view.stages?.length ? 'المرحلة ' + view.stages.map((x) => ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة'][x]).join(' و') : 'لكل المراحل'}</span>
              {view.in_stock === false && <span className="pill off">نفد حالياً</span>}
            </div>
            {view.description && <p style={{ whiteSpace: 'pre-wrap', color: 'var(--mu)', marginTop: 0 }}>{view.description}</p>}
            <div className="buybox">
              <div className="stepper"><button onClick={() => { tap(); setQty(Math.max(1, qty - 1)) }} aria-label="نقص"><I n="minus" size={16} /></button><b>{qty}</b><button onClick={() => { tap(); setQty(qty + 1) }} aria-label="زيد"><I n="plus" size={16} /></button></div>
              <div style={{ textAlign: 'left' }}><div className="small muted">المجموع</div><div className="big" style={{ fontSize: 24 }}>{iqd(view.price * qty)}</div></div>
            </div>
            <button className="btn wa full" disabled={view.in_stock === false} onClick={() => order(view, qty)}><I n="whatsapp" size={19} />اطلب بالواتساب</button>
            <p className="small muted center">ينفتح الواتساب برسالة جاهزة بطلبك إلى {DEV.phone}. التوصيل والدفع يتفق عليه هناك.</p>
          </>
        )}
      </Sheet>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'تعديل المنتج' : 'منتج جديد'}>
        {edit && <ProductForm init={edit.id ? edit : null} key={edit.id || 'new'} onDone={() => setEdit(null)} />}
      </Sheet>
    </div>
  )
}
