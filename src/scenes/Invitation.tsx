import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Flame } from '../components/Flame.tsx'
import { story } from '../content/story.ts'
import { useExperience } from '../experience.ts'
import { stillWind } from '../lib/wind.ts'

const STRIKE_SPAN = 230
const HEAT_PER_PX = 0.15
const HOLD_RATE = 0.022
const COOL_RATE = 0.035

type Spark = { id: number; x: number; dx: number; dy: number }

export function Invitation() {
  const { reduced, play, go, progress } = useExperience()
  const [heat, setHeat] = useState(0)
  const [lit, setLit] = useState(false)
  const [offset, setOffset] = useState(0)
  const [touched, setTouched] = useState(false)
  const [sparks, setSparks] = useState<Spark[]>([])
  const holdRef = useRef(false)
  const keyRef = useRef(false)
  const litRef = useRef(false)
  const heatRef = useRef(0)
  const offsetRef = useRef(0)
  const grabRef = useRef(0)
  const sparkId = useRef(0)
  const lastScratch = useRef(0)
  const reducedRef = useRef(reduced)
  const playRef = useRef(play)
  const enterRef = useRef(() => go('room'))

  useEffect(() => {
    reducedRef.current = reduced
    playRef.current = play
    enterRef.current = () => go('room')
  }, [go, play, reduced])

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      if (litRef.current) return
      const dt = Math.min(64, now - last)
      last = now
      if (keyRef.current) {
        const scrub = (Math.sin(now / 140) * 0.5 + 0.5) * STRIKE_SPAN
        rub(scrub - offsetRef.current)
        offsetRef.current = scrub
        setOffset(scrub)
      }
      let next = heatRef.current
      if (holdRef.current) next += dt * HOLD_RATE
      else next -= dt * COOL_RATE
      next = Math.max(0, Math.min(100, next))
      if (next !== heatRef.current) {
        heatRef.current = next
        setHeat(next)
      }
      if (next >= 100) ignite()
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
    // The loop only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ignite = () => {
    if (litRef.current) return
    litRef.current = true
    holdRef.current = false
    keyRef.current = false
    setLit(true)
    playRef.current('ignite')
    window.setTimeout(() => enterRef.current(), reducedRef.current ? 400 : 2100)
  }

  const rub = (dx: number) => {
    const distance = Math.abs(dx)
    if (distance < 0.5) return
    heatRef.current = Math.min(100, heatRef.current + distance * HEAT_PER_PX)
    setHeat(heatRef.current)
    const now = performance.now()
    if (now - lastScratch.current > 90) {
      lastScratch.current = now
      playRef.current('scratch')
      if (!reducedRef.current && heatRef.current > 12) {
        const id = sparkId.current
        sparkId.current += 1
        const burst: Spark[] = Array.from({ length: 3 }, (_, i) => ({
          id: id * 10 + i,
          x: offsetRef.current,
          dx: (Math.random() - 0.5) * 60 - Math.sign(dx) * 20,
          dy: -20 - Math.random() * 40,
        }))
        setSparks((current) => [...current.slice(-15), ...burst])
      }
    }
    if (heatRef.current >= 100) ignite()
  }

  const begin = (clientX: number, bounds: DOMRect) => {
    if (litRef.current) return
    holdRef.current = true
    setTouched(true)
    grabRef.current = clientX - bounds.left - offsetRef.current
  }

  const moveTo = (clientX: number, bounds: DOMRect) => {
    if (!holdRef.current || litRef.current) return
    const next = Math.min(STRIKE_SPAN, Math.max(0, clientX - bounds.left - grabRef.current))
    rub(next - offsetRef.current)
    offsetRef.current = next
    setOffset(next)
  }

  const end = () => {
    holdRef.current = false
    keyRef.current = false
  }

  const warmth = heat / 100
  const head = warmth < 0.4 ? '#9a2f2a' : warmth < 0.8 ? '#d9481f' : '#ff8a3a'

  return (
    <section
      className={lit ? 'scene invite is-lit' : 'scene invite'}
      style={{ '--warmth': warmth } as CSSProperties}
    >
      <div className="invite-glow" aria-hidden="true" />
      <p className="kicker">{story.invitation.kicker}</p>
      <h1 className="display hero">{story.invitation.title}</h1>
      <p className="lede">{story.invitation.lede}</p>
      <p className="name-reveal">{story.name}</p>
      <button
        type="button"
        className={`strike-stage${heat > 2 ? ' is-striking' : ''}${touched ? ' is-touched' : ''}`}
        aria-label={story.invitation.aria}
        aria-describedby="match-hint"
        onPointerDown={(event) => {
          begin(event.clientX, event.currentTarget.getBoundingClientRect())
          try {
            event.currentTarget.setPointerCapture(event.pointerId)
          } catch {
            // The hold still counts if capture is refused.
          }
        }}
        onPointerMove={(event) => moveTo(event.clientX, event.currentTarget.getBoundingClientRect())}
        onPointerUp={end}
        onPointerCancel={end}
        onKeyDown={(event) => {
          if (event.repeat || (event.key !== ' ' && event.key !== 'Enter')) return
          event.preventDefault()
          holdRef.current = true
          keyRef.current = true
          setTouched(true)
        }}
        onKeyUp={(event) => {
          if (event.key !== ' ' && event.key !== 'Enter') return
          event.preventDefault()
          end()
        }}
        onBlur={end}
      >
        <span className="matchbox" aria-hidden="true">
          <span className="mb-drawer">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="mb-stick" />
            ))}
          </span>
          <span className="mb-sleeve">
            <span className="mb-label">
              <span className="mb-emblem" />
              <span className="mb-for">{story.invitation.boxLabel}</span>
              <span className="mb-name">{story.name}</span>
            </span>
          </span>
          <span className="mb-strip">
            <span className="mb-burn" style={{ left: `${(offset / STRIKE_SPAN) * 100}%`, opacity: warmth }} />
          </span>
        </span>

        {!touched ? (
          <span className="swipe-hint" aria-hidden="true">
            <span className="swipe-dot" />
            <span className="swipe-arrow">→</span>
          </span>
        ) : null}

        <span className="strike-match" style={{ transform: `translateX(${offset}px) rotate(-38deg)` }} aria-hidden="true">
          <span className="strike-fire">
            <Flame alive={lit} wind={stillWind} reduced={reduced} seed={3} />
          </span>
          <span className="strike-head" style={{ background: head, boxShadow: `0 0 ${warmth * 18}px rgba(255, 140, 60, ${warmth})` }} />
          <span className="strike-stick" />
          {sparks.map((spark) => (
            <span
              key={spark.id}
              className="spark"
              style={{ '--dx': `${spark.dx}px`, '--dy': `${spark.dy}px` } as CSSProperties}
              onAnimationEnd={() => setSparks((current) => current.filter((item) => item.id !== spark.id))}
            />
          ))}
        </span>
      </button>

      <div className="heat" aria-hidden="true">
        <span style={{ transform: `scaleX(${warmth})` }} />
      </div>
      <p id="match-hint" className="hint invite-hint">
        {lit ? story.invitation.litHint : heat > 6 ? story.invitation.keepGoing : story.invitation.hint}
      </p>
      {progress.finaleSeen ? (
        <button type="button" className="seal quiet" onClick={() => go('room')}>
          {story.invitation.skip}
        </button>
      ) : null}
      {lit && !reduced ? <div className="flash" aria-hidden="true" /> : null}
    </section>
  )
}
