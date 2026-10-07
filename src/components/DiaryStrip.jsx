import { sticker } from './DiaryLayer'

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
const EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const AR = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d])
// جملة لطيفة لكل يوم من الأسبوع
const NOTES = ['خطوة صغيرة كل يوم تكفي', 'إنتِ أشطر مما تتخيلين', 'كوب قهوة وملزمة وننطلق', 'نص الأسبوع، كمّلي حلوة', 'آخر يوم دوام، شدّي حيلك', 'استراحة تستاهلينها', 'أسبوع جديد وصفحة جديدة']

// رأس صفحة الدفتر بالرئيسية: تاريخ اليوم بخط اليد، شريط لاصق، وملصقات
export function DiaryStrip() {
  const d = new Date()
  return (
    <div className="dia-strip" aria-hidden="true">
      <i className="tape t1" /><i className="tape t2" />
      <div className="date">
        <span className="hand">{EN[d.getDay()]} ♡</span>
        <b>{DAYS[d.getDay()]} {AR(d.getDate())} {MONTHS[d.getMonth()]}</b>
        <span className="note">{NOTES[d.getDay()]}</span>
      </div>
      <img className="k1" src={sticker('cloud')} alt="" />
      <img className="k2" src={sticker('strawberry')} alt="" />
      <img className="k3" src={sticker('star')} alt="" />
    </div>
  )
}
