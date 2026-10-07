import { useEffect, useState, useCallback, useRef } from 'react'
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
import Store from './screens/Store'
import Quotes, { QuoteBand } from './screens/Quotes'
import Spotlight from './screens/Spotlight'
import RegForm from './screens/RegForm'
import { startAuth } from './lib/sb'
import Requests from './screens/Requests'
import Settings from './screens/Settings'
import Developer from './screens/Developer'
import { I } from './components/icons'
import { Bologna } from './screens/Info'
import News, { unseenCount } from './screens/News'
import Exams from './screens/Exams'
import DevPanel from './screens/DevPanel'
import NeoLayer from './components/NeoLayer'
import DiaryLayer from './components/DiaryLayer'
import { WORLDS } from './lib/store'

const TABS = [
  { id: 'home', n: 'الرئيسية', i: 'home' },
  { id: 'schedule', n: 'جدولي', i: 'week' },
  { id: 'library', n: 'المكتبة', i: 'books' },
  { id: 'news', n: 'الإعلانات', i: 'megaphone' },
  { id: 'settings', n: 'حسابي', i: 'user' },
]

function useTheme(theme) {
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      // «طوكيو 2050» عالم ليلي فوق الوضع الداكن، و«دفتري» عالم نهاري فوق الوضع الفاتح
      const world = WORLDS.includes(theme) ? theme : null
      const dark = world ? world === 'neo' : theme === 'dark' || (theme === 'auto' && mq.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
      if (world) document.documentElement.dataset.world = world; else delete document.documentElement.dataset.world
      document.querySelector('meta[name=theme-color]')?.setAttribute('content', world === 'neo' ? '#06070f' : world === 'diary' ? '#fbefed' : dark ? '#121518' : '#f7f5f0')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
}

export default function App() {
  const profile = useStore((s) => s.profile)
  const unseen = useStore(unseenCount)
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
  // الرجوع: إذا ماكو صفحة قبلها (مثل الإعلانات من الشريط السفلي) يرجع للرئيسية
  const stackRef = useRef(stack)
  stackRef.current = stack
  const back = useCallback(() => {
    const st = stackRef.current
    if (st.length > 1) history.back()
    else if (st[0].name !== 'home') transition(() => { setStack([{ name: 'home', p: {} }]); scrollTo({ top: 0 }) })
  }, [])

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
    const onPop = () => transition(() => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st[0].name !== 'home' ? [{ name: 'home', p: {} }] : st)))
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  if (!profile) return <ToastHost><Watermark /><div className="app" style={{ paddingBottom: 0 }}><Onboarding /></div></ToastHost>

  const props = { ...cur.p, nav, back }
  const screens = {
    home: Home, library: Library, course: Course, upload: Upload, map: MapScreen, calc: Calc, schedule: Schedule, rep: RepPanel, store: Store, quotes: Quotes,
    requests: Requests, settings: Settings, developer: Developer, news: News, bologna: Bologna, exams: Exams, devpanel: DevPanel, spotlight: Spotlight, regform: RegForm,
    profile: () => <Onboarding initial={profile} onDone={back} />,
  }
  const S = screens[cur.name] || Home
  const tabOf = TABS.find((t) => t.id === cur.name)?.id || stack.find((x) => TABS.some((t) => t.id === x.name))?.name || 'home'

  return (
    <ToastHost>
      <Watermark />
      <NeoLayer />
      <DiaryLayer />
      <div className="app">
        <S key={cur.name + JSON.stringify(cur.p)} {...props} />
        {!['home', 'quotes', 'spotlight'].includes(cur.name) && <QuoteBand seed={cur.name} nav={nav} />}
        <Footer />
      </div>
      <nav className={`nav no-print ${cur.name === 'spotlight' ? 'gone' : ''}`} aria-label="التنقل">
        {TABS.map((t) => (
          <button key={t.id} className={tabOf === t.id ? 'on' : ''} onClick={() => { tap(); nav(t.id) }} aria-current={tabOf === t.id}>
            <I n={t.i} size={23} /><span>{t.n}</span>{t.id === 'news' && unseen > 0 && <b className="navdot">{unseen > 9 ? '9+' : unseen}</b>}
          </button>
        ))}
      </nav>
    </ToastHost>
  )
}
