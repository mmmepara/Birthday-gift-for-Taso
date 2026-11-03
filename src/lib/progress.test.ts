import { describe, expect, it } from 'vitest'
import { replayProgress, sanitize } from './progress.ts'

describe('sanitize', () => {
  it('drops unknown ids, duplicates, and anything that is not the night’s progress', () => {
    const saved = sanitize({
      keepsakes: ['star', 'nope', 'star'],
      letters: ['letter', 'nope'],
      gifts: ['promise'],
      finaleSeen: false,
      chapter: 'cake',
      wish: 'a secret that must not be stored',
    })
    expect(saved.keepsakes).toEqual(['star'])
    expect(saved.letters).toEqual(['letter'])
    expect(saved.gifts).toEqual(['promise'])
    expect(saved.chapter).toBe('room')
    expect(JSON.stringify(saved)).not.toContain('secret')
    expect(JSON.stringify(saved)).not.toContain('wish')
  })

  it('lets her resume the cake once the keepsakes are really pocketed', () => {
    const saved = sanitize({
      keepsakes: ['petal', 'star', 'page'],
      chapter: 'cake',
      finaleSeen: false,
    })
    expect(saved.chapter).toBe('cake')
  })

  it('allows free roaming after the sky has been seen', () => {
    const saved = sanitize({ finaleSeen: true, chapter: 'letters', keepsakes: [] })
    expect(saved.chapter).toBe('letters')
    expect(saved.finaleSeen).toBe(true)
  })

  it('replays from the match without forgetting she has been here', () => {
    expect(replayProgress()).toEqual({
      keepsakes: [],
      letters: [],
      gifts: [],
      finaleSeen: true,
      chapter: 'invitation',
    })
  })
})
