import { BRANCHES, STAGES, SHIFTS } from '../data/catalog'
export function label(p) {
  if (!p) return ''
  const st = STAGES.find((s) => s.id === p.stage)?.name || ''
  const br = p.branch ? BRANCHES.find((b) => b.id === p.branch)?.name : 'عام'
  const sh = SHIFTS.find((s) => s.id === p.shift)?.name || ''
  return [st, br, sh].filter(Boolean).join(' · ')
}
export function greeting() {
  const h = new Date().getHours()
  if (h < 5) return { t: 'سهرانين على الدراسة؟', i: 'moon' }
  if (h < 12) return { t: 'صباح الخير', i: 'sun' }
  if (h < 17) return { t: 'نهارك سعيد', i: 'sun' }
  return { t: 'مساء الخير', i: 'moon' }
}
export const currentSemester = () => { const m = new Date().getMonth() + 1; return m >= 9 || m <= 2 ? 1 : 2 }
