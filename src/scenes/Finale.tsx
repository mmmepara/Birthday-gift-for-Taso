import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ChapterHeading } from '../components/ChapterHeading.tsx'
import { Starfield } from '../components/Starfield.tsx'
import { story } from '../content/story.ts'
import { useExperience } from '../experience.ts'

/** Six points of a heart. She lights the first five; the sixth closes it on its own. */
const POINTS = [
  { x: 50, y: 30 },
  { x: 30, y: 14 },
  { x: 14, y: 38 },
  { x: 50, y: 86 },
  { x: 86, y: 38 },
  { x: 70, y: 14 },
]
const HEART =
  'M50,30 C46,20 38,12 30,14 C20,16 12,26 14,38 C16,54 36,70 50,86 C64,70 84,54 86,38 C88,26 80,16 70,14 C62,12 54,20 50,30 Z'
const FAR_LANTERNS = [
  { x: 12, d: 0, s: 0.5 },
  { x: 26, d: 2.4, s: 0.7 },
  { x: 41, d: 1.1, s: 0.45 },
  { x: 63, d: 3.2, s: 0.6 },
  { x: 78, d: 0.6, s: 0.5 },
  { x: 90, d: 2, s: 0.4 },
]

function SkyLantern() {
  return (
    <svg viewBox="0 0 60 80" aria-hidden="true">
      <defs>
        <radialGradient id="lantern-core" cx="50%" cy="70%" r="70%">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset="0.45" stopColor="#ffc46e" />
          <stop offset="1" stopColor="#e2763a" />
        </radialGradient>
      </defs>
      <path d="M12 6 Q30 0 48 6 L54 64 Q30 72 6 64 Z" fill="url(#lantern-core)" />
      <path d="M22 4 L18 66 M38 4 L42 66" stroke="rgba(160, 70, 30, 0.35)" strokeWidth="1.2" fill="none" />
      <ellipse cx="30" cy="66" rx="24" ry="5" fill="#b0562a" opacity="0.6" />
      <circle cx="30" cy="70" r="3.5" fill="#fff6df" />
    </svg>
  )
}

const LILIES_URL = `${import.meta.env.BASE_URL}lilies/index.html`

/** Back from the lilies: the sky is already finished, so start at the last light. */
function backFromLilies(): boolean {
  return new URLSearchParams(window.location.search).get('from') === 'lilies'
}

export function Finale() {
  const { reduced, play, notify, update, go } = useExperience()
  const total = story.finale.stars.length
  const [returned] = useState(backFromLilies)
  const [lit, setLit] = useState(returned ? total : 0)
  const [closed, setClosed] = useState(returned)
  const [lantern, setLantern] = useState(returned)
  const [landed, setLanded] = useState(returned)
  const [secret, setSecret] = useState(false)
  const timers = useRef<number[]>([])
  const done = lit >= total

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  useEffect(() => {
    if (!returned) return
    const url = new URL(window.location.href)
    url.searchParams.delete('from')
    window.history.replaceState(null, '', url)
  }, [returned])

  useEffect(() => {
    if (!done || returned) return
    update((current) => (current.finaleSeen ? current : { ...current, finaleSeen: true }))
    timers.current.push(
      window.setTimeout(
        () => {
          setClosed(true)
          play('phrase')
        },
        reduced ? 100 : 900,
      ),
    )
  }, [done, returned, update, play, reduced])

  const choose = (index: number) => {
    if (done) return
    if (index === lit) {
      setLit(index + 1)
      play(`candle${Math.min(index, 6)}` as Parameters<typeof play>[0])
      return
    }
    if (index > lit) {
      notify(story.finale.later)
      play('tap')
    }
  }

  const releaseLantern = () => {
    setLantern(true)
    play('bloom')
    timers.current.push(window.setTimeout(() => setLanded(true), reduced ? 200 : 2600))
  }

  const lines = POINTS.slice(0, Math.max(0, Math.min(lit, total) - 1)).map((from, index) => ({ from, to: POINTS[index + 1]! }))

  return (
    <section className={`scene finale${done ? ' is-complete' : ''}${closed ? ' is-closed' : ''}${lantern ? ' is-lantern' : ''}${landed ? ' is-landed' : ''}`}>
      <Starfield reduced={reduced} />
      <ChapterHeading kicker={story.finale.kicker} title={story.finale.title} lede={done ? '' : story.finale.lede} />

      <div className="sky">
        <svg className="constellation" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {lines.map(({ from, to }) => (
            <line
              key={`${from.x}-${to.x}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              pathLength={1}
            />
          ))}
          {done ? (
            <>
              <line x1={POINTS[4]!.x} y1={POINTS[4]!.y} x2={POINTS[5]!.x} y2={POINTS[5]!.y} pathLength={1} className="auto-line" />
              <line x1={POINTS[5]!.x} y1={POINTS[5]!.y} x2={POINTS[0]!.x} y2={POINTS[0]!.y} pathLength={1} className="auto-line late" />
            </>
          ) : null}
          {closed ? (
            <>
              <path d={HEART} className="heart-glow" />
              <path d={HEART} className="heart-line" pathLength={1} />
            </>
          ) : null}
        </svg>

        {POINTS.map((point, index) => {
          const auto = index >= total
          const on = auto ? done : index < lit
          const next = !done && index === lit
          return auto ? (
            <span
              key={index}
              className={on ? 'sky-star is-auto is-on' : 'sky-star is-auto'}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              aria-hidden="true"
            >
              <i />
            </span>
          ) : (
            <button
              key={index}
              type="button"
              className={`sky-star${on ? ' is-on' : ''}${next ? ' is-next' : ''}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              aria-label={`ვარსკვლავი ${index + 1} / ${total}`}
              onClick={() => choose(index)}
            >
              <i aria-hidden="true" />
              {next ? (
                <span className="star-cue" aria-hidden="true">
                  {lit === 0 ? story.finale.tapFirst : story.finale.tapNext}
                </span>
              ) : null}
            </button>
          )
        })}

        {lantern ? (
          <>
            <span className={landed ? 'lantern-fly is-high' : 'lantern-fly'} aria-hidden="true">
              <SkyLantern />
            </span>
            {FAR_LANTERNS.map((far) => (
              <span
                key={far.x}
                className="lantern-far"
                style={{ left: `${far.x}%`, animationDelay: `${far.d}s`, '--s': far.s } as CSSProperties}
                aria-hidden="true"
              >
                <SkyLantern />
              </span>
            ))}
            <button type="button" className="secret-star" aria-label="კიდევ ერთი ვარსკვლავი" onClick={() => setSecret(true)}>
              ✦
            </button>
          </>
        ) : null}
      </div>

      <p className={closed ? 'sky-sentence is-complete' : 'sky-sentence'} aria-live="polite">
        {story.finale.stars.map((line, index) =>
          index < lit ? (
            <span key={line} className={index === lit - 1 && !closed ? 'is-fresh' : undefined}>
              {line}{' '}
            </span>
          ) : null,
        )}
      </p>

      {!done ? (
        <button
          type="button"
          className="seal quiet"
          onClick={() => {
            setLit(total)
          }}
        >
          {story.finale.unfold}
        </button>
      ) : closed ? (
        <div className="finale-reveal">
          {landed ? null : <p className="lede finale-body">{story.finale.body}</p>}
          {!lantern ? (
            <button type="button" className="lantern-btn" onClick={releaseLantern}>
              <span className="lantern-icon">
                <SkyLantern />
              </span>
              <span>{story.finale.lantern}</span>
            </button>
          ) : landed ? (
            <div className="last-light">
              <p className="display last-line">
                {story.finale.lastLine.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <p className="signature">{story.finale.signature}</p>
              {secret ? <p className="prose secret">{story.finale.secret}</p> : null}
              <div className="row last-row">
                <button type="button" className="seal solid" onClick={() => go('room')}>
                  {story.finale.wander}
                </button>
                <a className="lilies-btn" href={LILIES_URL}>
                  <span className="lilies-logo" aria-hidden="true">
                    <img src={`${import.meta.env.BASE_URL}lilies.png`} alt="" />
                  </span>
                  <span className="lilies-text">{story.finale.lilies}</span>
                  <span className="lilies-arrow" aria-hidden="true">
                    👉
                  </span>
                </a>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
