import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { chime } from '../lib/sound'
import { createPortal } from 'react-dom'
import { CREDIT, DEV, APP_NAME, DISCLAIMER } from '../lib/brand'
import { VERSION } from '../lib/store'
import { I } from './icons'

export const tap = () => { try { navigator.vibrate?.(8) } catch {} }

// تنقل مع انتقال ناعم بين الشاشات (View Transitions)
export function transition(fn) {
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(fn)
  else fn()
}

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastHost({ children }) {
  const [msg, setMsg] = useState(null)
  const show = useCallback((m) => { chime(); setMsg({ m, k: Date.now() }) }, [])
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t) }, [msg])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast" key={msg.k} role="status">{msg.m}</div>}
    </ToastCtx.Provider>
  )
}

export function Sheet({ open, onClose, children, title }) {
  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="grab" />
        {title && <div className="bar"><h2>{title}</h2></div>}
        {children}
      </div>
    </>,
    document.body
  )
}

export function Bar({ title, sub, onBack, end }) {
  return (
    <div className="bar">
      {onBack && <button className="iconbtn" onClick={() => { tap(); onBack() }} aria-label="رجوع"><I n="back" size={20} /></button>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2>{title}</h2>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {end}
    </div>
  )
}

export function Watermark() {
  return <div className="wm" aria-hidden="true"><span>{DEV.name}</span></div>
}

export function Footer() {
  return (
    <footer className="foot">
      <div>تصميم وتطوير <b>{DEV.name}</b> · <a href={`https://wa.me/${DEV.intl}`} target="_blank" rel="noreferrer">{DEV.phone}</a></div>
      <div>{APP_NAME} · الإصدار {VERSION}</div>
      <div style={{ opacity: .8 }}>{DISCLAIMER}</div>
    </footer>
  )
}

export function PrintFrame({ title }) {
  return (
    <>
      <div className="print-only print-head"><img src="icons/icon-192.png" alt="" /><div><b>{APP_NAME} · {title}</b><div className="small">{new Date().toLocaleDateString('ar-IQ')}</div></div></div>
      <div className="print-only print-foot">أُعدّ بتطبيق {APP_NAME} — {CREDIT}</div>
    </>
  )
}

export function Empty({ e = 'folder', t, children }) {
  return <div className="empty"><div className="e"><I n={e} size={30} /></div><div>{t}</div>{children}</div>
}
