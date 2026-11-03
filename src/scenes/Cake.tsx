import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Cue } from '../audio/soundscape.ts'
import { ChapterHeading } from '../components/ChapterHeading.tsx'
import { Confetti } from '../components/Confetti.tsx'
import { Flame } from '../components/Flame.tsx'
import { useMusic } from '../components/Music.tsx'
import { story } from '../content/story.ts'
import { useExperience } from '../experience.ts'
import { createCandles, GUST_PER_CANDLE, sameLit, stepCandles } from '../lib/candles.ts'
import { stillWind } from '../lib/wind.ts'

type Phase = 'light' | 'wish' | 'release' | 'blow' | 'celebrate'

const SEATS = [
  { x: '34.5%', y: '23.5%', tilt: '-3deg', z: 1, shift: '-30%', h: 54, lean: -1 },
  { x: '40%', y: '26%', tilt: '-2deg', z: 2, shift: '30%', h: 58, lean: -0.6 },
  { x: '50%', y: '31%', tilt: '0deg', z: 3, shift: '0%', h: 50, lean: 0.25 },
  { x: '60%', y: '26%', tilt: '2deg', z: 2, shift: '-30%', h: 58, lean: 0.6 },
  { x: '65.5%', y: '23.5%', tilt: '3deg', z: 1, shift: '30%', h: 54, lean: 1 },
]
const WAX: [string, string][] = [
  ['#fbf3e6', '#e7a9b2'],
  ['#fbf3e6', '#e4c27a'],
  ['#fdf7ee', '#c47b84'],
  ['#fbf3e6', '#9cbfa6'],
  ['#fbf3e6', '#f0b36a'],
]
/** Candles go out from the middle outward, the way a real breath lands. */
const ORDER = [2, 1, 3, 0, 4]

export function Cake() {
  const { reduced, play, notify, go } = useExperience()
  const { softly } = useMusic()
  const count = story.cake.candles.length
  const [phase, setPhase] = useState<Phase>('light')
  const [draft, setDraft] = useState('')
  const [rising, setRising] = useState<string | null>(null)
  const [lit, setLit] = useState<boolean[]>(() => Array.from({ length: count }, () => false))
  const [fresh, setFresh] = useState<number | null>(null)
  const [holding, setHolding] = useState(false)
  const [held, setHeld] = useState<{ x: number; y: number; touch: boolean } | null>(null)
  const fieldRef = useRef(createCandles(count))
  const windRef = useRef(0)
  const winds = useMemo(() => Array.from({ length: count }, () => ({ current: 0 })), [count])
  const holdRef = useRef(false)
  const endedRef = useRef(false)
  const wishTimer = useRef(0)
  const breathEl = useRef<HTMLDivElement>(null)
  const barEl = useRef<HTMLSpanElement>(null)
  const wicks = useRef<Array<HTMLElement | null>>([])
  const litRef = useRef(lit)
  const phaseRef = useRef(phase)
  const movedRef = useRef(false)
  const originRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    litRef.current = lit
    phaseRef.current = phase
  }, [lit, phase])

  const lightAt = (index: number) => {
    if (phaseRef.current !== 'light' || litRef.current[index]) return
    const next = litRef.current.slice()
    next[index] = true
    litRef.current = next
    setLit(next)
    setFresh(index)
    play(`candle${next.filter(Boolean).length - 1}` as Cue)
  }

  const lightNext = () => {
    const index = litRef.current.findIndex((on) => !on)
    if (index >= 0) lightAt(index)
  }

  const flamePoint = (x: number, y: number, touch: boolean) => ({ x, y: y - (touch ? 92 : 62) })

  const consider = (x: number, y: number, touch: boolean) => {
    const tip = flamePoint(x, y, touch)
    wicks.current.forEach((el, index) => {
      if (!el || litRef.current[index]) return
      const rect = el.getBoundingClientRect()
      const dx = tip.x - (rect.left + rect.width / 2)
      const dy = tip.y - rect.top
      if (dx * dx + dy * dy < 30 * 30) lightAt(index)
    })
  }

  useEffect(() => {
    if (phase !== 'light' || !lit.every(Boolean)) return
    const timer = window.setTimeout(() => setPhase('wish'), reduced ? 300 : 1100)
    return () => window.clearTimeout(timer)
  }, [lit, phase, reduced])

  useEffect(() => {
    if (phase !== 'blow') return
    endedRef.current = false
    fieldRef.current = createCandles(count)
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(120, now - last)
      last = now
      const power = holdRef.current ? 0.92 : 0
      windRef.current += (power - windRef.current) * 0.14
      const w = windRef.current
      winds.forEach((ref, index) => {
        const seat = SEATS[index] ?? SEATS[2]!
        ref.current = w * (seat.lean * 0.8 + Math.sin(now * 0.02 + index * 1.7) * 0.18 * w)
      })
      if (breathEl.current) breathEl.current.style.opacity = String(Math.min(0.85, w * 1.2))
      if (!endedRef.current) {
        const prev = fieldRef.current
        const next = stepCandles(prev, power, dt)
        fieldRef.current = next
        if (barEl.current) barEl.current.style.transform = `scaleX(${Math.min(1, next.gust / (GUST_PER_CANDLE * count))})`
        if (!sameLit(prev.lit, next.lit)) {
          const shown = Array.from({ length: count }, () => true)
          next.lit.forEach((on, k) => {
            const candle = ORDER[k] ?? k
            shown[candle] = on
          })
          setLit(shown)
          play('extinguish')
          if (next.lit.every((isLit) => !isLit)) {
            endedRef.current = true
            holdRef.current = false
            setHolding(false)
            window.setTimeout(() => {
              setPhase('celebrate')
              play('pop')
              softly(11500)
              window.setTimeout(() => play('birthday'), 700)
            }, reduced ? 200 : 900)
          }
        }
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      winds.forEach((ref) => {
        ref.current = 0
      })
    }
  }, [count, phase, play, reduced, softly, winds])

  useEffect(() => () => window.clearTimeout(wishTimer.current), [])

  const beginBlow = () => {
    if (holdRef.current) return
    holdRef.current = true
    setHolding(true)
    play('whoosh')
  }
  const endBlow = () => {
    holdRef.current = false
    setHolding(false)
  }

  const releaseWish = (text: string) => {
    const wish = text.trim().slice(0, 140)
    setDraft('')
    play('wish')
    if (!wish) {
      setPhase('blow')
      return
    }
    setRising(wish)
    setPhase('release')
    wishTimer.current = window.setTimeout(() => {
      setRising(null)
      setPhase('blow')
    }, reduced ? 700 : 2600)
  }

  const burning = lit.filter(Boolean).length
  const allLit = burning === count
  const step = phase === 'light' ? 0 : phase === 'wish' || phase === 'release' ? 1 : phase === 'blow' ? 2 : 3
  const heading =
    phase === 'celebrate'
      ? { title: story.cake.celebrateTitle, lede: story.cake.celebrateBody }
      : phase === 'blow'
        ? { title: story.cake.blowTitle, lede: story.cake.blowBody }
        : phase === 'light'
          ? { title: story.cake.lightTitle, lede: story.cake.lightBody }
          : { title: story.cake.wishTitle, lede: story.cake.wishBody }
  const lightLine = allLit
    ? story.cake.lightDone
    : burning === 0
      ? story.cake.matchHint
      : `${count - burning} ${story.cake.stillDark}`
  const glow = phase === 'celebrate' ? 1 : burning / count

  return (
    <section
      className={`scene cake-scene phase-${phase}`}
      style={{ '--lit': glow } as CSSProperties}
    >
      <div className="cake-dark" aria-hidden="true" />
      <Confetti active={phase === 'celebrate'} reduced={reduced} />

      <ol className="cake-steps" aria-label={story.cake.stepsLabel}>
        {story.cake.steps.map((label, index) => (
          <li key={label} className={index < step ? 'is-done' : index === step ? 'is-now' : ''}>
            <span className="step-dot" aria-hidden="true">
              {index < step ? '✓' : index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <ChapterHeading kicker={story.cake.kicker} title={heading.title} lede={heading.lede} />

      <div className="cake-stage">
        <div className="cake-glow" aria-hidden="true" />
        <div ref={breathEl} className="breath" aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} style={{ left: `${18 + i * 11}%`, animationDelay: `${i * 0.13}s` }} />
          ))}
        </div>
        {rising ? (
          <p className="rising-wish" aria-hidden="true">
            {[...rising].map((char, index) => (
              <span key={index} style={{ animationDelay: `${index * 0.025}s` }}>
                {char}
              </span>
            ))}
          </p>
        ) : null}
        <div className="cake-photo">
          <p className="candle-sentence" aria-hidden="true">
            {story.cake.candles.map((candle, index) => (
              <span key={candle.word} className={index < burning || phase !== 'light' ? 'is-on' : ''}>
                {candle.word}{' '}
              </span>
            ))}
          </p>
          <img src="/cake.png" alt="" />
          <div className="cake-candles">
            {story.cake.candles.map((candle, index) => {
              const alive = lit[index] ?? false
              const spent = !alive && (phase === 'blow' || phase === 'celebrate')
              const mode = alive ? 'is-lit' : spent ? 'is-out' : 'is-dark'
              const seat = SEATS[index] ?? SEATS[2]!
              const [base, stripe] = WAX[index] ?? WAX[0]!
              return (
                <button
                  key={candle.word}
                  type="button"
                  className={`candle ${mode}${fresh === index && alive ? ' is-fresh' : ''}${index === 0 || index === count - 1 ? ' is-outer' : ''}`}
                  style={
                    {
                      '--h': seat.h,
                      '--wax': base,
                      '--stripe': stripe,
                      '--x': seat.x,
                      '--y': seat.y,
                      '--tilt': seat.tilt,
                      '--z': seat.z,
                      '--shift': seat.shift,
                    } as CSSProperties
                  }
                  aria-label={
                    phase === 'light'
                      ? alive
                        ? `${candle.word}, ანთია`
                        : `${candle.word} აანთე`
                      : `${candle.word}, ${alive ? 'ანთია' : 'ჩაქრა'}`
                  }
                  onClick={() => {
                    if (phase === 'light') {
                      if (alive) notify(story.cake.alreadyBurning)
                      else lightAt(index)
                      return
                    }
                    if ((phase === 'wish' || phase === 'release') && alive) notify(story.cake.wishFirst)
                    if (phase === 'blow' && alive) notify(story.cake.poke)
                  }}
                >
                  <span className="candle-light" aria-hidden="true" />
                  <span className="candle-flame" aria-hidden="true">
                    {alive || spent ? (
                      <Flame alive={alive} wind={winds[index] ?? stillWind} reduced={reduced} seed={index + 1} />
                    ) : null}
                  </span>
                  <span className="candle-ring" aria-hidden="true" />
                  <span
                    className="candle-wick"
                    aria-hidden="true"
                    ref={(el) => {
                      wicks.current[index] = el
                    }}
                  />
                  <span className="candle-wax" aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {phase === 'celebrate'
          ? story.cake.candlesOut
          : burning === 1
            ? story.cake.oneLit
            : `${burning} ${story.cake.manyLit}`}
      </p>

      {phase === 'light' ? (
        <div className="match-dock">
          <span className="match-box" aria-hidden="true" />
          <button
            type="button"
            className={held ? 'cake-match is-held' : 'cake-match'}
            aria-label={story.cake.matchAria}
            style={held ? { left: held.x, top: flamePoint(held.x, held.y, held.touch).y + 14 } : undefined}
            onPointerDown={(event) => {
              movedRef.current = false
              originRef.current = { x: event.clientX, y: event.clientY }
              setHeld({ x: event.clientX, y: event.clientY, touch: event.pointerType === 'touch' })
              play('scratch')
              try {
                event.currentTarget.setPointerCapture(event.pointerId)
              } catch {
                // Distance checks still run from the move events we do get.
              }
            }}
            onPointerMove={(event) => {
              if (!held) return
              const dx = event.clientX - originRef.current.x
              const dy = event.clientY - originRef.current.y
              if (dx * dx + dy * dy > 64) movedRef.current = true
              const touch = event.pointerType === 'touch'
              setHeld({ x: event.clientX, y: event.clientY, touch })
              consider(event.clientX, event.clientY, touch)
            }}
            onPointerUp={(event) => {
              if (!held) return
              consider(event.clientX, event.clientY, event.pointerType === 'touch')
              const tapped = !movedRef.current
              setHeld(null)
              if (tapped) lightNext()
            }}
            onPointerCancel={() => setHeld(null)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              lightNext()
            }}
          >
            <span className="cm-fire">
              <Flame alive={held !== null} wind={stillWind} reduced={reduced} seed={9} />
            </span>
            <span className="cm-head" />
            <span className="cm-stick" />
          </button>
          <p className="hint cake-hint">{held ? story.cake.matchHeld : lightLine}</p>
        </div>
      ) : null}

      {phase === 'wish' || phase === 'release' ? (
        <form
          className="wish-card"
          onSubmit={(event) => {
            event.preventDefault()
            releaseWish(draft)
          }}
        >
          <label className="sr-only" htmlFor="wish">
            სურვილი
          </label>
          <input
            id="wish"
            className="wish-input"
            value={draft}
            maxLength={140}
            placeholder={story.cake.wishPlaceholder}
            autoComplete="off"
            autoCapitalize="sentences"
            enterKeyHint="done"
            disabled={phase === 'release'}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="row">
            <button type="submit" className="seal solid wish-go" disabled={phase === 'release'}>
              {story.cake.wishRelease}
            </button>
          </div>
          <p className="hint">{story.cake.wishPrivate}</p>
        </form>
      ) : null}

      {phase === 'blow' ? (
        <div className="blow-controls">
          <button
            type="button"
            className={holding ? 'blow is-holding' : 'blow'}
            aria-pressed={holding}
            onPointerDown={(event) => {
              beginBlow()
              try {
                event.currentTarget.setPointerCapture(event.pointerId)
              } catch {
                // Holding still works without capture.
              }
            }}
            onPointerUp={endBlow}
            onPointerCancel={endBlow}
            onContextMenu={(event) => event.preventDefault()}
            onKeyDown={(event) => {
              if (event.repeat || (event.key !== ' ' && event.key !== 'Enter')) return
              event.preventDefault()
              beginBlow()
            }}
            onKeyUp={(event) => {
              if (event.key !== ' ' && event.key !== 'Enter') return
              event.preventDefault()
              endBlow()
            }}
            onBlur={endBlow}
          >
            <span ref={barEl} className="blow-fill" aria-hidden="true" />
            <span className="blow-icon" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="blow-label">{story.cake.hold}</span>
          </button>
        </div>
      ) : null}

      {phase === 'celebrate' ? (
        <button type="button" className="seal solid celebrate-next" onClick={() => go('letters')}>
          {story.cake.next}
        </button>
      ) : null}
    </section>
  )
}
