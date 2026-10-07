import { sticker } from './DiaryLayer'

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
const EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
// تذكير لطيف لكل يوم من الأسبوع
const NOTES = ['خطوة صغيرة كل يوم تكفي', 'إنتِ أشطر مما تتخيلين', 'كوب قهوة وملزمة وننطلق', 'نص الأسبوع، كمّلي حلوة', 'آخر يوم دوام، شدّي حيلك', 'استراحة تستاهلينها', 'أسبوع جديد وصفحة جديدة']

// رأس صفحة الرئيسية بطريقة التصميم: شريط واشي «اليوم»، ملاحظة وردية بزاوية مطوية، وكرت تاريخ مايل
export function DiaryStrip() {
  const d = new Date()
  return (
    <div className="dia-strip" aria-hidden="true">
      <span className="washi">اليوم · اليوم · اليوم</span>
      <div className="note">
        <i className="tp" />
        <div className="kick">تذكير لطيف</div>
        <div className="msg">{NOTES[d.getDay()]}</div>
        <div className="sign">with love, juji <img src={sticker('heart')} alt="" /></div>
      </div>
      <div className="date">
        <span className="mo">{MONTHS[d.getMonth()]}</span>
        <span className="n">{d.getDate()}</span>
        <span className="dy">{DAYS[d.getDay()]}</span>
        <span className="en">{EN[d.getDay()]}</span>
      </div>
      <img className="k1" src={sticker('smile')} alt="" />
      <img className="k2" src={sticker('sparkle')} alt="" />
      <img className="k3" src={sticker('flower')} alt="" />
    </div>
  )
}
