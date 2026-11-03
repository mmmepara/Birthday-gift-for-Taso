import { describe, expect, it } from 'vitest'
import { createCandles, GUST_PER_CANDLE, stepCandles } from './candles.ts'

describe('stepCandles', () => {
  it('ignores a gust below the breath threshold', () => {
    const start = createCandles(5)
    expect(stepCandles(start, 0.2, 5000)).toBe(start)
  })

  it('keeps the gust when the breath pauses, and extinguishes in order', () => {
    let state = createCandles(3)
    state = stepCandles(state, 1, GUST_PER_CANDLE - 1)
    expect(state.lit).toEqual([true, true, true])
    const paused = stepCandles(state, 0, 1000)
    expect(paused).toBe(state)
    state = stepCandles(state, 1, 1)
    expect(state.lit).toEqual([false, true, true])
    state = stepCandles(state, 1, GUST_PER_CANDLE)
    expect(state.lit).toEqual([false, false, true])
  })

  it('stops once every candle is out', () => {
    const out = stepCandles(createCandles(1), 1, GUST_PER_CANDLE)
    expect(out.lit).toEqual([false])
    expect(stepCandles(out, 1, 5000)).toBe(out)
  })
})
