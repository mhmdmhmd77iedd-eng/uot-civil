import { BOLOGNA_FAQ, BOLOGNA_NOTE } from '../data/content'
import { I } from '../components/icons'
import { Bar } from '../components/ui'

export function Bologna({ back }) {
  return (
    <div className="screen">
      <Bar title="دليل بولونيا" sub="أكثر الأسئلة تكراراً، بكلام بسيط" onBack={back} />
      <div className="demo"><I n="info" size={18} style={{ color: 'var(--mid)', marginTop: 1 }} /><span>{BOLOGNA_NOTE}</span></div>
      <div className="stack stagger">
        {BOLOGNA_FAQ.map((x, i) => <details key={i} className="faq"><summary>{x.q}</summary><p>{x.a}</p></details>)}
      </div>
    </div>
  )
}
