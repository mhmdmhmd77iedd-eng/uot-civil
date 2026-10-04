import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { CREDIT, DEV, APP_NAME, DISCLAIMER } from '../lib/brand'
import { VERSION } from '../lib/store'

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
  const show = useCallback((m) => { setMsg({ m, k: Date.now() }) }, [])
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
  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="grab" />
        {title && <div className="bar"><h2>{title}</h2></div>}
        {children}
      </div>
    </>
  )
}

export function Bar({ title, sub, onBack, end }) {
  return (
    <div className="bar">
      {onBack && <button className="iconbtn" onClick={() => { tap(); onBack() }} aria-label="رجوع">→</button>}
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

export function Empty({ e = '🗂️', t, children }) {
  return <div className="empty"><div className="e">{e}</div><div>{t}</div>{children}</div>
}

export const Icon = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>,
  lib: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13.5"/></svg>,
  tools: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15v2"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>,
  me: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>,
}
