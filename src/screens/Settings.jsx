import { useRef, useState } from 'react'
import { useStore, setState, exportBackupFile, importBackupFile, listBackups, restoreData, VERSION } from '../lib/store'
import { label } from '../lib/profile'
import { DEV, APP_NAME, DISCLAIMER } from '../lib/brand'
import { I, HUES } from '../components/icons'
import { Bar, Sheet, tap, useToast } from '../components/ui'

export function DevCard({ nav }) {
  const toast = useToast()
  const copy = async () => { tap(); try { await navigator.clipboard.writeText(DEV.phone); toast('انسخ الرقم') } catch { toast(DEV.phone) } }
  return (
    <div className="card">
      <button onClick={() => nav('developer')} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center', width: '100%' }}>
        <img className="avatar" src="dev/01-avatar-main.webp" alt={DEV.name} />
        <div style={{ minWidth: 0 }}>
          <div className="small muted">تصميم وتطوير</div>
          <b style={{ fontSize: 15.5, lineHeight: 1.4, display: 'block' }}>{DEV.name}</b>
          <div className="small muted">{DEV.services.join(' · ')}</div>
        </div>
      </button>
      <div className="grid2" style={{ marginTop: 14 }}>
        <a className="btn ac sm" href={`https://wa.me/${DEV.intl}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}><I n="whatsapp" size={17} />واتساب</a>
        <button className="btn soft sm" onClick={copy}><I n="copy" size={17} />نسخ الرقم {DEV.phone}</button>
      </div>
    </div>
  )
}

export default function Settings({ nav }) {
  const s = useStore()
  const toast = useToast()
  const file = useRef()
  const [bk, setBk] = useState(false)
  const [taps, setTaps] = useState(0)
  const themes = [{ id: 'auto', n: 'تلقائي' }, { id: 'light', n: 'فاتح' }, { id: 'dark', n: 'ليلي' }]

  async function imp(e) {
    const f = e.target.files?.[0]
    if (!f) return
    try { await importBackupFile(f); toast('رجعت بياناتك') } catch { toast('الملف مو نسخة احتياطية من التطبيق') }
    e.target.value = ''
  }
  // وضع المشرف مخفي: 5 ضغطات على رقم الإصدار
  function versionTap() {
    const n = taps + 1
    setTaps(n)
    if (n >= 5) { setState({ admin: !s.admin }); setTaps(0); toast(s.admin ? 'انطفى وضع المشرف' : 'انفتح وضع المشرف (تجريبي)') }
  }

  return (
    <div className="screen">
      <Bar title="حسابي والإعدادات" />
      <button className="row" onClick={() => nav('profile')}>
        <span className="ic"><I n="user" /></span><div><div className="t">{s.profile.name || 'طالب'}</div><div className="m">{label(s.profile)}</div></div><span className="end">تعديل</span>
      </button>

      <div className="sec">المظهر</div>
      <div className="tabs">{themes.map((t) => <button key={t.id} className={s.theme === t.id ? 'on' : ''} onClick={() => { tap(); setState({ theme: t.id }) }}>{t.n}</button>)}</div>

      <div className="sec">بياناتي</div>
      <div className="stack">
        <button className="row" onClick={() => { tap(); exportBackupFile(); toast('انحفظت النسخة') }} style={{ '--h': HUES.teal }}><span className="ic"><I n="download" /></span><div><div className="t">حفظ نسخة احتياطية</div><div className="m">ملف تنقله لأي جهاز ثاني</div></div></button>
        <button className="row" onClick={() => file.current.click()} style={{ '--h': HUES.ocean }}><span className="ic"><I n="upload" /></span><div><div className="t">استرجاع من ملف</div><div className="m">من جهاز ثاني أو نسخة قديمة</div></div></button>
        <button className="row" onClick={() => setBk(true)} style={{ '--h': HUES.indigo }}><span className="ic"><I n="history" /></span><div><div className="t">النسخ اليومية التلقائية</div><div className="m">آخر 7 أيام محفوظة على هذا الجهاز</div></div></button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={imp} />
      </div>
      <p className="small muted" style={{ margin: '8px 4px 0' }}>كل تغيير ينحفظ تلقائياً، حتى لو سكرت التطبيق فجأة.</p>

      {s.admin && (
        <>
          <div className="sec">أدوات المشرف</div>
          <div className="stack">
            <button className="row" onClick={() => nav('upload')} style={{ '--h': HUES.teal }}><span className="ic"><I n="upload" /></span><div><div className="t">رفع ملف</div><div className="m">مع منع المكرر تلقائياً</div></div></button>
            <button className="row" onClick={() => nav('exams')} style={{ '--h': HUES.sage }}><span className="ic"><I n="calendar" /></span><div><div className="t">جدول الامتحانات</div></div></button>
            <button className="row" onClick={() => nav('news')} style={{ '--h': HUES.plum }}><span className="ic"><I n="megaphone" /></span><div><div className="t">نشر إعلان</div></div></button>
            <button className="row" onClick={() => nav('requests')} style={{ '--h': HUES.clay }}><span className="ic"><I n="ask" /></span><div><div className="t">طلبات الطلاب</div><div className="m">تصدير إكسل من داخل الصفحة</div></div></button>
          </div>
        </>
      )}

      <div className="sec">عن التطبيق</div>
      <DevCard nav={nav} />
      <div className="card small" style={{ marginTop: 10 }}>
        <div><b>{APP_NAME}</b> · <span onClick={versionTap} style={{ cursor: 'default', userSelect: 'none' }}>الإصدار {VERSION}</span></div>
        <div className="muted">{DISCLAIMER}.</div>
        <div className="muted" style={{ marginTop: 4 }}>لتثبيته كتطبيق: من المتصفح اختر «إضافة إلى الشاشة الرئيسية».</div>
      </div>

      <Sheet open={bk} onClose={() => setBk(false)} title="النسخ اليومية">
        <div className="stack">
          {listBackups().map((b) => (
            <div key={b.day} className="row" style={{ cursor: 'default' }}>
              <span className="ic"><I n="history" /></span><div><div className="t">{b.day}</div><div className="m">{Object.keys(b.data.grades || {}).length} مادة بدرجات · {(b.data.requests || []).length} طلب</div></div>
              <button className="btn soft sm" onClick={() => { restoreData(b.data); setBk(false); toast(`رجعت نسخة ${b.day}`) }}>استرجاع</button>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
