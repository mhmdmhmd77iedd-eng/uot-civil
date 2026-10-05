import { useState } from 'react'
import { DEV } from '../lib/brand'
import { Bar, tap, useToast } from '../components/ui'
import { I, HUES } from '../components/icons'

const GAL = ['04-gallery-piano', '05-gallery-cafe', '06-gallery-call']
const SERVICES = [['build', HUES.clay], ['mobile', HUES.indigo], ['sheet', HUES.sage]]

export default function Developer({ back }) {
  const toast = useToast()
  const [big, setBig] = useState(null)
  const copy = async () => { tap(); try { await navigator.clipboard.writeText(DEV.phone); toast('انسخ الرقم') } catch { toast(DEV.phone) } }
  const L = ({ href, icon, hue, t, s }) => (
    <a className="row" href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', '--h': hue }}>
      <span className="ic"><I n={icon} /></span><div><div className="t">{t}</div><div className="m" dir="ltr" style={{ textAlign: 'right' }}>{s}</div></div><I n="chev" size={18} className="chev" />
    </a>
  )
  return (
    <div className="screen">
      <Bar title="عن المطوّر" onBack={back} />
      <div className="devhero">
        <div className="cover"><img src="dev/07-gallery-suit.webp" alt="" /></div>
        <div className="who">
          <img className="ava" src="dev/01-avatar-main.webp" alt={DEV.name} />
          <div className="role"><I n="hardhat" size={16} />تصميم وتطوير</div>
          <h2>{DEV.name}</h2>
          <div className="tags">{DEV.services.map((t) => <span key={t} className="pill">{t}</span>)}</div>
        </div>
      </div>

      <div className="sec">الخدمات</div>
      <div className="stack stagger">
        {SERVICES.map(([ic, hue], i) => (
          <div key={ic} className="row" style={{ cursor: 'default', '--h': hue }}><span className="ic"><I n={ic} /></span><div className="t">{DEV.services[i]}</div></div>
        ))}
      </div>

      <div className="sec">تواصل</div>
      <div className="grid2" style={{ marginBottom: 10 }}>
        <a className="btn ac" href={`https://wa.me/${DEV.intl}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}><I n="whatsapp" size={20} />واتساب</a>
        <button className="btn soft" onClick={copy}><I n="copy" size={20} />نسخ الرقم</button>
      </div>
      <div className="stack">
        <L href={`tel:${DEV.phone}`} icon="phone" hue={HUES.teal} t="اتصال" s={DEV.phone} />
        {DEV.telegram.map((x) => <L key={x.user} href={`https://t.me/${x.user}`} icon="plane" hue={HUES.ocean} t={x.label} s={'@' + x.user} />)}
        {DEV.instagram.map((x) => <L key={x.user} href={`https://instagram.com/${x.user}`} icon="camera" hue={HUES.plum} t={x.label} s={'@' + x.user} />)}
      </div>

      <div className="sec">صور</div>
      <div className="gal">{GAL.map((g) => <img key={g} src={`dev/${g}.webp`} alt="" loading="lazy" onClick={() => setBig(g)} />)}</div>
      {big && <div className="lightbox" onClick={() => setBig(null)}><img src={`dev/${big}.webp`} alt="" /></div>}
    </div>
  )
}
