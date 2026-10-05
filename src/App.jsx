import { useEffect, useState, useCallback } from 'react'
import { useStore } from './lib/store'
import { ToastHost, Watermark, Footer, transition, tap } from './components/ui'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Library from './screens/Library'
import Course from './screens/Course'
import Upload from './screens/Upload'
import MapScreen from './screens/MapScreen'
import Calc from './screens/Calc'
import Schedule from './screens/Schedule'
import { checkReminders } from './lib/schedule'
import RepPanel from './screens/RepPanel'
import { startAuth } from './lib/sb'
import Requests from './screens/Requests'
import Settings from './screens/Settings'
import Developer from './screens/Developer'
import { I } from './components/icons'
import { News, Bologna, Exams } from './screens/Info'

const TABS = [
  { id: 'home', n: 'الرئيسية', i: 'home' },
  { id: 'schedule', n: 'جدولي', i: 'week' },
  { id: 'library', n: 'المكتبة', i: 'books' },
  { id: 'news', n: 'الإعلانات', i: 'bell' },
  { id: 'settings', n: 'حسابي', i: 'user' },
]

function useTheme(theme) {
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'auto' && mq.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
      document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#121518' : '#f7f5f0')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
}

export default function App() {
  const profile = useStore((s) => s.profile)
  const theme = useStore((s) => s.theme)
  useTheme(theme)
  const [stack, setStack] = useState([{ name: 'home', p: {} }])
  const cur = stack[stack.length - 1]

  const nav = useCallback((name, p = {}, replace = false) => {
    transition(() => {
      setStack((st) => {
        if (TABS.some((t) => t.id === name) && !Object.keys(p).length) return [{ name, p }]
        const next = replace ? [...st.slice(0, -1), { name, p }] : [...st, { name, p }]
        return next
      })
      scrollTo({ top: 0 })
    })
    if (!replace) history.pushState({ d: Date.now() }, '')
  }, [])
  const back = useCallback(() => history.back(), [])

  useEffect(() => { startAuth() }, [])

  // تنبيهات الكوزات والتقارير: نفحص كل دقيقة وعند فتح التطبيق
  useEffect(() => {
    if (!profile) return
    checkReminders()
    const t = setInterval(() => checkReminders(), 60000)
    const v = () => document.visibilityState === 'visible' && checkReminders()
    document.addEventListener('visibilitychange', v)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', v) }
  }, [profile])

  useEffect(() => {
    const onPop = () => transition(() => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)))
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  if (!profile) return <ToastHost><Watermark /><div className="app" style={{ paddingBottom: 0 }}><Onboarding /></div></ToastHost>

  const props = { ...cur.p, nav, back }
  const screens = {
    home: Home, library: Library, course: Course, upload: Upload, map: MapScreen, calc: Calc, schedule: Schedule, rep: RepPanel,
    requests: Requests, settings: Settings, developer: Developer, news: News, bologna: Bologna, exams: Exams,
    profile: () => <Onboarding initial={profile} onDone={back} />,
  }
  const S = screens[cur.name] || Home
  const tabOf = TABS.find((t) => t.id === cur.name)?.id || stack.find((x) => TABS.some((t) => t.id === x.name))?.name || 'home'

  return (
    <ToastHost>
      <Watermark />
      <div className="app">
        <S key={cur.name + JSON.stringify(cur.p)} {...props} />
        <Footer />
      </div>
      <nav className="nav no-print" aria-label="التنقل">
        {TABS.map((t) => (
          <button key={t.id} className={tabOf === t.id ? 'on' : ''} onClick={() => { tap(); nav(t.id) }} aria-current={tabOf === t.id}>
            <I n={t.i} size={23} /><span>{t.n}</span>
          </button>
        ))}
      </nav>
    </ToastHost>
  )
}
