const BUILDINGS = [42, 68, 36, 88, 54, 96, 44, 74, 38, 82, 50, 70, 34, 90, 46]

export function Skyline() {
  return (
    <div className="skyline" aria-hidden="true">
      <div className="sky-night">
        <i className="moon" />
        <i className="city-star s1" />
        <i className="city-star s2" />
        <i className="city-star s3" />
        <i className="city-star s4" />
      </div>
      <div className="buildings">
        {BUILDINGS.map((height, index) => (
          <span key={`${height}-${index}`} style={{ height: `${height}%` }} className={index === 5 ? 'spire' : ''} />
        ))}
      </div>
    </div>
  )
}

export function Lilies({ taken = false }: { taken?: boolean }) {
  const blooms = taken ? [0, 1, 2, 3] : [0, 1, 2, 3, 4]
  return (
    <svg className="lilies" viewBox="0 0 140 180" aria-hidden="true">
      <ellipse cx="70" cy="168" rx="28" ry="6" fill="#000" opacity="0.18" />
      {blooms.map((bloom) => {
        const x = [28, 52, 74, 98, 62][bloom] ?? 70
        const y = [58, 36, 48, 40, 68][bloom] ?? 50
        return (
          <g key={bloom} transform={`translate(${x} ${y})`}>
            <path d={`M${x > 70 ? 8 : -8} 90 C ${x > 70 ? 4 : -4} 40, 0 24, 0 8`} stroke="#3f6b45" strokeWidth="2" fill="none" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <ellipse
                key={angle}
                cx="0"
                cy="-10"
                rx="4.2"
                ry="11"
                transform={`rotate(${angle})`}
                fill={angle % 120 === 0 ? '#fffaf4' : '#f3efe6'}
              />
            ))}
            <circle r="3.2" fill="#e2b43a" />
            <path d="M0 0 v-16" stroke="#e2b43a" strokeWidth="1" />
            <circle cy="-16" r="1.2" fill="#c48a18" />
          </g>
        )
      })}
      <path d="M46 112 h48 l10 40 c-6 8-62 8-68 0 z" fill="rgba(214, 232, 236, 0.38)" stroke="rgba(255,255,255,0.55)" />
      <ellipse cx="70" cy="114" rx="24" ry="6" fill="rgba(186, 214, 220, 0.45)" />
      <path d="M58 124c8 6 18 6 26 0" fill="none" stroke="rgba(120,170,190,0.45)" />
    </svg>
  )
}

export function Tome({ open }: { open: boolean }) {
  return (
    <span className={open ? 'tome is-open' : 'tome'}>
      <span className="tome-board" />
      <span className="tome-sheet left" />
      <span className="tome-sheet right" />
    </span>
  )
}

export function Turntable({ spinning }: { spinning: boolean }) {
  return (
    <span className="turntable">
      <span className={spinning ? 'platter is-on' : 'platter'} />
      <span className="tonearm" />
    </span>
  )
}

export function DeskLamp() {
  return (
    <span className="desk-lamp">
      <span className="lamp-head">
        <span className="bulb" />
      </span>
      <span className="neck" />
      <span className="lamp-base">
        <span className="sensor" />
        <span className="usb" />
        <span className="charger" />
      </span>
      <span className="nightstand" />
    </span>
  )
}

export function CatArt() {
  return (
    <svg className="cat" viewBox="0 0 120 90" aria-hidden="true">
      <ellipse cx="60" cy="82" rx="28" ry="5" fill="#000" opacity="0.15" />
      <path d="M78 70c16 2 24-8 22-16" fill="none" stroke="#c4a574" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 58c-8 10-6 22 8 24h52c12-2 16-16 8-26-6-18-22-28-36-26-12 1-24 10-32 28z" fill="#d8c3a5" />
      <path d="M34 40l-8-16 16 8zM70 36l14-16-2 18z" fill="#d8c3a5" />
      <path d="M32 34l-4-10 10 4zM74 32l8-10 1 12z" fill="#f3e6d4" />
      <ellipse cx="46" cy="50" rx="3" ry="3.4" fill="#2a211c" />
      <ellipse cx="66" cy="50" rx="3" ry="3.4" fill="#2a211c" />
      <path d="M52 58h8l-4 4z" fill="#e7b2ae" />
      <path d="M44 62c6 6 16 6 22 0" fill="none" stroke="#8a4a55" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function BedArt() {
  return (
    <span className="bed" aria-hidden="true">
      <span className="headboard" />
      <span className="mattress" />
      <span className="pillow one" />
      <span className="pillow two" />
      <span className="duvet" />
    </span>
  )
}

export function WardrobeArt() {
  return (
    <span className="wardrobe" aria-hidden="true">
      <span className="door" />
      <span className="door" />
    </span>
  )
}

export function MirrorArt() {
  return (
    <span className="mirror" aria-hidden="true">
      <span className="glass" />
    </span>
  )
}

export function GuitarArt() {
  return (
    <svg className="guitar" viewBox="0 0 80 150" aria-hidden="true">
      <path d="M34 8h12v46h-12z" fill="#1a120c" />
      <rect x="30" y="4" width="20" height="10" rx="2" fill="#2a211c" />
      <circle cx="34" cy="8" r="1.2" fill="#e4c27a" />
      <circle cx="40" cy="8" r="1.2" fill="#e4c27a" />
      <circle cx="46" cy="8" r="1.2" fill="#e4c27a" />
      <path d="M18 78c0-18 10-28 22-28s22 10 22 28c0 16-8 28-14 36-4 6-16 6-16 0-6-8-14-20-14-36z" fill="#8a3038" />
      <path d="M28 78c0-10 6-16 12-16s12 6 12 16-6 18-12 22c-6-4-12-12-12-22z" fill="#f3eadc" />
      <rect x="36" y="70" width="8" height="16" rx="2" fill="#2a211c" />
      <circle cx="40" cy="92" r="3" fill="#1a120c" />
    </svg>
  )
}

export function AmpArt() {
  return (
    <span className="amp" aria-hidden="true">
      <span className="grille" />
      <span className="cone" />
      <span className="knobs" />
    </span>
  )
}
