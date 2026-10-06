// الفروع والمواد: من مخطط بكالوريوس المدني 2023/2024 (مسار بولونيا) ومن خطط الفروع
export const BRANCHES = [
  { id: 'str', name: 'الهندسة الإنشائية', en: 'Structural' },
  { id: 'cem', name: 'هندسة وإدارة المشاريع', en: 'Construction Management' },
  { id: 'san', name: 'الهندسة الصحية والبيئية', en: 'Sanitary & Environmental' },
  { id: 'hwy', name: 'هندسة الطرق والجسور', en: 'Highways & Bridges' },
  { id: 'wat', name: 'الموارد المائية والمنشآت الهيدروليكية', en: 'Water Resources' },
  { id: 'geo', name: 'هندسة الجيوماتك', en: 'Geomatics' },
]

export const STAGES = [
  { id: 1, name: 'المرحلة الأولى' },
  { id: 2, name: 'المرحلة الثانية' },
  { id: 3, name: 'المرحلة الثالثة' },
  { id: 4, name: 'المرحلة الرابعة' },
]

export const SHIFTS = [
  { id: 'am', name: 'صباحي' },
  { id: 'pm', name: 'مسائي' },
]

// c(code, اسم عربي, English, المرحلة, الفصل, الوحدات, الفروع) ؛ الفروع فارغة = لكل الفروع
const c = (code, name, en, stage, sem, ects, branches = null, id = code) => ({ id, code, name, en, stage, sem, ects, branches })

export const COURSES = [
  // المرحلة الأولى (موحدة)
  c('PHEN111', 'فيزياء للمهندسين', 'Physics for Engineers', 1, 1, 6),
  c('ENMS112', 'ميكانيك هندسي: ستاتيك', 'Eng. Mechanics - Statics', 1, 1, 6),
  c('COMA113', 'المواد الإنشائية', 'Construction Materials', 1, 1, 4),
  c('ENDR114', 'الرسم الهندسي', 'Engineering Drawing', 1, 1, 5),
  c('COMP108', 'الحاسوب 1', 'Computer 1', 1, 1, 3),
  c('WSHE106', 'الورش', 'Workshops', 1, 1, 4),
  c('WSHE106', 'الورش (الفصل الثاني)', 'Workshops', 1, 2, 4, null, 'WSHE106B'),
  c('ENLA107', 'اللغة الإنكليزية 1', 'English Language 1', 1, 1, 2),
  c('MATH122', 'الرياضيات 1', 'Mathematics 1', 1, 2, 8),
  c('ENMD123', 'ميكانيك هندسي: داينمك', 'Eng. Mechanics - Dynamics', 1, 2, 4),
  c('COAG124', 'الرسم بالحاسوب', 'Computer Aided Graphics', 1, 2, 3),
  c('CHEM121', 'الكيمياء', 'Chemistry', 1, 2, 9),
  c('DEHR105', 'الديمقراطية وحقوق الإنسان', 'Democracy & Human Rights', 1, 2, 2),
  // المرحلة الثانية
  c('MATH211', 'الرياضيات 2', 'Mathematics 2', 2, 1, 7),
  c('STMA212', 'مقاومة المواد 1', 'Strength of Materials 1', 2, 1, 5),
  c('PLSU213', 'المساحة المستوية', 'Plane Surveying', 2, 1, 3),
  c('BUCO214', 'إنشاء المباني', 'Building Construction', 2, 1, 4),
  c('FLME215', 'ميكانيك الموائع', 'Fluid Mechanics', 2, 1, 3),
  c('PRSE216', 'الاحتمالية والإحصاء', 'Probability & Statistics', 2, 1, 6),
  c('CBRI201', 'جرائم البعث', 'Crimes of the Baath Regime', 2, 1, 2),
  c('STMA222', 'مقاومة المواد 2', 'Strength of Materials 2', 2, 2, 3),
  c('TOSU221', 'المساحة الطوبوغرافية', 'Topographic Surveying', 2, 2, 4),
  c('HYHY223', 'الهيدرولوجي والهيدروليك', 'Hydrology & Hydraulics', 2, 2, 4),
  c('ENGE224', 'الجيولوجيا الهندسية', 'Engineering Geology', 2, 2, 4),
  c('COTE225', 'تكنولوجيا الخرسانة', 'Concrete Technology', 2, 2, 5),
  c('ENEC226', 'الاقتصاد الهندسي', 'Engineering Economics', 2, 2, 3),
  c('ENLA207', 'اللغة الإنكليزية 2', 'English Language 2', 2, 2, 2),
  c('COMP208', 'الحاسوب 2', 'Computer 2', 2, 2, 3),
  c('ARLA204', 'اللغة العربية 1', 'Arabic Language 1', 2, 2, 2),
  // المرحلة الثالثة (مشتركة)
  c('GESM311', 'الجيوماتك والقياسات المكانية', 'Geomatics & Spatial Measurements', 3, 1, 4),
  c('SOME312', 'ميكانيك التربة', 'Soil Mechanics', 3, 1, 6),
  c('ENAN313', 'التحليل الهندسي', 'Engineering Analysis', 3, 1, 7),
  c('STAN314', 'التحليل الإنشائي 1', 'Structural Analysis 1', 3, 1, 3),
  c('ASEE315', 'الهندسة الصحية والبيئية', 'Sanitary & Environmental Eng.', 3, 1, 5),
  c('SDRC316', 'الخرسانة المسلحة 1', 'Reinforced Concrete 1', 3, 1, 3),
  c('APNA321', 'التحليل العددي التطبيقي', 'Applied Numerical Analysis', 3, 2, 8),
  c('HITE322', 'هندسة الطرق والنقل', 'Highway & Transportation Eng.', 3, 2, 6),
  c('STAN323', 'التحليل الإنشائي 2', 'Structural Analysis 2', 3, 2, 4),
  c('SDRC324', 'الخرسانة المسلحة 2', 'Reinforced Concrete 2', 3, 2, 4),
  c('ARLA304', 'اللغة العربية 2', 'Arabic Language 2', 3, 1, 2),
  // المرحلة الرابعة (مشتركة)
  c('QUSU411', 'حساب الكميات', 'Quantity Survey', 4, 1, 5),
  c('PREE411', 'أخلاقيات المهنة وريادة الأعمال', 'Professional Ethics', 4, 1, 2),
  c('FOEN412', 'هندسة الأسس', 'Foundation Engineering', 4, 1, 6),
  c('STDS413', 'تصميم المنشآت الحديدية', 'Structural Design - Steel', 4, 1, 5),
  c('SPCE404', 'مشروع التخرج', 'Senior Project', 4, 1, 6),
  c('SPCE404', 'مشروع التخرج (الفصل الثاني)', 'Senior Project', 4, 2, 6, null, 'SPCE404B'),
  c('DEFO421', 'الأسس العميقة', 'Deep Foundations', 4, 2, 6),
  c('COPM422', 'إدارة المشاريع الإنشائية', 'Construction Project Management', 4, 2, 5),
  // مواد خاصة بالفروع (اختيارية الفرع)
  c('WAT-HS', 'المنشآت الهيدروليكية', 'Hydraulic Structures', 3, 1, 5, ['wat']),
  c('WAT-EH', 'الهيدرولوجي الهندسي', 'Engineering Hydrology', 3, 2, 4, ['wat']),
  c('WAT-HM', 'المكائن والمعدات الهيدروليكية', 'Hydraulic Equipment & Machines', 3, 2, 4, ['wat']),
  c('WAT-WQ', 'السيطرة على نوعية المياه', 'Water Quality Control', 3, 2, 4, ['wat']),
  c('WAT-DM', 'تصميم وتشغيل وسلامة السدود', 'Dams Design, Operation & Safety', 4, 1, 5, ['wat']),
  c('WAT-ID', 'هندسة الري والبزل', 'Irrigation & Drainage', 4, 1, 5, ['wat']),
  c('WAT-ES', 'المنشآت الترابية', 'Earth Structures', 4, 2, 4, ['wat']),
  c('WAT-ME', 'إدارة واقتصاد الموارد المائية', 'Water Resources Management', 4, 2, 4, ['wat']),
  c('STR-AS', 'مقاومة المواد المتقدمة', 'Advanced Strength of Materials', 3, 1, 4, ['str']),
  c('STR-MC', 'طرق الإنشاء', 'Methods of Construction', 3, 2, 4, ['str']),
  c('STR-PS', 'الخرسانة مسبقة الجهد', 'Pre-stressed Concrete', 4, 1, 5, ['str']),
  c('STR-SD', 'ديناميك المنشآت', 'Structural Dynamics', 4, 2, 5, ['str']),
  c('CEM-QC', 'السيطرة النوعية على المواد', 'Quality Control of Materials', 3, 1, 4, ['cem']),
  c('CEM-SA', 'تحليل الأنظمة الهندسية', 'Civil Eng. System Analysis', 3, 2, 4, ['cem']),
  c('CEM-CM', 'إدارة العقود', 'Contracts Management', 4, 1, 5, ['cem']),
  c('CEM-EQ', 'إدارة المعدات الإنشائية', 'Construction Equipment Management', 4, 2, 5, ['cem']),
  c('SAN-CH', 'كيمياء الهندسة البيئية', 'Environmental Eng. Chemistry', 3, 1, 4, ['san']),
  c('SAN-EP', 'حماية البيئة', 'Environmental Protection', 3, 2, 4, ['san']),
  c('SAN-WT', 'أنظمة معالجة المياه', 'Water Treatment Systems', 4, 1, 5, ['san']),
  c('SAN-WW', 'أنظمة معالجة المياه الثقيلة', 'Wastewater Treatment', 4, 2, 5, ['san']),
  c('HWY-TR', 'هندسة المرور', 'Traffic Engineering', 3, 1, 4, ['hwy']),
  c('HWY-PD', 'تصميم التبليط', 'Pavement Design', 3, 2, 4, ['hwy']),
  c('HWY-BR', 'تصميم الجسور', 'Design of Bridges', 4, 1, 5, ['hwy']),
  c('HWY-TU', 'هندسة الأنفاق', 'Tunneling Engineering', 4, 2, 4, ['hwy']),
  c('GEO-PH', 'المسح التصويري التحليلي', 'Analytical Photogrammetry', 3, 1, 4, ['geo']),
  c('GEO-LS', 'مساحة الأراضي', 'Land Surveying', 3, 2, 4, ['geo']),
  c('GEO-GI', 'نظم المعلومات الجغرافية', 'GIS', 4, 1, 5, ['geo']),
  c('GEO-GN', 'تحديد المواقع بـ GNSS', 'Positioning with GNSS', 4, 2, 4, ['geo']),
]

// المتطلبات السابقة (مؤكدة من عبدالله 4 أكتوبر 2026): [قبل، بعد]
export const PREREQS = [
  ['MATH122', 'MATH211'], ['MATH211', 'ENAN313'], ['ENAN313', 'APNA321'],
  ['ENMS112', 'ENMD123'], ['ENMS112', 'STMA212'], ['ENMS112', 'SOME312'],
  ['STMA212', 'STMA222'], ['STMA222', 'SDRC316'], ['SDRC316', 'SDRC324'],
  ['STMA212', 'STAN314'], ['STAN314', 'STAN323'], ['STAN323', 'STDS413'],
  ['SOME312', 'FOEN412'], ['FOEN412', 'DEFO421'],
  ['ENDR114', 'COAG124'],
  ['PLSU213', 'TOSU221'], ['TOSU221', 'GESM311'],
  ['FLME215', 'HYHY223'],
  ['BUCO214', 'QUSU411'],
]

// المواد الاختيارية لكل فرع حسب مخطط 2023/2024 (CE Elective 1-5): وحداتها ثابتة، والمادة تختلف حسب الفرع
// المرحلة.الفصل -> وحدات كل مادة اختيارية. كل فصل مجموعه 30 وحدة
export const ELECTIVE_SLOTS = { '3-2': [4, 4], '4-1': [6], '4-2': [5, 8] }

export const courseById = Object.fromEntries(COURSES.map((x) => [x.id, x]))

// فروع تدرس مادة بفصل غير اللي بالمخطط العام (من جدول الشعبة الرسمي)
// الموارد المائية، المرحلة الثالثة 2026-2027: الطرق بالفصل الأول، وميكانيك التربة بالثاني
export const SEM_OVERRIDE = { wat: { HITE322: 1, SOME312: 2 } }

export function coursesFor(profile) {
  if (!profile) return []
  const ov = SEM_OVERRIDE[profile.branch] || {}
  return COURSES.filter(
    (x) => x.stage === profile.stage && (!x.branches || x.branches.includes(profile.branch)),
  ).map((x) => (ov[x.id] ? { ...x, sem: ov[x.id] } : x))
}

// مواد الطالب بفصل معيّن، مربوطة بخطة الوحدات: نشيل المادة اللي شالها من الخطة ونضيف المحمّلة
export function semCourses(profile, plan, sem) {
  const base = coursesFor(profile).filter((c) => c.sem === sem)
  if (!plan) return base
  const all = [...(plan[1] || []), ...(plan[2] || [])]
  const cids = new Set(plan.carried ?? COURSES.filter((c) => c.stage < profile.stage && all.includes(c.id)).map((c) => c.id))
  const carried = [...cids].map((id) => courseById[id]).filter((c) => c && c.sem === sem).map((c) => ({ ...c, carried: true }))
  const ids = plan[sem]
  // المادة اللي متطلبها محمّل عليك تنقفل لحد ما تعبر المتطلب
  const keep = base.filter((c) => (c.branches || !ids || ids.includes(c.id)) && !PREREQS.some(([a, b]) => b === c.id && cids.has(a)))
  return [...keep, ...carried]
}

export const before = (id) => PREREQS.filter(([, b]) => b === id).map(([a]) => a)
export const after = (id) => PREREQS.filter(([a]) => a === id).map(([, b]) => b)

// كل ما يتعطل إذا رسب الطالب بالمادة (سلسلة كاملة)
export function blockedBy(id, seen = new Set()) {
  for (const n of after(id)) if (!seen.has(n)) { seen.add(n); blockedBy(n, seen) }
  return [...seen]
}

export const FILE_TYPES = [
  { id: 'lectures', name: 'المحاضرات', icon: 'lecture' },
  { id: 'notes', name: 'ملازم', icon: 'book' },
  { id: 'past', name: 'أسئلة سابقة', icon: 'paper' },
  { id: 'summary', name: 'ملخصات', icon: 'spark' },
  { id: 'translated', name: 'مترجمة', icon: 'lang' },
  { id: 'solutions', name: 'حلول كتب', icon: 'key' },
  { id: 'video', name: 'شروحات فيديو', icon: 'play' },
]
