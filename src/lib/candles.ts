export const BLOW_THRESHOLD = 0.42
export const GUST_PER_CANDLE = 900

export type CandleField = {
  lit: boolean[]
  gust: number
}

export function createCandles(count: number): CandleField {
  return { lit: Array.from({ length: count }, () => true), gust: 0 }
}

export function sameLit(a: readonly boolean[], b: readonly boolean[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function stepCandles(state: CandleField, blowPower: number, dtMs: number): CandleField {
  if (dtMs <= 0) return state
  if (state.lit.every((isLit) => !isLit)) return state
  if (blowPower < BLOW_THRESHOLD) return state

  const gust = state.gust + dtMs
  const outCount = Math.min(state.lit.length, Math.floor(gust / GUST_PER_CANDLE))
  let extinguished = false
  const lit = state.lit.map((isLit, index) => {
    if (isLit && index < outCount) {
      extinguished = true
      return false
    }
    return isLit
  })

  if (!extinguished && gust === state.gust) return state
  return { gust, lit: extinguished ? lit : state.lit }
}
