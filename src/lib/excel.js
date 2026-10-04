// تصدير إكسل منسّق من اليمين لليسار بمعادلات حقيقية، وبأسفله توقيع التطبيق
import { EXPORT_FOOTER, APP_NAME } from './brand'

async function save(wb, name) {
  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 3000)
}

function sheet(wb, title, cols) {
  const ws = wb.addWorksheet(title, { views: [{ rightToLeft: true, state: 'frozen', ySplit: 3 }] })
  ws.columns = cols.map((c) => ({ width: c.w }))
  ws.mergeCells(1, 1, 1, cols.length)
  const t = ws.getCell(1, 1)
  t.value = title
  t.font = { bold: true, size: 15, color: { argb: 'FFFFFFFF' }, name: 'Arial' }
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F6E69' } }
  t.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 30
  ws.getRow(2).height = 6
  const h = ws.getRow(3)
  cols.forEach((c, i) => {
    const cell = h.getCell(i + 1)
    cell.value = c.h
    cell.font = { bold: true, name: 'Arial', color: { argb: 'FF1E2125' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3EFEC' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = { bottom: { style: 'thin', color: { argb: 'FF2F6E69' } } }
  })
  h.height = 24
  return ws
}

function footer(ws, row, span) {
  ws.mergeCells(row, 1, row, span)
  const f = ws.getCell(row, 1)
  f.value = EXPORT_FOOTER
  f.font = { italic: true, size: 9, color: { argb: 'FF7A7F87' }, name: 'Arial' }
  f.alignment = { horizontal: 'center' }
}

const border = { style: 'hair', color: { argb: 'FFD9D6CF' } }

export async function exportGrades(rows, profileLabel) {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  wb.creator = APP_NAME
  const cols = [
    { h: 'المادة', w: 32 }, { h: 'السعي (من 40)', w: 13 }, { h: 'المد (من 10)', w: 12 },
    { h: 'المجموع قبل النهائي', w: 16 }, { h: 'المطلوب بالنهائي للنجاح', w: 18 }, { h: 'الحالة', w: 26 },
  ]
  const ws = sheet(wb, `درجاتي · ${profileLabel}`, cols)
  rows.forEach((r, i) => {
    const n = i + 4
    ws.getCell(n, 1).value = r.name
    ws.getCell(n, 2).value = Number(r.saee) || 0
    ws.getCell(n, 3).value = Number(r.mid) || 0
    ws.getCell(n, 4).value = { formula: `B${n}+C${n}` }
    ws.getCell(n, 5).value = { formula: `MAX(0,50-D${n})` }
    ws.getCell(n, 6).value = { formula: `IF(B${n}<14,"غير مؤهل للدور الأول",IF(E${n}=0,"ناجح قبل النهائي",IF(E${n}>50,"غير ممكن بالدور الأول","ممكن")))` }
    for (let c = 1; c <= 6; c++) {
      const cell = ws.getCell(n, c)
      cell.font = { name: 'Arial', size: 11 }
      cell.alignment = { horizontal: c === 1 ? 'right' : 'center', vertical: 'middle' }
      cell.border = { bottom: border }
      if (i % 2) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F5F0' } }
    }
  })
  const last = rows.length + 3
  const tot = last + 1
  ws.getCell(tot, 1).value = 'المعدل'
  ws.getCell(tot, 1).font = { bold: true, name: 'Arial' }
  ;[2, 3, 4, 5].forEach((c) => {
    const L = String.fromCharCode(64 + c)
    const cell = ws.getCell(tot, c)
    cell.value = rows.length ? { formula: `ROUND(AVERAGE(${L}4:${L}${last}),1)` } : 0
    cell.font = { bold: true, name: 'Arial' }
    cell.alignment = { horizontal: 'center' }
    cell.border = { top: { style: 'thin', color: { argb: 'FF2F6E69' } } }
  })
  footer(ws, tot + 2, 6)
  await save(wb, `درجاتي-${APP_NAME}.xlsx`)
}

export async function exportRequests(rows) {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  const cols = [{ h: 'المادة', w: 30 }, { h: 'النوع', w: 16 }, { h: 'التفاصيل', w: 40 }, { h: 'عدد الطلاب', w: 12 }, { h: 'الحالة', w: 14 }, { h: 'التاريخ', w: 14 }]
  const ws = sheet(wb, 'طلبات الملفات', cols)
  rows.forEach((r, i) => {
    const n = i + 4
    ;[r.course, r.type, r.note, r.votes, r.done ? 'تم التوفير' : 'بانتظار', r.at].forEach((v, c) => {
      const cell = ws.getCell(n, c + 1)
      cell.value = v
      cell.font = { name: 'Arial' }
      cell.alignment = { horizontal: c === 2 || c === 0 ? 'right' : 'center', wrapText: true }
      cell.border = { bottom: border }
    })
  })
  const t = rows.length + 4
  ws.getCell(t, 3).value = 'المجموع'
  ws.getCell(t, 4).value = rows.length ? { formula: `SUM(D4:D${t - 1})` } : 0
  ws.getCell(t, 5).value = rows.length ? { formula: `COUNTIF(E4:E${t - 1},"بانتظار")&" بانتظار"` } : ''
  footer(ws, t + 2, 6)
  await save(wb, `طلبات-${APP_NAME}.xlsx`)
}
