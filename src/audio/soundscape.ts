export type Cue =
  | 'strike'
  | 'chime'
  | 'whoosh'
  | 'extinguish'
  | 'page'
  | 'bloom'
  | 'tap'
  | 'phrase'
  | 'light'
  | 'purr'
  | 'pour'
  | 'catch'
  | 'scratch'
  | 'ignite'
  | 'pop'
  | 'birthday'
  | 'wish'
  | `candle${0 | 1 | 2 | 3 | 4 | 5 | 6}`
  | `string${0 | 1 | 2 | 3 | 4 | 5}`

const CANDLE_NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66]
const B = 0.36
const BIRTHDAY: [number, number][] = [
  [392, 0.75], [392, 0.25], [440, 1], [392, 1], [523.25, 1], [493.88, 2],
  [392, 0.75], [392, 0.25], [440, 1], [392, 1], [587.33, 1], [523.25, 2],
  [392, 0.75], [392, 0.25], [783.99, 1], [659.25, 1], [523.25, 1], [493.88, 1], [440, 2],
  [698.46, 0.75], [698.46, 0.25], [659.25, 1], [523.25, 1], [587.33, 1], [523.25, 3],
]
const STRINGS = [82.41, 110, 146.83, 196, 246.94, 329.63]

export class Soundscape {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private enabled = false
  private generation = 0
  private bell = 0
  private nodes: AudioScheduledSourceNode[] = []
  private held = false

  isOn(): boolean {
    return this.enabled
  }

  async start(): Promise<void> {
    this.generation += 1
    try {
      if (!this.ctx || this.ctx.state === 'closed') this.ctx = new AudioContext()
      const ctx = this.ctx
      const resume = ctx.state === 'suspended' && !this.held ? ctx.resume() : Promise.resolve()
      this.ensureMaster()
      const now = ctx.currentTime
      this.master!.gain.cancelScheduledValues(now)
      this.master!.gain.setValueAtTime(0.0001, now)
      this.master!.gain.exponentialRampToValueAtTime(0.9, now + 0.35)
      this.enabled = true
      this.startAmbient()
      await resume
    } catch {
      this.enabled = false
    }
  }

  disable(): void {
    const generation = this.generation + 1
    this.generation = generation
    this.enabled = false
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(now)
      const current = Math.max(0.0001, this.master.gain.value)
      this.master.gain.setValueAtTime(current, now)
      this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
    }
    window.setTimeout(() => {
      if (this.generation === generation) this.stopAmbient()
    }, 280)
  }

  /** Silences everything while the phone is upright, and picks up where it was. */
  hold(on: boolean): void {
    this.held = on
    if (!this.ctx || this.ctx.state === 'closed') return
    if (on) void this.ctx.suspend().catch(() => undefined)
    else if (this.enabled) void this.ctx.resume().catch(() => undefined)
  }

  play(cue: Cue): void {
    if (this.held || !this.enabled || !this.ctx || !this.master) return
    try {
      switch (cue) {
        case 'strike':
          this.burst(0.12, 1400, 0.7, 0.2)
          this.tone(1860, 0.08, 0.05, 'triangle', 0)
          break
        case 'whoosh':
          this.burst(0.45, 520, 0.6, 0.08)
          break
        case 'extinguish':
          this.burst(0.18, 900, 0.8, 0.06)
          this.tone(420, 0.25, 0.03, 'sine', 0, 180)
          break
        case 'chime':
          this.tone(523.25, 0.55, 0.045, 'sine', 0)
          this.tone(659.25, 0.7, 0.032, 'sine', 0.05)
          this.tone(783.99, 0.85, 0.022, 'sine', 0.1)
          break
        case 'light':
          this.burst(0.08, 1680, 0.55, 0.09)
          this.tone(659.25, 0.2, 0.04, 'sine', 0)
          this.tone(880, 0.32, 0.026, 'sine', 0.04)
          break
        case 'page':
          this.burst(0.05, 1800, 2, 0.04)
          this.tone(660, 0.12, 0.03, 'sine', 0)
          break
        case 'tap':
          this.tone(520, 0.07, 0.03, 'sine', 0)
          break
        case 'phrase':
          this.phrase()
          break
        case 'bloom':
          this.tone(196, 1.6, 0.04, 'sine', 0)
          this.phrase()
          break
        case 'pop':
          this.tone(160, 0.28, 0.16, 'sine', 0, 45)
          this.burst(0.12, 900, 0.6, 0.22)
          this.burst(0.5, 3600, 0.5, 0.05, 0.05)
          this.tone(160, 0.28, 0.12, 'sine', 0.18, 45)
          this.burst(0.12, 1100, 0.6, 0.16, 0.18)
          break
        case 'birthday':
          this.birthday()
          break
        case 'wish':
          for (let i = 0; i < 6; i += 1) this.chime(1318.5 * Math.pow(1.122, i), i * 0.09, 0.9, 0.014)
          break
        case 'scratch':
          this.burst(0.07, 2600 + Math.random() * 1400, 1.4, 0.05)
          break
        case 'ignite':
          this.burst(0.16, 1800, 0.7, 0.22)
          this.burst(0.9, 420, 0.5, 0.12, 0.05)
          this.tone(110, 1.2, 0.05, 'sine', 0.04, 160)
          this.tone(523.25, 1.4, 0.02, 'sine', 0.3)
          this.tone(783.99, 1.6, 0.016, 'sine', 0.42)
          break
        case 'catch':
          this.tone(1046.5, 0.5, 0.04, 'sine', 0)
          this.tone(1318.5, 0.6, 0.032, 'sine', 0.07)
          this.tone(1568, 0.8, 0.026, 'sine', 0.14)
          this.tone(2093, 1.1, 0.018, 'sine', 0.22)
          break
        case 'pour':
          this.burst(0.6, 2600, 0.6, 0.035)
          for (let i = 0; i < 3; i += 1) this.tone(1400 + Math.random() * 1400, 0.06, 0.012, 'sine', Math.random() * 0.5)
          break
        case 'purr':
          for (let i = 0; i < 14; i += 1) this.burst(0.07, 140, 0.9, 0.07, i * 0.085)
          break
        default:
          if (cue.startsWith('candle')) {
            this.burst(0.18, 1500, 0.6, 0.06)
            this.chime(CANDLE_NOTES[Number(cue.slice(6))] ?? 660, 0.03, 1.4, 0.035)
            break
          }
          if (cue.startsWith('string')) this.pluck(STRINGS[Number(cue.slice(6))] ?? 110)
          break
      }
    } catch {
      // A failed chime should never stall the night.
    }
  }

  dispose(): void {
    this.enabled = false
    this.stopAmbient()
    const ctx = this.ctx
    this.ctx = null
    this.master = null
    if (ctx && ctx.state !== 'closed') void ctx.close()
  }

  private ensureMaster(): void {
    if (!this.ctx) return
    if (this.master) return
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.0001
    this.master.connect(this.ctx.destination)
  }

  private startAmbient(): void {
    this.stopAmbient()
    if (!this.ctx || !this.master) return
    const notes = [392, 440, 493.88, 523.25]
    this.bell = window.setInterval(() => {
      if (!this.enabled) return
      const note = notes[Math.floor(Math.random() * notes.length)] ?? 440
      this.tone(note, 2.4, 0.008, 'sine', 0)
    }, 18000)
  }

  private stopAmbient(): void {
    if (this.bell) window.clearInterval(this.bell)
    this.bell = 0
    for (const node of this.nodes) {
      try {
        node.stop()
      } catch {
        // Already stopped.
      }
    }
    this.nodes = []
  }

  private tone(
    frequency: number,
    duration: number,
    gainValue: number,
    type: OscillatorType,
    delay: number,
    glideTo?: number,
  ): void {
    const ctx = this.ctx!
    const start = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, start)
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), start + duration)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain)
    gain.connect(this.master!)
    osc.start(start)
    osc.stop(start + duration + 0.03)
  }

  private burst(duration: number, frequency: number, q: number, gainValue: number, delay = 0): void {
    const ctx = this.ctx!
    const start = ctx.currentTime + delay
    const frames = Math.max(1, Math.floor(ctx.sampleRate * duration))
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(frequency, start)
    filter.Q.value = q
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.master!)
    source.start(start)
    source.stop(start + duration + 0.02)
  }

  private chime(frequency: number, delay: number, duration: number, gainValue: number): void {
    this.tone(frequency, duration, gainValue, 'sine', delay)
    this.tone(frequency * 2, duration * 0.55, gainValue * 0.32, 'sine', delay)
    this.tone(frequency * 3.01, duration * 0.3, gainValue * 0.12, 'sine', delay)
  }

  private birthday(): void {
    let at = 0.1
    for (const [frequency, beats] of BIRTHDAY) {
      this.chime(frequency, at, Math.max(0.9, beats * B * 2.2), 0.05)
      at += beats * B
    }
    this.chime(1046.5, at, 2.4, 0.03)
    this.chime(1318.5, at + 0.08, 2.4, 0.022)
    this.chime(1568, at + 0.16, 2.6, 0.018)
  }

  private pluck(frequency: number): void {
    const ctx = this.ctx!
    const start = ctx.currentTime
    const duration = 2.2
    const frames = Math.floor(ctx.sampleRate * duration)
    const period = Math.max(2, Math.round(ctx.sampleRate / frequency))
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < period; i += 1) data[i] = Math.random() * 2 - 1
    for (let i = period; i < frames; i += 1) {
      data[i] = 0.996 * 0.5 * ((data[i - period] ?? 0) + (data[i - period + 1] ?? 0))
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 3200
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.16, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.master!)
    source.start(start)
    source.stop(start + duration + 0.02)
  }

  private phrase(): void {
    const notes = [523.25, 659.25, 783.99, 880, 783.99, 659.25, 523.25]
    notes.forEach((frequency, index) => {
      this.tone(frequency, 0.55, 0.045, 'sine', index * 0.15)
    })
  }
}
