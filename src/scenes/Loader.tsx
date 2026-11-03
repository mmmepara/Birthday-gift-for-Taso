import type { CSSProperties } from 'react'
import { story } from '../content/story.ts'

/** Fairy lights strung across the dark, switching on one by one while the night gets ready. */
const BULBS = [
  { x: 25.6, y: 27.6, c: '#ffd98a' },
  { x: 62.4, y: 42.6, c: '#f3a0b5' },
  { x: 99.2, y: 45.5, c: '#ffb15a' },
  { x: 136, y: 36.4, c: '#9ecbff' },
  { x: 185.6, y: 37.1, c: '#fff4e4' },
  { x: 222.4, y: 45.7, c: '#e7c56a' },
  { x: 259.2, y: 42.2, c: '#f3a0b5' },
  { x: 296, y: 26.6, c: '#ffb15a' },
]

export function Loader() {
  return (
    <section className="scene loader" aria-busy="true">
      <svg className="garland" viewBox="-6 0 332 74" aria-hidden="true">
        <path className="garland-wire" d="M0 10 Q80 74 160 24 Q240 74 320 10" />
        {BULBS.map((bulb, index) => (
          <g key={index} className="garland-bulb" style={{ '--c': bulb.c, '--i': index } as CSSProperties}>
            <circle className="glow" cx={bulb.x} cy={bulb.y + 9} r="13" />
            <rect className="cap" x={bulb.x - 2.6} y={bulb.y - 1} width="5.2" height="4.4" rx="1" />
            <ellipse className="glass" cx={bulb.x} cy={bulb.y + 8.4} rx="4.4" ry="5.8" />
          </g>
        ))}
      </svg>
      <h1 className="display hero loader-name">{story.name}</h1>
      <p className="loader-line">
        {story.loading}
        <span className="loader-dots" aria-hidden="true">
          <i>.</i>
          <i>.</i>
          <i>.</i>
        </span>
      </p>
    </section>
  )
}
