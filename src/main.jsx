import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './neo.css'
import App from './App'
import './lib/install'
import { installSounds } from './lib/sound'
installSounds()

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // التحديث تلقائي: نفس الرابط، وأي نسخة جديدة تنزل للطلاب بدون ما يسوون شي
  const hadController = !!navigator.serviceWorker.controller
  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !reloaded) { reloaded = true; location.reload() } })
  addEventListener('load', () => navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}) })
  }).catch(() => {}))
}
