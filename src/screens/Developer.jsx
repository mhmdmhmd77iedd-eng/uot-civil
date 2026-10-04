import { useState } from 'react'
import { DEV } from '../lib/brand'
import { Bar, tap, useToast } from '../components/ui'

const GAL = ['04-gallery-piano', '05-gallery-cafe', '06-gallery-call', '07-gallery-suit', '01-avatar-main']

export default function Developer({ back }) {
  const toast = useToast()
  const [big, setBig] = useState(null)
  const copy = async () => { tap(); try { await navigator.clipboard.writeText(DEV.phone); toast('انسخ الرقم ✓') } catch { toast(DEV.phone) } }
  const L = ({ href, icon, t, s }) => (
    <a className="row" href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
      <span className="ic">{icon}</span><div><div className="t">{t}</div><div className="m" dir="ltr" style={{ textAlign: 'right' }}>{s}</div></div><span className="chev" />
    </a>
  )
  return (
    <div className="screen">
      <Bar title="عن المطوّر" onBack={back} />
      <div className="devhero">
        <img src="dev/03-cover-teaching.webp" alt={DEV.name} />
        <div className="ov">
          <div style={{ fontSize: 12.5, opacity: .85 }}>تصميم وتطوير</div>
          <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.35 }}>{DEV.name}</div>
        </div>
      </div>

      <div className="sec">الخدمات</div>
      <div className="stack stagger">
        {[['🏗️', DEV.services[0]], ['📱', DEV.services[1]], ['📊', DEV.services[2]]].map(([e, t]) => (
          <div key={t} className="row" style={{ cursor: 'default' }}><span className="ic">{e}</span><div className="t">{t}</div></div>
        ))}
      </div>

      <div className="sec">تواصل</div>
      <div className="grid2" style={{ marginBottom: 10 }}>
        <a className="btn ac" href={`https://wa.me/${DEV.intl}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>واتساب</a>
        <button className="btn soft" onClick={copy}>نسخ الرقم</button>
      </div>
      <div className="stack">
        <L href={`tel:${DEV.phone}`} icon="📞" t="اتصال" s={DEV.phone} />
        {DEV.telegram.map((x) => <L key={x.user} href={`https://t.me/${x.user}`} icon="✈️" t={x.label} s={'@' + x.user} />)}
        {DEV.instagram.map((x) => <L key={x.user} href={`https://instagram.com/${x.user}`} icon="📸" t={x.label} s={'@' + x.user} />)}
      </div>

      <div className="sec">صور</div>
      <div className="gal">{GAL.map((g) => <img key={g} src={`dev/${g}.webp`} alt="" loading="lazy" onClick={() => setBig(g)} />)}</div>
      {big && <div className="lightbox" onClick={() => setBig(null)}><img src={`dev/${big}.webp`} alt="" /></div>}
    </div>
  )
}
