import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

const VIDEO_ID = 'L4sbDxR22z4'
const BED = 40
const RECORD = 0.86

export type SurrenderStatus = 'idle' | 'playing' | 'error'

type MusicApi = {
  musicOn: boolean
  toggleMusic: () => void
  surrender: SurrenderStatus
  toggleSurrender: () => void
  softly: (ms: number) => void
}

const MusicContext = createContext<MusicApi | null>(null)

export function useMusic(): MusicApi {
  const value = useContext(MusicContext)
  if (!value) throw new Error('The music has nowhere to sit.')
  return value
}

type YtPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  unMute?: () => void
  isMuted?: () => boolean
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void
  getPlayerState?: () => number
  setVolume: (volume: number) => void
  getVolume: () => number
  destroy: () => void
}

type YtReady = { target: YtPlayer }
type YtState = { data: number }

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string
          width?: number
          height?: number
          playerVars?: Record<string, number | string>
          events?: {
            onReady?: (event: YtReady) => void
            onError?: () => void
            onStateChange?: (event: YtState) => void
          }
        },
      ) => YtPlayer
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

let loading: Promise<void> | null = null

function loadYouTube(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    const timer = window.setTimeout(() => reject(new Error('youtube')), 12000)
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer)
      previous?.()
      resolve()
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.onerror = () => {
        window.clearTimeout(timer)
        reject(new Error('youtube'))
      }
      document.head.appendChild(script)
    }
  })
  return loading
}

function ease(t: number) {
  return t * t * (3 - 2 * t)
}

export function MusicProvider({ children, paused = false }: { children: ReactNode; paused?: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const player = useRef<YtPlayer | null>(null)
  const record = useRef<HTMLAudioElement>(null)
  const bedToken = useRef(0)
  const recordToken = useRef(0)
  const musicOn = useRef(true)
  const bedPlaying = useRef(false)
  const surrenderOn = useRef(false)
  const holdBed = useRef(false)
  const queued = useRef(true)
  const unlocked = useRef(false)
  const pausedRef = useRef(paused)
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [surrender, setSurrender] = useState<SurrenderStatus>('idle')

  const fadeBed = (to: number, ms: number, done?: () => void) => {
    const current = player.current
    if (!current) {
      done?.()
      return
    }
    const id = bedToken.current + 1
    bedToken.current = id
    let from = 0
    try {
      from = current.getVolume()
    } catch {
      from = 0
    }
    const start = performance.now()
    const timer = window.setInterval(() => {
      if (bedToken.current !== id) {
        window.clearInterval(timer)
        return
      }
      const t = Math.min(1, (performance.now() - start) / ms)
      try {
        current.setVolume(Math.round(from + (to - from) * ease(t)))
      } catch {
        // The player can vanish mid-fade. Keep going so the end still runs.
      }
      if (t >= 1) {
        window.clearInterval(timer)
        done?.()
      }
    }, 50)
  }

  const fadeRecord = (to: number, ms: number, done?: () => void) => {
    const audio = record.current
    if (!audio) {
      done?.()
      return
    }
    const id = recordToken.current + 1
    recordToken.current = id
    const from = audio.volume
    const start = performance.now()
    const timer = window.setInterval(() => {
      if (recordToken.current !== id) {
        window.clearInterval(timer)
        return
      }
      const t = Math.min(1, (performance.now() - start) / ms)
      audio.volume = from + (to - from) * ease(t)
      if (t >= 1) {
        window.clearInterval(timer)
        done?.()
      }
    }, 50)
  }

  const beginBed = () => {
    if (pausedRef.current || !musicOn.current || surrenderOn.current || holdBed.current) return
    const current = player.current
    if (!current || !unlocked.current) {
      queued.current = true
      return
    }
    queued.current = false
    try {
      if (current.isMuted?.()) {
        current.seekTo?.(0, true)
        current.unMute?.()
      }
      current.playVideo()
    } catch {
      return
    }
    if (bedPlaying.current) return
    bedPlaying.current = true
    fadeBed(BED, 2400)
  }

  const duckBed = () => {
    bedPlaying.current = false
    fadeBed(0, 1600, () => {
      try {
        player.current?.pauseVideo()
      } catch {
        // Already quiet.
      }
    })
  }

  const playSurrender = () => {
    const audio = record.current
    if (!audio) return
    surrenderOn.current = true
    setSurrender('playing')
    duckBed()
    audio.volume = 0
    audio.currentTime = 0
    fadeRecord(RECORD, 2400)
    void audio.play().catch(() => {
      recordToken.current += 1
      audio.pause()
      surrenderOn.current = false
      setSurrender('error')
      beginBed()
    })
  }

  const stopSurrender = () => {
    const audio = record.current
    if (holdBed.current) return
    holdBed.current = true
    if (!audio) {
      holdBed.current = false
      surrenderOn.current = false
      setSurrender('idle')
      beginBed()
      return
    }
    fadeRecord(0, 1600, () => {
      audio.pause()
      audio.currentTime = 0
      holdBed.current = false
      surrenderOn.current = false
      setSurrender('idle')
      beginBed()
    })
  }

  const api = useRef<MusicApi>({
    musicOn: true,
    toggleMusic: () => {},
    surrender: 'idle',
    toggleSurrender: () => {},
    softly: () => {},
  })

  api.current = {
    musicOn: musicEnabled,
    surrender,
    toggleMusic: () => {
      if (musicOn.current) {
        musicOn.current = false
        setMusicEnabled(false)
        bedPlaying.current = false
        duckBed()
        return
      }
      musicOn.current = true
      setMusicEnabled(true)
      beginBed()
    },
    toggleSurrender: () => {
      if (surrenderOn.current) stopSurrender()
      else playSurrender()
    },
    softly: (ms: number) => {
      if (surrenderOn.current) {
        fadeRecord(0.18, 600)
        window.setTimeout(() => {
          if (surrenderOn.current && !holdBed.current) fadeRecord(RECORD, 1800)
        }, ms)
        return
      }
      if (!bedPlaying.current) return
      fadeBed(8, 600)
      window.setTimeout(() => {
        if (bedPlaying.current && musicOn.current && !surrenderOn.current) fadeBed(BED, 2200)
      }, ms)
    },
  }

  useEffect(() => {
    let dead = false
    let created: YtPlayer | null = null
    const kick = () => {
      unlocked.current = true
      if (pausedRef.current) return
      if (musicOn.current && !surrenderOn.current && !holdBed.current) beginBed()
    }
    window.addEventListener('pointerdown', kick)
    window.addEventListener('keydown', kick)
    window.addEventListener('touchend', kick)
    void loadYouTube()
      .then(() => {
        if (dead || !host.current || !window.YT) return
        created = new window.YT.Player(host.current, {
          videoId: VIDEO_ID,
          width: 240,
          height: 135,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: VIDEO_ID,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (dead) {
                try {
                  event.target.destroy()
                } catch {
                  // Strict Mode already moved on.
                }
                return
              }
              player.current = event.target
              try {
                event.target.setVolume(0)
                if (musicOn.current && !surrenderOn.current) {
                  event.target.unMute?.()
                  event.target.playVideo()
                }
              } catch {
                // The first tap starts it instead.
              }
              if (queued.current && unlocked.current) beginBed()
            },
            onStateChange: (event) => {
              if (event.data === 1 && !bedPlaying.current && musicOn.current && !surrenderOn.current) {
                const muted = player.current?.isMuted?.() ?? false
                if (!muted || unlocked.current) {
                  bedPlaying.current = true
                  queued.current = false
                  fadeBed(BED, 2400)
                }
              }
              if (event.data === 0 && !pausedRef.current && musicOn.current && !surrenderOn.current && !holdBed.current) {
                try {
                  player.current?.playVideo()
                } catch {
                  // The loop will try again.
                }
              }
            },
          },
        })
      })
      .catch(() => {
        // K. stays quiet if the player never arrives. Surrender still can.
      })

    return () => {
      dead = true
      bedToken.current += 1
      recordToken.current += 1
      window.removeEventListener('pointerdown', kick)
      window.removeEventListener('keydown', kick)
      window.removeEventListener('touchend', kick)
      player.current = null
      try {
        created?.destroy()
      } catch {
        // The iframe was already gone.
      }
    }
    // The player is created once. Playback only touches refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Upright phone: everything stops exactly where it was, and resumes from there.
  useEffect(() => {
    if (pausedRef.current === paused) return
    pausedRef.current = paused
    const audio = record.current
    if (paused) {
      bedToken.current += 1
      recordToken.current += 1
      try {
        player.current?.pauseVideo()
      } catch {
        // Already quiet.
      }
      audio?.pause()
      return
    }
    if (holdBed.current) {
      // The record was fading out when she turned the phone. Finish that quietly.
      if (audio) audio.currentTime = 0
      holdBed.current = false
      surrenderOn.current = false
      setSurrender('idle')
      beginBed()
      return
    }
    if (surrenderOn.current && audio) {
      audio.volume = RECORD
      void audio.play().catch(() => undefined)
      return
    }
    if (bedPlaying.current && musicOn.current) {
      try {
        player.current?.setVolume(BED)
        player.current?.playVideo()
      } catch {
        // The next tap brings it back.
      }
      return
    }
    if (queued.current && unlocked.current) beginBed()
    // Playback only touches refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  return (
    <MusicContext.Provider value={api.current}>
      {children}
      <div className="song-dock" aria-hidden="true">
        <div ref={host} />
      </div>
      <audio ref={record} src="/surrender.flac" preload="auto" />
    </MusicContext.Provider>
  )
}

export function MusicToggle() {
  const { musicOn, toggleMusic } = useMusic()
  return (
    <button
      type="button"
      className={musicOn ? 'sound-toggle is-on' : 'sound-toggle'}
      aria-pressed={musicOn}
      onClick={toggleMusic}
    >
      <span className="dot" aria-hidden="true" />
      <span className="toggle-icon" aria-hidden="true">
        ♪
      </span>
      <span className="toggle-word">{musicOn ? 'Music on' : 'Music off'}</span>
    </button>
  )
}
