import { useState } from 'react'
import { useStore, setState } from '../lib/store'
import { useInstall } from '../lib/install'
import { I } from './icons'
import { Sheet, tap, useToast } from './ui'

export function IosGuide({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="ثبّت التطبيق على الآيفون">
      <div className="stack">
        <div className="row" style={{ cursor: 'default' }}><span className="ic">1</span><div><div className="t">اضغط زر المشاركة <I n="share" size={18} style={{ display: 'inline', verticalAlign: '-3px', color: 'var(--ac)' }} /></div><div className="m">بأسفل سفاري (أو أعلاه بالآيباد)</div></div></div>
        <div className="row" style={{ cursor: 'default' }}><span className="ic">2</span><div><div className="t">اختر «إضافة إلى الشاشة الرئيسية»</div><div className="m">انزل بالقائمة إذا ما شفته، وبعدها اضغط «إضافة»</div></div></div>
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>لازم تفتح الرابط من سفاري. بعد التثبيت يصير للتطبيق أيقونة، ويشتغل بدون نت، وتوصلك التنبيهات.</p>
      <button className="btn ac full" onClick={onClose}>تمام</button>
    </Sheet>
  )
}

// بطاقة الرئيسية: تختفي بعد التثبيت أو إذا الطالب سكّرها
export function InstallCard() {
  const hidden = useStore((s) => s.installHidden)
  const ins = useInstall()
  const toast = useToast()
  const [guide, setGuide] = useState(false)
  if (hidden || !ins.available) return null
  async function go() {
    tap()
    if (ins.can) { if (await ins.prompt()) toast('انثبت التطبيق') }
    else setGuide(true)
  }
  return (
    <>
      <div className="install">
        <span className="ic"><I n="install" size={22} /></span>
        <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 14 }}>ثبّت المدني على شاشتك</b><div className="small muted">يفتح أسرع، يشتغل بدون نت، وتوصلك التنبيهات.</div></div>
        <button className="btn warm sm" onClick={go}>تثبيت</button>
        <button className="x" onClick={() => setState({ installHidden: true })} aria-label="إخفاء"><I n="plus" size={18} style={{ transform: 'rotate(45deg)' }} /></button>
      </div>
      <IosGuide open={guide} onClose={() => setGuide(false)} />
    </>
  )
}
