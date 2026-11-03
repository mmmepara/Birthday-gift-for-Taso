type PlantProps = { stage?: number }

export function WindowArt() {
  return (
    <svg viewBox="0 0 200 170" aria-hidden="true">
      <rect x="18" y="14" width="164" height="128" rx="8" fill="#1a1424" stroke="#f4ecdf" strokeOpacity="0.8" />
      <rect x="26" y="22" width="70" height="78" fill="#241833" />
      <rect x="104" y="22" width="70" height="78" fill="#241833" />
      <path d="M30 108h140" stroke="#f4ecdf" strokeOpacity="0.35" />
      <path d="M100 22v86" stroke="#f4ecdf" strokeOpacity="0.45" />
      <circle cx="78" cy="52" r="16" fill="#f6efe4" />
      <circle cx="86" cy="48" r="13" fill="#241833" />
      <circle cx="132" cy="40" r="1.4" fill="#f0b36a" />
      <circle cx="124" cy="68" r="1" fill="#f4ecdf" />
      <circle cx="146" cy="58" r="1.2" fill="#f4ecdf" />
      <path d="M18 142h164" stroke="#c4a574" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

export function BookArt() {
  return (
    <svg viewBox="0 0 180 130" aria-hidden="true">
      <path d="M16 28h66c8 18 8 48 0 74H16c10-22 10-52 0-74z" fill="#6e3b46" />
      <path d="M164 28H98c-8 18-8 48 0 74h66c-10-22-10-52 0-74z" fill="#8a4a55" />
      <path d="M82 28c6 18 6 56 0 74" stroke="#f4ecdf" strokeOpacity="0.4" fill="none" />
      <path d="M34 48h34M34 60h28M112 48h30M112 60h24" stroke="#f4ecdf" strokeOpacity="0.45" />
      <path d="M90 24c14 8 18 20 8 28" stroke="#e7b2ae" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function PlantArt({ stage = 0 }: PlantProps) {
  const open = Math.max(0, Math.min(3, stage))
  const lift = open * 7
  return (
    <svg className="plant-svg" viewBox="0 0 160 200" aria-hidden="true">
      <ellipse cx="80" cy="186" rx="36" ry="6" fill="#000" opacity="0.16" />
      <path d="M48 138h64l-10 36H58z" fill="#c47868" />
      <path d="M48 138h64l-10 36H58z" fill="#a85a4c" opacity="0.35" />
      <rect x="44" y="128" width="72" height="14" rx="4" fill="#a85a4c" />
      <ellipse cx="80" cy="130" rx="28" ry="6" fill="#5a342c" />
      <ellipse cx="80" cy="129" rx="22" ry="4" fill="#3e2a22" />
      <path
        d={`M80 130 C ${78 - lift * 0.2} ${112 - lift}, ${82 + lift * 0.15} ${78 - lift}, 80 ${46 - lift * 0.4}`}
        stroke="#3e6a48"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="66" cy={118 - lift * 0.3} rx="18" ry="8" fill="#7ea88a" transform={`rotate(${-42 + lift} 66 ${118 - lift * 0.3})`} />
      <ellipse cx="96" cy={104 - lift * 0.35} rx="17" ry="7.5" fill="#6e947c" transform={`rotate(${36 - lift} 96 ${104 - lift * 0.35})`} />
      <ellipse cx="62" cy={86 - lift * 0.45} rx="14" ry="6.5" fill="#9cbc9e" transform={`rotate(${-30 + lift} 62 ${86 - lift * 0.45})`} />
      <ellipse cx="100" cy={74 - lift * 0.4} rx="13" ry="6" fill="#8eae98" transform={`rotate(${28 - lift * 0.8} 100 ${74 - lift * 0.4})`} />
      {open < 3 ? (
        <g>
          <ellipse cx="80" cy={58 - open * 3} rx={3.2} ry={6} fill="#6e947c" />
          <ellipse
            cx="80"
            cy={50 - open * 4}
            rx={4.2 + open * 1.1}
            ry={7 + open * 1.6}
            fill={open === 0 ? '#d5e2d6' : open === 1 ? '#f0c9c4' : '#e7b2ae'}
          />
        </g>
      ) : (
        <g className="flower">
          <ellipse cx="80" cy="40" rx="7" ry="15" fill="#f3c4bf" />
          <ellipse cx="80" cy="40" rx="7" ry="15" fill="#e7b2ae" transform="rotate(60 80 40)" />
          <ellipse cx="80" cy="40" rx="7" ry="15" fill="#f0b8b4" transform="rotate(120 80 40)" />
          <circle cx="80" cy="40" r="4.5" fill="#f0b36a" />
        </g>
      )}
    </svg>
  )
}

export function RecordArt() {
  return (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <circle cx="80" cy="80" r="70" fill="#141216" />
      <circle cx="80" cy="80" r="58" fill="none" stroke="#f4ecdf" strokeOpacity="0.08" />
      <circle cx="80" cy="80" r="46" fill="none" stroke="#f4ecdf" strokeOpacity="0.08" />
      <circle cx="80" cy="80" r="34" fill="none" stroke="#f4ecdf" strokeOpacity="0.08" />
      <circle cx="80" cy="80" r="22" fill="#e4c27a" />
      <circle cx="80" cy="80" r="4" fill="#1a120c" />
      <circle cx="104" cy="56" r="6" fill="#fff" opacity="0.08" />
    </svg>
  )
}

export function LampArt() {
  return (
    <svg viewBox="0 0 120 180" aria-hidden="true">
      <path d="M40 70h40l10 28H30z" fill="#f0b36a" />
      <path d="M46 70c4-24 24-24 28 0" fill="#f6d7a2" />
      <rect x="57" y="98" width="6" height="48" fill="#c4a574" />
      <rect x="40" y="146" width="40" height="8" rx="2" fill="#6b4338" />
      <ellipse cx="60" cy="78" rx="18" ry="8" fill="#fff4dc" opacity="0.45" />
    </svg>
  )
}

export function MothArt() {
  return (
    <svg viewBox="0 0 70 52" aria-hidden="true">
      <g className="wing wing-l">
        <ellipse cx="24" cy="28" rx="16" ry="11" transform="rotate(-28 24 28)" fill="#f6efe4" />
        <ellipse cx="22" cy="30" rx="8" ry="5" transform="rotate(-28 22 30)" fill="#e4c27a" opacity="0.55" />
      </g>
      <g className="wing wing-r">
        <ellipse cx="46" cy="28" rx="16" ry="11" transform="rotate(28 46 28)" fill="#e7b2ae" />
        <ellipse cx="48" cy="30" rx="8" ry="5" transform="rotate(28 48 30)" fill="#f6efe4" opacity="0.4" />
      </g>
      <ellipse cx="35" cy="29" rx="3.2" ry="9" fill="#2a211c" />
      <path d="M33 20c-6-8-4-12 0-13M37 20c6-8 4-12 0-13" stroke="#2a211c" strokeWidth="1.2" fill="none" />
      <circle cx="33.2" cy="22" r="0.8" fill="#f0b36a" />
    </svg>
  )
}

export function EnvelopeArt({ initial }: { initial: string }) {
  return (
    <svg viewBox="0 0 220 150" aria-hidden="true">
      <rect x="16" y="28" width="188" height="104" rx="8" fill="#f3eadc" />
      <path d="M16 36l94 62L204 36" fill="#e7dccb" />
      <path d="M16 132l70-46M204 132l-70-46" stroke="#d9cbb8" fill="none" />
      <circle cx="110" cy="78" r="18" fill="#8a4a55" />
      <text
        x="110"
        y="84"
        textAnchor="middle"
        fill="#f6efe4"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="16"
      >
        {initial}
      </text>
    </svg>
  )
}

export function LanternArt({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 80 120" aria-hidden="true">
      <path d="M40 8v16" stroke="#e4c27a" strokeWidth="2" />
      <rect x="28" y="22" width="24" height="6" rx="2" fill="#c4a574" />
      <path d="M22 32h36l6 58H16z" fill={lit ? '#f0b36a' : '#3a2a28'} stroke="#e4c27a" />
      <path d="M30 44h20M28 58h24M30 72h20" stroke={lit ? '#fff1c9' : '#6b5344'} strokeOpacity="0.7" />
      <rect x="24" y="92" width="32" height="6" rx="2" fill="#c4a574" />
      {lit ? <circle cx="40" cy="62" r="10" fill="#fff6df" opacity="0.8" /> : null}
    </svg>
  )
}

export function StarGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="currentColor" />
    </svg>
  )
}

export function PageGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h8l5 5v13H7z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function PetalGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="5" ry="8" fill="currentColor" />
    </svg>
  )
}
