import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Soundscape } from './audio/soundscape.ts'
import { Atmosphere } from './components/Atmosphere.tsx'
import { Boundary } from './components/Boundary.tsx'
import { CursorLight } from './components/CursorLight.tsx'
import { MusicProvider, MusicToggle } from './components/Music.tsx'
import { RotateNotice } from './components/RotateNotice.tsx'
import { SoundToggle } from './components/SoundToggle.tsx'
import { ExperienceContext, useExperience, type Experience } from './experience.ts'
import { useMedia } from './hooks/useMedia.ts'
import { useProgress } from './hooks/useProgress.ts'
import { holdFrames } from './lib/hold.ts'
import { CHAPTERS, replayProgress, type ChapterId } from './lib/progress.ts'
import { Cake } from './scenes/Cake.tsx'
import { Finale } from './scenes/Finale.tsx'
import { Invitation } from './scenes/Invitation.tsx'
import { Letters } from './scenes/Letters.tsx'
import { Loader } from './scenes/Loader.tsx'
import { Room } from './scenes/Room.tsx'

type Phase = 'loading' | ChapterId

/** A phone held upright. Tablets and laptops are left alone. */
const UPRIGHT_PHONE = '(orientation: portrait) and (pointer: coarse) and (max-width: 700px)'

const TITLES: Record<Phase, string> = {
  loading: 'თასოსთვის',
  invitation: 'თასოსთვის · ასანთი',
  room: 'თასოსთვის · ოთახი',
  cake: 'თასოსთვის · ტორტი',
  letters: 'თასოსთვის · წერილები',
  finale: 'თასოსთვის · ცა',
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export default function App() {
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const finePointer = useMedia('(pointer: fine)')
  const upright = useMedia(UPRIGHT_PHONE)
  const [engine] = useState(() => new Soundscape())
  const [soundOn, setSoundOn] = useState(true)
  const [progress, update] = useProgress()
  const [chapter, setChapter] = useState<Phase>('loading')
  const [visit, setVisit] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef(0)
  const resume = useRef<ChapterId>(cameBackFromLilies() ? 'finale' : progress.chapter)

  useEffect(() => {
    return () => {
      engine.dispose()
      window.clearTimeout(toastTimer.current)
    }
  }, [engine])

  useEffect(() => {
    let cancel = false
    const fontsReady = document.fonts?.ready.then(() => undefined).catch(() => undefined) ?? Promise.resolve()
    void Promise.race([Promise.all([wait(1900), fontsReady]), wait(3000)]).then(() => {
      if (!cancel) setChapter(resume.current)
    })
    return () => {
      cancel = true
    }
  }, [])

  useEffect(() => {
    document.title = TITLES[chapter]
  }, [chapter])

  useEffect(() => {
    holdFrames(upright)
    engine.hold(upright)
    document.documentElement.classList.toggle('is-held', upright)
  }, [upright, engine])

  const play = useCallback((cue: Parameters<Soundscape['play']>[0]) => {
    engine.play(cue)
  }, [engine])

  const soundWanted = useRef(true)

  useEffect(() => {
    const wake = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('.corner-toggles')) return
      if (!soundWanted.current || engine.isOn()) return
      void engine.start().then(() => setSoundOn(soundWanted.current))
    }
    window.addEventListener('pointerdown', wake)
    window.addEventListener('keydown', wake)
    return () => {
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [engine])

  const toggleSound = useCallback(async () => {
    if (soundWanted.current) {
      soundWanted.current = false
      engine.disable()
      setSoundOn(false)
      return
    }
    soundWanted.current = true
    setSoundOn(true)
    await engine.start()
  }, [engine])

  const notify = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const go = useCallback(
    (next: ChapterId) => {
      setChapter(next)
      setVisit((value) => value + 1)
      update((current) => (current.chapter === next ? current : { ...current, chapter: next }))
      window.scrollTo(0, 0)
    },
    [update],
  )

  const replay = useCallback(() => {
    update(() => replayProgress())
    setChapter('invitation')
    setVisit((value) => value + 1)
  }, [update])

  const value = useMemo<Experience>(
    () => ({ reduced, soundOn, toggleSound, play, notify, progress, update, go, replay }),
    [reduced, soundOn, toggleSound, play, notify, progress, update, go, replay],
  )

  return (
    <ExperienceContext.Provider value={value}>
      <MusicProvider paused={upright}>
      {upright ? <RotateNotice /> : null}
      <div className={progress.finaleSeen && chapter !== 'loading' ? 'shell has-nav' : 'shell'} inert={upright}>
        <a className="skip" href="#night">
          ღამეზე გადასვლა
        </a>
        <Atmosphere />
        {finePointer && !reduced ? <CursorLight /> : null}
        <div className="corner-toggles">
          <MusicToggle />
          <SoundToggle />
        </div>
        {toast ? (
          <div className="toast" role="status">
            {toast}
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {TITLES[chapter]}
        </p>
        <Boundary key={`${chapter}-${visit}`}>
          <main className="stage" id="night">
            {chapter === 'loading' ? <Loader /> : null}
            {chapter === 'invitation' ? <Invitation /> : null}
            {chapter === 'room' ? <Room /> : null}
            {chapter === 'cake' ? <Cake /> : null}
            {chapter === 'letters' ? <Letters /> : null}
            {chapter === 'finale' ? <Finale /> : null}
          </main>
        </Boundary>
        {progress.finaleSeen && chapter !== 'loading' ? <ChapterNav current={chapter} /> : null}
      </div>
      </MusicProvider>
    </ExperienceContext.Provider>
  )
}

function cameBackFromLilies(): boolean {
  return new URLSearchParams(window.location.search).get('from') === 'lilies'
}

function ChapterNav({ current }: { current: ChapterId }) {
  const { go } = useExperience()
  return (
    <nav className="night-nav" aria-label="ღამის თავიდან ნახვა">
      {CHAPTERS.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-current={item.id === current ? 'page' : undefined}
          onClick={() => go(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
