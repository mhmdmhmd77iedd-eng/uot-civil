// قواعد مسار بولونيا (أكدها عبدالله 4 أكتوبر 2026)
// الدور الأول: سعي من 40 (حد دخول النهائي 14) + مد من 10 + نهائي من 50 = 100، النجاح 50
// الدور الثاني: المد ينضم للسعي فيصير من 50، والنهائي من 50
export const RULES = { saeeMax: 40, saeeMin: 14, midMax: 10, finalMax: 50, pass: 50 }

const clamp = (v, max) => Math.max(0, Math.min(max, Number(v) || 0))

export function calc({ saee, mid, round = 1 }) {
  const s = clamp(saee, RULES.saeeMax)
  const m = clamp(mid, RULES.midMax)
  const before = s + m
  const eligible = round === 2 ? true : s >= RULES.saeeMin
  const need = Math.max(0, RULES.pass - before)
  let status
  if (!eligible) status = 'blocked'
  else if (need === 0) status = 'safe'
  else if (need <= 20) status = 'easy'
  else if (need <= 35) status = 'work'
  else if (need <= RULES.finalMax) status = 'hard'
  else status = 'impossible'
  return { s, m, before, need, eligible, status, beforeMax: RULES.saeeMax + RULES.midMax }
}

export const STATUS_TEXT = {
  blocked: { t: 'سعيك أقل من 14، فما يحق لك دخول الدور الأول', tone: 'bad' },
  safe: { t: 'ناجح بمجموع السعي والمد، النهائي يرفع معدلك', tone: 'good' },
  easy: { t: 'قريب جداً، تحتاج درجة بسيطة بالنهائي', tone: 'good' },
  work: { t: 'ممكن بالتركيز والمراجعة المنظمة', tone: 'mid' },
  hard: { t: 'صعب لكن ممكن، ابدأ بالأسئلة السابقة من الآن', tone: 'mid' },
  impossible: { t: 'المطلوب أعلى من درجة النهائي، راجع الدور الثاني أو المعالجة', tone: 'bad' },
}
