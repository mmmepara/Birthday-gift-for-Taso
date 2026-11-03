/**
 * Freezes every requestAnimationFrame loop on the page while the phone is upright.
 *
 * The scenes run their own frame loops (the match, the candles, the watering can, the stars).
 * Rather than teach each one about pausing, frames are simply not delivered while held.
 * The loops cap their own time step, so nothing jumps forward when they wake up again.
 */
const nativeRequest = window.requestAnimationFrame.bind(window)
const nativeCancel = window.cancelAnimationFrame.bind(window)

let held = false
let nextId = 1
const live = new Map<number, number>()
const waiting = new Map<number, FrameRequestCallback>()

function schedule(id: number, callback: FrameRequestCallback) {
  live.set(
    id,
    nativeRequest((time) => {
      live.delete(id)
      if (held) {
        waiting.set(id, callback)
        return
      }
      callback(time)
    }),
  )
}

window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  const id = nextId++
  if (held) waiting.set(id, callback)
  else schedule(id, callback)
  return id
}

window.cancelAnimationFrame = (id: number): void => {
  const native = live.get(id)
  if (native !== undefined) {
    nativeCancel(native)
    live.delete(id)
  }
  waiting.delete(id)
}

export function holdFrames(on: boolean): void {
  if (held === on) return
  held = on
  if (on) return
  const queued = [...waiting]
  waiting.clear()
  for (const [id, callback] of queued) schedule(id, callback)
}
