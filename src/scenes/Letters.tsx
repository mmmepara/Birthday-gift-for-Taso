import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ChapterHeading } from '../components/ChapterHeading.tsx'
import { Paper } from '../components/Paper.tsx'
import { story } from '../content/story.ts'
import { useExperience } from '../experience.ts'
import { addId } from '../lib/progress.ts'

const SEALS = ['#8a3a48', '#a8823a', '#5f7f66']
const TILTS = ['-4deg', '1.5deg', '4deg']
const WRAPS = [
  { paper: '#c47b84', ribbon: '#f6efe4' },
  { paper: '#e4c27a', ribbon: '#8a3a48' },
  { paper: '#8eae98', ribbon: '#fff1c4' },
]

export function Letters() {
  const { progress, update, play, go, reduced } = useExperience()
  const [open, setOpen] = useState<string | null>(null)
  const [opening, setOpening] = useState<string | null>(null)
  const timer = useRef(0)
  const lettersReady = story.letters.every((letter) => progress.letters.includes(letter.id))
  const giftsReady = story.gifts.every((gift) => progress.gifts.includes(gift.id))
  const ready = lettersReady && giftsReady
  const current = story.letters.find((letter) => letter.id === open) ?? null
  const seenCount = story.letters.filter((letter) => progress.letters.includes(letter.id)).length

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const show = (id: string) => {
    if (opening) return
    play('page')
    if (reduced) {
      setOpen(id)
      update((value) => addId(value, 'letters', id))
      return
    }
    setOpening(id)
    timer.current = window.setTimeout(() => {
      setOpening(null)
      setOpen(id)
      update((value) => addId(value, 'letters', id))
    }, 720)
  }

  return (
    <section className="scene letters">
      <ChapterHeading kicker={story.lettersIntro.kicker} title={story.lettersIntro.title} lede={story.lettersIntro.lede} />

      <div className="envelopes">
        {story.letters.map((letter, index) => {
          const seen = progress.letters.includes(letter.id)
          const isOpening = opening === letter.id
          return (
            <button
              key={letter.id}
              type="button"
              className={`envelope${seen ? ' is-seen' : ''}${isOpening ? ' is-opening' : ''}`}
              style={{ '--seal': SEALS[index % SEALS.length], '--tilt': TILTS[index % TILTS.length] } as CSSProperties}
              onClick={() => show(letter.id)}
            >
              <span className="env-body" aria-hidden="true">
                <span className="env-letter">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="env-pocket" />
                <span className="env-flap" />
                <span className="env-seal">{story.name.slice(0, 1)}</span>
              </span>
              <span className="env-label">{letter.seal}</span>
              <span className="env-state">{seen ? story.lettersIntro.opened : story.lettersIntro.sealed}</span>
            </button>
          )
        })}
      </div>

      <div className="letters-progress" aria-label={`${seenCount} / ${story.letters.length}`}>
        {story.letters.map((letter) => (
          <span key={letter.id} className={progress.letters.includes(letter.id) ? 'is-on' : ''} />
        ))}
      </div>

      {ready ? (
        <button type="button" className="seal solid letters-next" onClick={() => go('finale')}>
          {story.lettersIntro.next}
        </button>
      ) : (
        <p className="hint">{lettersReady && !giftsReady ? story.lettersIntro.giftsHint : story.lettersIntro.nextHint}</p>
      )}

      {current ? (
        <Paper title={current.title} onClose={() => setOpen(null)} variant={current.id === 'letter' ? 'letter' : undefined}>
          {current.id === 'letter' ? <LetterBody /> : null}
          {current.id === 'kept' ? <Memories /> : null}
          {current.id === 'gifts' ? <Gifts /> : null}
        </Paper>
      ) : null}
    </section>
  )
}

function LetterBody() {
  return (
    <article className="letter-sheet">
      <p className="letter-salute">{story.lettersIntro.salute},</p>
      {story.letterParagraphs.map((paragraph) => (
        <p className="letter-line" key={paragraph.slice(0, 24)}>
          {paragraph}
        </p>
      ))}
      <p className="letter-sign">
        <span>{story.lettersIntro.signoff}</span>
        {story.signature}
      </p>
    </article>
  )
}

function Memories() {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const start = useRef<number | null>(null)
  const last = story.memories.length
  const show = (next: number, direction: number) => {
    setDir(direction)
    setIndex((next + last) % last)
  }
  const memory = story.memories[index]
  if (!memory) return null

  return (
    <article
      className="memories"
      onPointerDown={(event) => {
        start.current = event.clientX
      }}
      onPointerUp={(event) => {
        if (start.current === null) return
        const delta = event.clientX - start.current
        start.current = null
        if (delta > 48) show(index - 1, -1)
        if (delta < -48) show(index + 1, 1)
      }}
    >
      <div key={memory.id} className="memory-page" style={{ '--dir': dir } as CSSProperties}>
        <span className="memory-number" aria-hidden="true">
          {index + 1}
        </span>
        <p className="memory-text">{memory.text}</p>
      </div>
      <div className="memory-nav">
        <button type="button" className="seal" onClick={() => show(index - 1, -1)} aria-label={story.finale.previous}>
          ←
        </button>
        <span className="memory-dots" aria-label={`${index + 1} / ${last}`}>
          {story.memories.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={i === index ? 'is-on' : ''}
              aria-label={`${i + 1}`}
              onClick={() => show(i, i > index ? 1 : -1)}
            />
          ))}
        </span>
        <button type="button" className="seal" onClick={() => show(index + 1, 1)} aria-label={story.finale.next}>
          →
        </button>
      </div>
    </article>
  )
}

function Gifts() {
  const { progress, update, play } = useExperience()

  return (
    <div className="gift-wrap">
      <p className="prose">{story.giftsLede}</p>
      <div className="gifts">
        {story.gifts.map((gift, index) => {
          const open = progress.gifts.includes(gift.id)
          const wrap = WRAPS[index % WRAPS.length]!
          return (
            <div key={gift.id} className={open ? 'gift is-open' : 'gift'}>
              <button
                type="button"
                className="gift-box"
                style={{ '--paper': wrap.paper, '--ribbon': wrap.ribbon } as CSSProperties}
                aria-label={open ? gift.label : `${story.finale.wrapped} ${index + 1}`}
                aria-expanded={open}
                onClick={() => {
                  if (open) return
                  update((value) => addId(value, 'gifts', gift.id))
                  play('chime')
                }}
              >
                <span className="gift-lid" aria-hidden="true">
                  <span className="gift-bow" />
                </span>
                <span className="gift-base" aria-hidden="true" />
                <span className="gift-glow" aria-hidden="true" />
              </button>
              <div className="gift-card">
                <p className="gift-label">{open ? gift.label : story.lettersIntro.tapToOpen}</p>
                {open ? <p className="gift-text">{gift.text}</p> : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
