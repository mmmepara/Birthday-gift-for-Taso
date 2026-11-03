import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { Cue } from '../audio/soundscape.ts'
import { PageGlyph, PetalGlyph, StarGlyph } from '../art/illustrations.tsx'
import { DeskLamp } from '../art/penthouse.tsx'
import { ChapterHeading } from '../components/ChapterHeading.tsx'
import { Paper } from '../components/Paper.tsx'
import { useMusic } from '../components/Music.tsx'
import { story } from '../content/story.ts'
import { useExperience } from '../experience.ts'
import { addId } from '../lib/progress.ts'

type Panel = 'window' | 'book' | 'plant' | 'record' | 'lamp' | 'cat' | 'guitar' | 'photos' | null

const BULBS = ['#fff4e4', '#ffb15a', '#f3a0b5', '#9ecbff', '#e7c56a']

const SPOTS: Record<string, { x: number; y: number; fromX: number; fromY: number }> = {
  star: { x: 42, y: 74, fromX: 50, fromY: 18 },
  page: { x: 48.5, y: 77.5, fromX: 30, fromY: 77 },
  petal: { x: 55, y: 74, fromX: 48, fromY: 60 },
}
const ROOM_RATIO = 673 / 1024

function stillMissing(ids: string[]): string {
  const names = ids.map((id) => (id === 'star' ? 'ვარსკვლავი' : id === 'page' ? 'ფურცელი' : 'წყალი ლილიებისთვის'))
  if (names.length === 3) return story.room.tableHint
  if (names.length === 2) return `ისევ აკლია ${names[0]} და ${names[1]}.`
  return `მხოლოდ ${names[0] ?? 'ერთი რამ'} დარჩა.`
}

export function Room() {
  const { progress, update, play, notify, go } = useExperience()
  const [panel, setPanel] = useState<Panel>(null)
  const [taps, setTaps] = useState(0)
  const [bookOpen, setBookOpen] = useState(() => progress.keepsakes.includes('page'))
  const { surrender, toggleSurrender } = useMusic()
  const ready = story.room.keepsakes.every((item) => progress.keepsakes.includes(item.id))
  const summon = ready && !progress.finaleSeen
  const readyButton = useRef<HTMLButtonElement>(null)
  const wasReady = useRef(ready)
  const bulb = BULBS[taps % BULBS.length] ?? BULBS[0]
  const [landing, setLanding] = useState<string[]>([])
  const [complete, setComplete] = useState(ready)

  useEffect(() => {
    if (panel !== null || landing.length === 0) return
    const timer = window.setTimeout(() => setLanding([]), 1700)
    return () => window.clearTimeout(timer)
  }, [panel, landing])

  useEffect(() => {
    if (!ready || panel !== null || complete) return
    const timer = window.setTimeout(() => {
      setComplete(true)
      play('bloom')
    }, landing.length > 0 ? 1100 : 200)
    return () => window.clearTimeout(timer)
  }, [ready, panel, complete, landing.length, play])

  const waterDone = useCallback(() => {
    update((current) => addId(current, 'keepsakes', 'petal'))
    setLanding((current) => (current.includes('petal') ? current : [...current, 'petal']))
    notify(story.room.liliesWatered)
    play('chime')
  }, [update, notify, play])

  const land = (id: string) => setLanding((current) => (current.includes(id) ? current : [...current, id]))

  useEffect(() => {
    if (summon && !wasReady.current && panel === null) readyButton.current?.focus()
    wasReady.current = summon
  }, [summon, panel])

  const kept = (id: string) => progress.keepsakes.includes(id)
  const close = () => setPanel(null)
  const missing = story.room.keepsakes.filter((item) => !kept(item.id)).map((item) => item.id)

  return (
    <section className="scene room">
      <ChapterHeading kicker={story.room.kicker} title={story.room.title} lede={story.room.lede} />
      <div className={`room-stage${summon ? ' is-ready' : ''}${complete ? ' is-complete' : ''}`} style={{ '--bulb': bulb } as CSSProperties}>
        <img className="room-photo" src="/room.jpg" alt="" />

        <button type="button" className="tap tap-window" onClick={() => setPanel('window')}>
          <span className="tap-name">Window</span>
        </button>

        <button type="button" className="tap tap-guitar" onClick={() => setPanel('guitar')}>
          <img src="/guitar.png" alt="" />
          <span className="tap-name">Guitar</span>
        </button>

        <button type="button" className="tap tap-cat" onClick={() => setPanel('cat')}>
          <img src="/cat.png" alt="" />
          <span className="tap-name">Cat</span>
        </button>

        <button
          type="button"
          className={taps > 0 ? 'tap tap-lamp is-lit' : 'tap tap-lamp'}
          onClick={() => {
            setTaps((value) => value + 1)
            play('tap')
            setPanel('lamp')
          }}
        >
          <span className="lamp-wash" />
          <span className="tap-name">Lamp</span>
        </button>

        <button
          type="button"
          className="tap tap-book"
          onClick={() => {
            setBookOpen(true)
            setPanel('book')
          }}
        >
          <Notebook open={bookOpen} />
          <span className="tap-name">Notebook</span>
        </button>

        <button type="button" className={kept('petal') ? 'tap tap-lilies is-wet' : 'tap tap-lilies'} onClick={() => setPanel('plant')}>
          <img src="/lilies.png" alt="" />
          <span className="tap-name">Lilies</span>
        </button>

        <button type="button" className={surrender === 'playing' ? 'tap tap-player is-on' : 'tap tap-player'} onClick={() => setPanel('record')}>
          <img src="/player.png" alt="" />
          <span className="tap-name">Record</span>
        </button>

        <div className={ready ? 'desk-list is-done' : 'desk-list'}>
          <span className="desk-tape" aria-hidden="true" />
          <div className="desk-head">
            <p>{story.room.placeFor}</p>
            <span className="desk-count">
              {story.room.keepsakes.length - missing.length}/{story.room.keepsakes.length}
            </span>
          </div>
          <ul>
            {story.room.keepsakes.map((item) => (
              <li key={item.id} className={`desk-item desk-${item.id}${kept(item.id) ? ' is-in' : ''}`}>
                <svg className="desk-box" viewBox="0 0 20 20" aria-hidden="true">
                  <path className="box" d="M3.2 3.6 Q10 2.6 16.6 3.3 Q17.3 10 16.8 16.5 Q10 17.4 3.4 16.7 Q2.7 10 3.2 3.6z" />
                  <path className="tick" pathLength={1} d="M5.2 10.6 L8.6 14 L17.6 3.2" />
                </svg>
                <span className="desk-glyph" aria-hidden="true">
                  {item.id === 'star' ? <StarGlyph /> : null}
                  {item.id === 'page' ? <PageGlyph /> : null}
                  {item.id === 'petal' ? <PetalGlyph /> : null}
                </span>
                <span className="desk-label">{item.label}</span>
                <span className="sr-only">{kept(item.id) ? ', found' : ', not yet'}</span>
              </li>
            ))}
          </ul>
          {ready ? null : <p className="desk-missing">{stillMissing(missing)}</p>}
        </div>

        <div className="desk-keepsakes" aria-hidden="true">
          {story.room.keepsakes.map((item) => {
            const spot = SPOTS[item.id]
            if (!spot || !kept(item.id)) return null
            const flying = landing.includes(item.id)
            if (flying && panel !== null) return null
            return (
              <span
                key={item.id}
                className={`keepsake keepsake-${item.id}${flying ? ' is-landing' : ''}`}
                style={
                  {
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    '--fx': `${spot.fromX - spot.x}cqi`,
                    '--fy': `${(spot.fromY - spot.y) * ROOM_RATIO}cqi`,
                  } as CSSProperties
                }
              >
                <Keepsake id={item.id} />
              </span>
            )
          })}
        </div>

        {summon ? <div className="ready-dim" /> : null}
        <div className="room-warm" aria-hidden="true" />
        {summon ? (
          <div className="summon-wrap">
            <p>{story.room.readyTitle}</p>
            <button ref={readyButton} type="button" className="seal solid summon" onClick={() => go('cake')}>
              {story.room.readyButton}
            </button>
          </div>
        ) : null}
      </div>

      {panel === 'window' ? (
        <Paper title={story.room.window.title} onClose={close}>
          <WindowPanel
            onTake={() => {
              update((current) => addId(current, 'keepsakes', 'star'))
              land('star')
              notify(story.room.starOnTable)
              play('chime')
            }}
          />
        </Paper>
      ) : null}
      {panel === 'book' ? (
        <Paper title={story.room.book.title} onClose={close}>
          <BookPanel
            onTake={() => {
              update((current) => addId(current, 'keepsakes', 'page'))
              land('page')
              notify(story.room.pageOnTable)
              play('chime')
            }}
          />
        </Paper>
      ) : null}
      {panel === 'plant' ? (
        <Paper title={story.room.plant.title} onClose={close}>
          <LilyPanel
            watered={kept('petal')}
            onDone={waterDone}
          />
        </Paper>
      ) : null}
      {panel === 'record' ? (
        <Paper title={story.room.record.title} onClose={close}>
          <RecordPanel status={surrender} onToggle={toggleSurrender} />
        </Paper>
      ) : null}
      {panel === 'lamp' ? (
        <Paper title={story.room.lamp.title} onClose={close}>
          <LampPanel
            taps={taps}
            bulb={bulb}
            onTap={() => {
              setTaps((value) => value + 1)
              play('tap')
            }}
          />
        </Paper>
      ) : null}
      {panel === 'cat' ? (
        <Paper title={story.room.cat.title} onClose={close}>
          <CatPanel />
        </Paper>
      ) : null}
      {panel === 'guitar' ? (
        <Paper title={story.room.guitar.title} onClose={close}>
          <GuitarPanel />
        </Paper>
      ) : null}
      {panel === 'photos' ? (
        <Paper title={story.room.galleryTitle} onClose={close}>
          <GalleryPanel />
        </Paper>
      ) : null}
    </section>
  )
}

const FLIGHTS = [
  { x0: 20, y0: 8, x1: 60, y1: 32 },
  { x0: 80, y0: 6, x1: 40, y1: 30 },
  { x0: 34, y0: 4, x1: 74, y1: 26 },
  { x0: 70, y0: 12, x1: 28, y1: 34 },
]
const TWINKLES = [
  { x: 24, y: 14 }, { x: 31, y: 30 }, { x: 46, y: 9 }, { x: 55, y: 22 },
  { x: 66, y: 12 }, { x: 74, y: 28 }, { x: 40, y: 36 }, { x: 60, y: 40 },
]
const ASPECT = 750 / 1024

function WindowPanel({ onTake }: { onTake: () => void }) {
  const { progress, reduced, play } = useExperience()
  const [had] = useState(() => progress.keepsakes.includes('star'))
  const [run, setRun] = useState(0)
  const [flying, setFlying] = useState(!had)
  const [caught, setCaught] = useState<{ x: number; y: number } | null>(null)
  const [misses, setMisses] = useState(0)
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null)
  const sky = useRef<HTMLDivElement>(null)
  const starEl = useRef<HTMLButtonElement>(null)
  const waitTimer = useRef(0)
  const taken = useRef(had)

  useEffect(() => () => window.clearTimeout(waitTimer.current), [])

  const flight = FLIGHTS[run % FLIGHTS.length] ?? FLIGHTS[0]!
  const angle = (Math.atan2((flight.y1 - flight.y0) * ASPECT, flight.x1 - flight.x0) * 180) / Math.PI

  const catchStar = () => {
    if (taken.current || !sky.current || !starEl.current) return
    const box = sky.current.getBoundingClientRect()
    const rect = starEl.current.getBoundingClientRect()
    taken.current = true
    setCaught({
      x: ((rect.left + rect.width / 2 - box.left) / box.width) * 100,
      y: ((rect.top + rect.height / 2 - box.top) / box.height) * 100,
    })
    setFlying(false)
    play('catch')
    onTake()
  }

  const miss = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (taken.current || event.target !== event.currentTarget) return
    const box = event.currentTarget.getBoundingClientRect()
    setRipple({ x: ((event.clientX - box.left) / box.width) * 100, y: ((event.clientY - box.top) / box.height) * 100, id: Date.now() })
    setMisses((value) => value + 1)
    play('tap')
  }

  const status = had
    ? story.room.window.already
    : caught
      ? story.room.window.found
      : misses > 0
        ? story.room.window.miss[(misses - 1) % story.room.window.miss.length]
        : story.room.window.hint

  return (
    <>
      <p className="prose">{story.room.window.body}</p>
      <div className={`lookout${caught ? ' is-caught' : ''}${had ? ' is-had' : ''}`}>
        <img className="lookout-photo" src="/window.jpg" alt="" />
        <div ref={sky} className="lookout-sky" onPointerDown={miss}>
          {TWINKLES.map((point, index) => (
            <span key={index} className="twinkle" style={{ left: `${point.x}%`, top: `${point.y}%`, animationDelay: `${index * 0.37}s` }} aria-hidden="true" />
          ))}
          {ripple ? <span key={ripple.id} className="sky-ripple" style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }} aria-hidden="true" /> : null}
          {flying ? (
            <button
              key={run}
              ref={starEl}
              type="button"
              className={reduced ? 'shooting-star is-still' : 'shooting-star'}
              aria-label={story.room.window.catchLabel}
              style={
                {
                  '--x0': `${flight.x0}%`,
                  '--y0': `${flight.y0}%`,
                  '--x1': `${flight.x1}%`,
                  '--y1': `${flight.y1}%`,
                  '--angle': `${angle}deg`,
                } as CSSProperties
              }
              onPointerDown={(event) => {
                event.stopPropagation()
                catchStar()
              }}
              onClick={(event) => {
                if (event.detail === 0) catchStar()
              }}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) return
                setFlying(false)
                waitTimer.current = window.setTimeout(() => {
                  setRun((value) => value + 1)
                  setFlying(true)
                }, 1100)
              }}
            >
              <span className="shooting-tail" aria-hidden="true" />
              <span className="shooting-head" aria-hidden="true" />
            </button>
          ) : null}
          {caught || had ? (
            <span
              className="caught-star"
              style={{ '--cx': `${caught?.x ?? 50}%`, '--cy': `${caught?.y ?? 36}%` } as CSSProperties}
              aria-hidden="true"
            >
              <StarGlyph />
            </span>
          ) : null}
        </div>
        {!had && !caught ? (
          <p className="lookout-hint" aria-hidden="true">
            <StarGlyph /> {story.room.window.chip}
          </p>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </>
  )
}

function BookPanel({ onTake }: { onTake: () => void }) {
  const { progress, play } = useExperience()
  const pages = story.room.book.pages
  const had = progress.keepsakes.includes('page')
  const [page, setPage] = useState(had ? pages.length - 1 : 0)
  const [note, setNote] = useState<string | null>(had ? story.room.book.already : null)
  const sent = useRef(had)
  const text = pages[page] ?? ''

  return (
    <>
      {page === pages.length - 1 ? (
        <div className="book-note">
          <p className="book-note-from">{story.room.book.noteFrom}</p>
          <p className="book-note-text">{text}</p>
          <p className="book-note-sign">{story.room.book.sign}</p>
        </div>
      ) : (
        <p className="prose book-page">{text}</p>
      )}
      <p className="hint">
        {page + 1} / {pages.length}
      </p>
      <div className="row">
        {page < pages.length - 1 ? (
          <button
            type="button"
            className="seal"
            onClick={() => {
              setPage((value) => value + 1)
              play('page')
            }}
          >
            {story.room.turnPage}
          </button>
        ) : null}
        {page === pages.length - 1 && !had && note !== story.room.book.found ? (
          <button
            type="button"
            className="seal solid"
            onClick={() => {
              if (sent.current) return
              sent.current = true
              setNote(story.room.book.found)
              onTake()
            }}
          >
            {story.room.book.keep}
          </button>
        ) : null}
      </div>
      {note ? <p className="found-line">{note}</p> : null}
    </>
  )
}

function Notebook({ open }: { open: boolean }) {
  return (
    <span className={open ? 'notebook is-open' : 'notebook'} aria-hidden="true">
      <span className="nb-cover" />
      <span className="nb-sheet left" />
      <span className="nb-sheet right" />
    </span>
  )
}

const DROPS = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 37) % 100,
  delay: ((i * 0.137) % 0.8).toFixed(2),
  size: 3 + ((i * 7) % 4),
}))
const SPARKS = [
  { x: 18, y: 22 },
  { x: 74, y: 16 },
  { x: 86, y: 44 },
  { x: 12, y: 52 },
  { x: 50, y: 6 },
  { x: 62, y: 38 },
]
const POUR_MS = 2600

function LilyPanel({ watered, onDone }: { watered: boolean; onDone: () => void }) {
  const { play } = useExperience()
  const [fill, setFill] = useState(watered ? 1 : 0)
  const [pouring, setPouring] = useState(false)
  const [bloom, setBloom] = useState(false)
  const holding = useRef(false)
  const until = useRef(0)
  const pressedAt = useRef(0)
  const fillRef = useRef(fill)
  const doneRef = useRef(watered)
  const done = fill >= 1

  useEffect(() => {
    if (!pouring) return
    let frame = 0
    let last = performance.now()
    let nextSound = 0
    const loop = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      if (now >= nextSound) {
        play('pour')
        nextSound = now + 520
      }
      fillRef.current = Math.min(1, fillRef.current + dt / POUR_MS)
      setFill(fillRef.current)
      if (fillRef.current >= 1 && !doneRef.current) {
        doneRef.current = true
        holding.current = false
        setPouring(false)
        setBloom(true)
        onDone()
        return
      }
      if (!holding.current && now >= until.current) {
        setPouring(false)
        return
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [pouring, play, onDone])

  const begin = () => {
    if (doneRef.current) return
    holding.current = true
    pressedAt.current = performance.now()
    setPouring(true)
  }
  const end = () => {
    if (!holding.current) return
    holding.current = false
    const held = performance.now() - pressedAt.current
    until.current = held < 280 ? performance.now() + 700 : 0
  }

  const line = done
    ? story.room.plant.found
    : fill > 0.45
      ? story.room.plant.pours[1] ?? story.room.plant.pours[0]
      : fill > 0
        ? story.room.plant.pours[0]
        : story.room.plant.intro

  return (
    <>
      <div className={`lily-hero water-hero${pouring ? ' is-pouring' : ''}${bloom ? ' is-bloom' : ''}`}>
        <span className="lily-frame">
          <img
            src="/lilies.png"
            alt=""
            style={
              {
                filter: `saturate(${0.72 + fill * 0.38}) brightness(${0.9 + fill * 0.12})`,
                transform: `scaleY(${0.955 + fill * 0.045}) rotate(${(1 - fill) * -2}deg)`,
              } as CSSProperties
            }
          />
          <span className="shower" aria-hidden="true">
            {DROPS.map((drop) => (
              <i
                key={drop.x}
                style={{ left: `${drop.x}%`, animationDelay: `${drop.delay}s`, width: drop.size, height: drop.size * 1.6 } as CSSProperties}
              />
            ))}
          </span>
          <svg className="can" viewBox="0 0 120 90" aria-hidden="true">
            <defs>
              <linearGradient id="can-metal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#a8683a" />
                <stop offset="0.35" stopColor="#e6b07a" />
                <stop offset="0.6" stopColor="#c98a52" />
                <stop offset="1" stopColor="#8f5530" />
              </linearGradient>
            </defs>
            <path d="M84 38 C112 34 112 74 86 74" fill="none" stroke="#8f5530" strokeWidth="6" strokeLinecap="round" />
            <path d="M44 32 C46 12 76 12 78 32" fill="none" stroke="#a8683a" strokeWidth="5" strokeLinecap="round" />
            <path d="M36 62 L9 33 L13 29 L40 54 Z" fill="url(#can-metal)" stroke="#8f5530" strokeWidth="1" strokeLinejoin="round" />
            <ellipse cx="10" cy="30" rx="7.5" ry="4.5" transform="rotate(-45 10 30)" fill="#c98a52" stroke="#8f5530" strokeWidth="1" />
            <path d="M32 30 H90 L94 78 Q94 84 88 84 H34 Q28 84 28 78 Z" fill="url(#can-metal)" stroke="#8f5530" strokeWidth="1.2" />
            <path d="M32 30 H90" stroke="#f2cf9f" strokeWidth="3" strokeLinecap="round" />
            <path d="M36 40 Q38 62 36 78" stroke="rgba(255,240,220,0.55)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
          {bloom
            ? SPARKS.map((spark, index) => (
                <span key={index} className="lily-spark" style={{ left: `${spark.x}%`, top: `${spark.y}%`, animationDelay: `${index * 0.08}s` }} aria-hidden="true">
                  ✦
                </span>
              ))
            : null}
        </span>
      </div>
      <div className="water-gauge" aria-hidden="true">
        <svg viewBox="0 0 16 20">
          <path d="M8 1 C8 1 2 9 2 13 a6 6 0 0 0 12 0 C14 9 8 1 8 1z" fill="#6fa6d6" />
        </svg>
        <span className="water-track">
          <span className="water-fill" style={{ transform: `scaleX(${fill})` }} />
        </span>
      </div>
      <p className="prose">{line}</p>
      {done ? (
        <p className="found-line">{story.room.plant.already}</p>
      ) : (
        <button
          type="button"
          className={pouring ? 'seal solid pour-btn is-pouring' : 'seal solid pour-btn'}
          onPointerDown={(event) => {
            begin()
            try {
              event.currentTarget.setPointerCapture(event.pointerId)
            } catch {
              // Pouring still stops on pointerup.
            }
          }}
          onPointerUp={end}
          onPointerCancel={end}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.repeat || (event.key !== ' ' && event.key !== 'Enter')) return
            event.preventDefault()
            begin()
          }}
          onKeyUp={(event) => {
            if (event.key !== ' ' && event.key !== 'Enter') return
            event.preventDefault()
            end()
          }}
          onBlur={end}
        >
          {pouring ? story.room.plant.watering : story.room.plant.water}
        </button>
      )}
    </>
  )
}

function RecordPanel({ status, onToggle }: { status: 'idle' | 'playing' | 'error'; onToggle: () => void }) {
  const playing = status === 'playing'
  return (
    <div className="record-panel">
      <div className={playing ? 'vinyl is-on' : 'vinyl'} aria-hidden="true" />
      <p className="song-title">{story.room.record.songTitle}</p>
      <p className="hint">{story.room.record.songArtist}</p>
      <p className="prose">{story.room.record.note}</p>
      {playing ? (
        <div className="sleeve-note">
          <p className="sleeve-title">{story.room.record.sleeveTitle}</p>
          <p className="whisper">{story.room.record.sleeve}</p>
        </div>
      ) : null}
      {status === 'error' ? (
        <p className="hint">{story.room.record.error}</p>
      ) : null}
      <button type="button" className="seal solid" onClick={onToggle}>
        {playing ? story.room.record.playing : story.room.record.play}
      </button>
    </div>
  )
}

function LampPanel({ bulb, onTap }: { taps: number; bulb: string; onTap: () => void }) {
  return (
    <>
      <div className="lamp-hero" style={{ '--bulb': bulb } as CSSProperties}>
        <DeskLamp />
      </div>
      <p className="prose">{story.room.lamp.body}</p>
      <button type="button" className="seal" onClick={onTap}>
        {story.room.lamp.sensor}
      </button>
    </>
  )
}

function GalleryPanel() {
  const [index, setIndex] = useState(0)
  const photo = story.gallery[index]
  if (!photo) return <p className="prose">{story.room.galleryEmpty}</p>
  return (
    <figure className="frame">
      <img src={photo.src} alt={photo.alt} />
      {story.gallery.length > 1 ? (
        <div className="row">
          <button type="button" className="seal" onClick={() => setIndex((value) => (value + story.gallery.length - 1) % story.gallery.length)}>
            {story.finale.previous}
          </button>
          <button type="button" className="seal" onClick={() => setIndex((value) => (value + 1) % story.gallery.length)}>
            {story.finale.next}
          </button>
        </div>
      ) : null}
    </figure>
  )
}

function Keepsake({ id }: { id: string }) {
  if (id === 'star') {
    return (
      <svg viewBox="0 0 40 40">
        <path d="M20 2.5 L23.4 16.6 L37.5 20 L23.4 23.4 L20 37.5 L16.6 23.4 L2.5 20 L16.6 16.6Z" fill="#f6d27a" stroke="#c9963a" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M20 10 L21.3 18.7 L30 20 L21.3 21.3 L20 30 L18.7 21.3 L10 20 L18.7 18.7Z" fill="#fff6dc" />
      </svg>
    )
  }
  if (id === 'page') {
    return (
      <svg viewBox="0 0 44 40">
        <path d="M5 5 H32 L39 12 V35 H5Z" fill="#f8f1e3" stroke="#c9b597" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M32 5 V12 H39" fill="#e7d9be" stroke="#c9b597" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M10 15 H29 M10 20 H34 M10 25 H33 M10 30 H24" stroke="#b49f82" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M28 31 c1.6-2.4 4.4-2.4 4 0 c-0.4 2.2-4 3.4-4 3.4 s-3.6-1.2-4-3.4 c-0.4-2.4 2.4-2.4 4 0z" fill="#d4788c" transform="translate(4 -3) scale(0.8)" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 40 40">
      <path d="M20 22 C19 28 17 33 13 38" stroke="#5f8a52" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <path
          key={angle}
          d="M20 19 C16.5 14 17.2 7 20 3 C22.8 7 23.5 14 20 19Z"
          fill={angle % 120 === 0 ? '#f7b9c8' : '#f3a3b7'}
          stroke="#d27a90"
          strokeWidth="0.9"
          transform={`rotate(${angle} 20 19)`}
        />
      ))}
      <circle cx="20" cy="19" r="2.4" fill="#f7e3a0" />
      <circle cx="17.4" cy="15.6" r="0.9" fill="#b5532f" />
      <circle cx="22.8" cy="15.8" r="0.9" fill="#b5532f" />
      <circle cx="20" cy="14.2" r="0.9" fill="#b5532f" />
    </svg>
  )
}

function CatPanel() {
  const { play } = useExperience()
  const [pets, setPets] = useState(0)
  const [hearts, setHearts] = useState<{ id: number; dx: number }[]>([])
  const nextId = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const pet = () => {
    setPets((value) => value + 1)
    play('purr')
    const id = nextId.current
    nextId.current += 1
    setHearts((current) => [...current, { id, dx: Math.round(Math.random() * 60 - 30) }])
    timers.current.push(window.setTimeout(() => setHearts((current) => current.filter((heart) => heart.id !== id)), 1300))
  }

  const lines = story.room.cat.pets
  const line = pets === 0 ? null : pets >= 5 ? story.room.cat.secret : lines[(pets - 1) % lines.length]

  return (
    <>
      <div className="lily-hero">
        <button type="button" className="cat-pet" onClick={pet} aria-label={story.room.cat.pet}>
          <img key={pets} className={pets > 0 ? 'is-petted' : ''} src="/cat.png" alt="" />
          {hearts.map((heart) => (
            <span key={heart.id} className="cat-heart" style={{ '--dx': `${heart.dx}px` } as CSSProperties} aria-hidden="true">
              ♥
            </span>
          ))}
        </button>
      </div>
      <p className="prose">{story.room.cat.body}</p>
      {line ? (
        <p key={pets >= 5 ? 'secret' : pets} className={pets >= 5 ? 'whisper cat-line is-secret' : 'whisper cat-line'}>
          {line}
        </p>
      ) : (
        <p className="hint">{story.room.cat.pet}</p>
      )}
    </>
  )
}

const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e']

function GuitarPanel() {
  const { play, soundOn } = useExperience()
  const [rings, setRings] = useState<number[]>(() => STRING_NAMES.map(() => 0))
  const [touched, setTouched] = useState<number[]>([])
  const box = useRef<HTMLDivElement>(null)
  const down = useRef(false)
  const last = useRef(-1)

  const hit = (index: number) => {
    play(`string${index}` as Cue)
    setRings((current) => current.map((value, i) => (i === index ? value + 1 : value)))
    setTouched((current) => (current.includes(index) ? current : [...current, index]))
  }

  const at = (y: number) => {
    const rect = box.current?.getBoundingClientRect()
    if (!rect) return -1
    const index = Math.floor(((y - rect.top) / rect.height) * STRING_NAMES.length)
    return Math.max(0, Math.min(STRING_NAMES.length - 1, index))
  }

  const onDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    down.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    const index = at(event.clientY)
    last.current = index
    if (index >= 0) hit(index)
  }
  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!down.current) return
    const index = at(event.clientY)
    if (index < 0 || index === last.current) return
    const step = index > last.current ? 1 : -1
    for (let i = last.current + step; i !== index + step; i += step) hit(i)
    last.current = index
  }
  const onUp = () => {
    down.current = false
    last.current = -1
  }

  const done = touched.length === STRING_NAMES.length

  return (
    <>
      <div className="lily-hero">
        <img src="/guitar.png" alt="" />
      </div>
      <p className="prose">{story.room.guitar.body}</p>
      <div
        ref={box}
        className="fretboard"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {STRING_NAMES.map((name, index) => (
          <button
            key={name + index}
            type="button"
            className="gstring"
            style={{ '--gauge': `${3.2 - index * 0.4}px` } as CSSProperties}
            aria-label={name}
            onClick={(event) => {
              if (event.detail === 0) hit(index)
            }}
          >
            <span className="gstring-name">{name}</span>
            <span key={rings[index]} className={rings[index] ? 'gstring-wire is-ringing' : 'gstring-wire'} />
          </button>
        ))}
      </div>
      <p className={done ? 'whisper guitar-line is-secret' : 'hint'}>
        {done ? story.room.guitar.secret : soundOn ? story.room.guitar.hint : story.room.guitar.soundOff}
      </p>
    </>
  )
}
