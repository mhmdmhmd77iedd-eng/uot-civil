// أيقونات المدني: خط واحد متناسق (1.7) مع طبقة لونية خفيفة (duotone)
// f = الجزء المظلل الخفيف، s = الخطوط
const P = {
  books: {
    f: <rect x="3.5" y="4" width="4.2" height="16" rx="1.2" />,
    s: <><rect x="3.5" y="4" width="4.2" height="16" rx="1.2" /><rect x="8.9" y="6" width="4.2" height="14" rx="1.2" /><path d="m14.7 7 3.9-1.05 3.4 12.9-3.9 1.05z" /><path d="M3.5 8.2h4.2M8.9 9.6h4.2" /></>,
  },
  calc: {
    f: <rect x="8" y="6" width="8" height="4" rx="1" />,
    s: <><rect x="5" y="2.8" width="14" height="18.4" rx="3" /><rect x="8" y="6" width="8" height="4" rx="1" /><path d="M8.6 13.6h.01M12 13.6h.01M15.4 13.6h.01M8.6 17.2h.01M12 17.2h.01M15.4 17.2h.01" strokeWidth="2.4" /></>,
  },
  route: {
    f: <circle cx="18" cy="12" r="2.6" />,
    s: <><circle cx="6" cy="5.5" r="2.4" /><circle cx="6" cy="18.5" r="2.4" /><circle cx="18" cy="12" r="2.6" /><path d="M8.4 5.6c4.6.1 6.9 1.7 8 4M8.4 18.4c4.6-.1 6.9-1.7 8-4M6 7.9v8.2" /></>,
  },
  ask: {
    f: <path d="M4 6.2a2.2 2.2 0 0 1 2.2-2.2h11.6A2.2 2.2 0 0 1 20 6.2v8.6a2.2 2.2 0 0 1-2.2 2.2H11l-4.2 3.4V17h-.6A2.2 2.2 0 0 1 4 14.8z" />,
    s: <><path d="M4 6.2a2.2 2.2 0 0 1 2.2-2.2h11.6A2.2 2.2 0 0 1 20 6.2v8.6a2.2 2.2 0 0 1-2.2 2.2H11l-4.2 3.4V17h-.6A2.2 2.2 0 0 1 4 14.8z" /><path d="M12 7.8v5.4M9.3 10.5h5.4" /></>,
  },
  cap: {
    f: <path d="M2.5 9 12 4.5 21.5 9 12 13.5z" />,
    s: <><path d="M2.5 9 12 4.5 21.5 9 12 13.5z" /><path d="M6.5 11.2v4.4c1.6 1.5 3.6 2.3 5.5 2.3s3.9-.8 5.5-2.3v-4.4M21.5 9v5.2" /></>,
  },
  megaphone: {
    f: <path d="M4 10.2v3.6a1.2 1.2 0 0 0 1.2 1.2H7l8 4.3V4.7L7 9H5.2A1.2 1.2 0 0 0 4 10.2z" />,
    s: <><path d="M4 10.2v3.6a1.2 1.2 0 0 0 1.2 1.2H7l8 4.3V4.7L7 9H5.2A1.2 1.2 0 0 0 4 10.2z" /><path d="M7 15l1.1 4.3a1 1 0 0 0 1 .7h1.2M18.2 9.3a3.8 3.8 0 0 1 0 5.4" /></>,
  },
  calendar: {
    f: <path d="M3.5 8a2.5 2.5 0 0 1 2.5-2.5h12A2.5 2.5 0 0 1 20.5 8v2h-17z" />,
    s: <><rect x="3.5" y="5.5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3.5v4M16 3.5v4M9.2 15.2l1.9 1.9 3.8-3.8" /></>,
  },
  hardhat: {
    f: <path d="M5 16.5v-1.8a7 7 0 0 1 14 0v1.8z" />,
    s: <><path d="M5 16.5v-1.8a7 7 0 0 1 14 0v1.8M3 16.5h18v1.6a1.2 1.2 0 0 1-1.2 1.2H4.2A1.2 1.2 0 0 1 3 18.1z" /><path d="M10 8.3V6.4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.9M8 9.6V13M16 9.6V13" /></>,
  },
  book: {
    f: <path d="M3 5.6c3-1 6-1 9 .8V20c-3-1.8-6-1.8-9-.8z" />,
    s: <><path d="M3 5.6c3-1 6-1 9 .8 3-1.8 6-1.8 9-.8v13.6c-3-1-6-1-9 .8-3-1.8-6-1.8-9-.8z" /><path d="M12 6.4V20" /></>,
  },
  paper: {
    f: <rect x="9" y="2.8" width="6" height="3.4" rx="1" />,
    s: <><path d="M9 4.5H7.5A2.5 2.5 0 0 0 5 7v11.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V7a2.5 2.5 0 0 0-2.5-2.5H15" /><rect x="9" y="2.8" width="6" height="3.4" rx="1" /><path d="M9 11h6M9 14.5h6M9 18h3.5" /></>,
  },
  spark: {
    f: <path d="M11 3.5c.6 4 2.6 6 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.5 5.9-2.5 6.5-6.5z" />,
    s: <><path d="M11 3.5c.6 4 2.6 6 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.5 5.9-2.5 6.5-6.5z" /><path d="M18.5 15c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5z" /></>,
  },
  lang: {
    f: <rect x="12" y="10.5" width="9.5" height="10.5" rx="2.5" />,
    s: <><path d="M3.5 5.5h8M7.5 3.5v2M10 5.5c-.8 3.4-2.9 6-5.8 7.3M5.8 8.6c1 1.6 2.5 2.8 4.2 3.5" /><path d="M13.6 19.2l3.1-7.2 3.1 7.2M14.6 17h4.2" /></>,
  },
  key: {
    f: <circle cx="8" cy="15.5" r="4.5" />,
    s: <><circle cx="8" cy="15.5" r="4.5" /><path d="M11.3 12.3 19.8 3.8M16.6 7l2.5 2.5M14.4 9.2l2 2" /></>,
  },
  play: {
    f: <rect x="2.8" y="5" width="18.4" height="14" rx="3.6" />,
    s: <><rect x="2.8" y="5" width="18.4" height="14" rx="3.6" /><path d="M10.2 9.3v5.4c0 .4.4.6.8.4l4.4-2.7a.5.5 0 0 0 0-.8L11 8.9c-.4-.2-.8 0-.8.4z" /></>,
  },
  bell: {
    f: <path d="M6 10a6 6 0 1 1 12 0c0 5.5 2.4 7 2.4 7H3.6S6 15.5 6 10z" />,
    s: <><path d="M6 10a6 6 0 1 1 12 0c0 5.5 2.4 7 2.4 7H3.6S6 15.5 6 10z" /><path d="M10 20.2a2.1 2.1 0 0 0 4 0" /></>,
  },
  phone: {
    f: <path d="M5.2 3.8h3.3l1.8 4.5-2.3 1.4a11 11 0 0 0 6.3 6.3l1.4-2.3 4.5 1.8v3.3a1.6 1.6 0 0 1-1.7 1.6C10.3 19.8 4.2 13.7 3.6 5.5a1.6 1.6 0 0 1 1.6-1.7z" />,
    s: <path d="M5.2 3.8h3.3l1.8 4.5-2.3 1.4a11 11 0 0 0 6.3 6.3l1.4-2.3 4.5 1.8v3.3a1.6 1.6 0 0 1-1.7 1.6C10.3 19.8 4.2 13.7 3.6 5.5a1.6 1.6 0 0 1 1.6-1.7z" />,
  },
  plane: {
    f: <path d="M21 3.5 3 10.8l6.4 2.5 2.6 6.7z" />,
    s: <><path d="M21 3.5 3 10.8l6.4 2.5 2.6 6.7z" /><path d="M9.4 13.3 21 3.5" /></>,
  },
  camera: {
    f: <rect x="3.5" y="3.5" width="17" height="17" rx="5" />,
    s: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.9" /><path d="M16.9 7.1h.01" strokeWidth="2.6" /></>,
  },
  whatsapp: {
    f: <path d="M4 20.2l1.2-3.7A8.3 8.3 0 1 1 8 19.1z" />,
    s: <><path d="M4 20.2l1.2-3.7A8.3 8.3 0 1 1 8 19.1z" /><path d="M9.3 8.6c-.2 2.9 2.9 6 5.8 5.8l.9-1.3-1.8-1-.9.6a3.6 3.6 0 0 1-2.1-2.1l.6-.9-1-1.8z" /></>,
  },
  build: {
    f: <path d="M5 20.5V10h6v10.5z" />,
    s: <><path d="M3 20.5h18M5 20.5V10h6v10.5M11 20.5V4.5h8v16" /><path d="M14 8.5h2M14 12h2M14 15.5h2M7.6 13.2h.8M7.6 16.6h.8" /></>,
  },
  mobile: {
    f: <rect x="6.5" y="2.5" width="11" height="19" rx="2.8" />,
    s: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.8" /><path d="M10.6 18.3h2.8" /></>,
  },
  sheet: {
    f: <path d="M3.5 6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5V9h-17z" />,
    s: <><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><path d="M3.5 9h17M3.5 14.5h17M9.5 9v11" /></>,
  },
  print: {
    f: <rect x="3.5" y="8" width="17" height="9" rx="2.5" />,
    s: <><path d="M7 8V3.5h10V8M7 17H6a2.5 2.5 0 0 1-2.5-2.5v-4A2.5 2.5 0 0 1 6 8h12a2.5 2.5 0 0 1 2.5 2.5v4A2.5 2.5 0 0 1 18 17h-1" /><rect x="7" y="13.5" width="10" height="7" rx="1.2" /><path d="M16.8 11h.01" strokeWidth="2.4" /></>,
  },
  info: {
    f: <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />,
    s: <><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><path d="M12 11v5.2M12 7.9h.01" strokeWidth="2" /></>,
  },
  user: {
    f: <circle cx="12" cy="8" r="4" />,
    s: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1.4-3.8 4.2-5.7 7.5-5.7s6.1 1.9 7.5 5.7" /></>,
  },
  download: {
    f: <path d="M4 15.5h16v1.8a3.2 3.2 0 0 1-3.2 3.2H7.2A3.2 3.2 0 0 1 4 17.3z" />,
    s: <><path d="M12 3.5v11M7.6 10.2l4.4 4.4 4.4-4.4M4 15.5v1.8a3.2 3.2 0 0 0 3.2 3.2h9.6a3.2 3.2 0 0 0 3.2-3.2v-1.8" /></>,
  },
  upload: {
    f: <path d="M4 15.5h16v1.8a3.2 3.2 0 0 1-3.2 3.2H7.2A3.2 3.2 0 0 1 4 17.3z" />,
    s: <><path d="M12 14.5v-11M7.6 7.9 12 3.5l4.4 4.4M4 15.5v1.8a3.2 3.2 0 0 0 3.2 3.2h9.6a3.2 3.2 0 0 0 3.2-3.2v-1.8" /></>,
  },
  history: {
    f: <circle cx="12" cy="12" r="8.5" />,
    s: <><path d="M3.9 9.2A8.5 8.5 0 1 1 3.5 12M3.5 4.8v4.4h4.4M12 7.6V12l3 2" /></>,
  },
  search: {
    f: <circle cx="10.5" cy="10.5" r="6.5" />,
    s: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.4 15.4 5.1 5.1" /></>,
  },
  folder: {
    f: <path d="M3.5 7.2a2.2 2.2 0 0 1 2.2-2.2h3.7l2.1 2.5h6.8a2.2 2.2 0 0 1 2.2 2.2v7.1a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2z" />,
    s: <path d="M3.5 7.2a2.2 2.2 0 0 1 2.2-2.2h3.7l2.1 2.5h6.8a2.2 2.2 0 0 1 2.2 2.2v7.1a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2z" />,
  },
  warn: {
    f: <path d="M10.3 4.3 2.9 17.4a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />,
    s: <><path d="M10.3 4.3 2.9 17.4a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" /><path d="M12 9.6V14M12 17.1h.01" strokeWidth="2" /></>,
  },
  heart: {
    f: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z" />,
    s: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z" />,
  },
  check: { s: <path d="M5 12.5l4.5 4.5L19 7.5" /> },
  done: {
    f: <circle cx="12" cy="12" r="8.5" />,
    s: <><circle cx="12" cy="12" r="8.5" /><path d="M8.3 12.2l2.6 2.6 4.9-5" /></>,
  },
  sun: {
    f: <circle cx="12" cy="12" r="4" />,
    s: <><circle cx="12" cy="12" r="4" /><path d="M12 2.8v1.8M12 19.4v1.8M2.8 12h1.8M19.4 12h1.8M5.5 5.5l1.3 1.3M17.2 17.2l1.3 1.3M5.5 18.5l1.3-1.3M17.2 6.8l1.3-1.3" /></>,
  },
  moon: {
    f: <path d="M19.8 14.6A8 8 0 1 1 9.4 4.2a6.4 6.4 0 0 0 10.4 10.4z" />,
    s: <path d="M19.8 14.6A8 8 0 1 1 9.4 4.2a6.4 6.4 0 0 0 10.4 10.4z" />,
  },
  copy: {
    f: <rect x="8.5" y="8.5" width="12" height="12" rx="2.6" />,
    s: <><rect x="8.5" y="8.5" width="12" height="12" rx="2.6" /><path d="M15.5 8.5V6.1A2.6 2.6 0 0 0 12.9 3.5H6.1A2.6 2.6 0 0 0 3.5 6.1v6.8a2.6 2.6 0 0 0 2.6 2.6h2.4" /></>,
  },
  shield: {
    f: <path d="M12 3 5 6v5.4c0 4.4 3 8 7 9.6 4-1.6 7-5.2 7-9.6V6z" />,
    s: <><path d="M12 3 5 6v5.4c0 4.4 3 8 7 9.6 4-1.6 7-5.2 7-9.6V6z" /><path d="M9.2 12l2 2 3.8-3.8" /></>,
  },
  theme: {
    f: <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" />,
    s: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17" /></>,
  },
  trash: {
    s: <><path d="M4 7h16M9.5 7V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M6.2 7l.9 12a2 2 0 0 0 2 1.8h5.8a2 2 0 0 0 2-1.8l.9-12" /></>,
  },
  plus: { s: <path d="M12 5v14M5 12h14" /> },
  back: { s: <path d="M9 5.5l6.5 6.5L9 18.5" /> },
  chev: { s: <path d="M14.5 6 8.5 12l6 6" /> },
  arrow: { s: <path d="M19 12H5M11 6l-6 6 6 6" /> },
  link: {
    s: <><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" /></>,
  },
  home: {
    f: <path d="M9 21v-6h6v6z" />,
    s: <path d="M3.5 10.4 12 3.5l8.5 6.9V19a2 2 0 0 1-2 2H15v-6H9v6H5.5a2 2 0 0 1-2-2z" />,
  },
  grid: {
    f: <rect x="4" y="4" width="7" height="7" rx="2" />,
    s: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>,
  },
}

export function I({ n, size = 22, className = '', style }) {
  const p = P[n] || P.info
  return (
    <svg className={'i ' + className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p.f && <g fill="currentColor" stroke="none" opacity=".16">{p.f}</g>}
      {p.s}
    </svg>
  )
}

// ألوان هادئة لكل قسم (تتناسق مع الهوية)
export const HUES = {
  teal: '#2f6e69', amber: '#b9802a', clay: '#b0603f', indigo: '#4d5b97', sage: '#5a8455', plum: '#875a80', ocean: '#2c7593', bronze: '#8a6a36',
}

// رسم خطي لجسر مقوّس (هوية الهندسة المدنية)
export function Bridge({ className = '', draw = false, sw = 1.4 }) {
  const n = 12, x0 = 22, x1 = 278, top = 14, deck = 78
  const pts = Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n, x = x0 + (x1 - x0) * t
    return [x, deck - 4 * (deck - top) * t * (1 - t)]
  })
  const arch = 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')
  const lines = []
  pts.forEach(([x, y], k) => {
    if (k > 0 && k < n) lines.push(<line key={'v' + k} x1={x} y1={y} x2={x} y2={deck} />)
    if (k > 0 && k <= n / 2) lines.push(<line key={'d' + k} x1={pts[k - 1][0]} y1={deck} x2={x} y2={y} />)
    if (k >= n / 2 && k < n) lines.push(<line key={'e' + k} x1={x} y1={y} x2={pts[k + 1][0]} y2={deck} />)
  })
  return (
    <svg className={className} viewBox="0 0 300 112" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <g className={draw ? 'draw' : ''}>
        <path d={arch} />
        <path d={`M0 ${deck}H300M0 ${deck + 6}H300`} />
        {lines}
        <path d={`M${x0} ${deck + 6}v26M${x1} ${deck + 6}v26M${x0 - 8} ${deck + 32}h16M${x1 - 8} ${deck + 32}h16`} />
        <path d="M40 104c10-4 20 4 30 0s20 4 30 0M150 106c10-4 20 4 30 0s20 4 30 0" opacity=".6" />
      </g>
    </svg>
  )
}
