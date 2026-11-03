import { createContext, useContext } from 'react'
import type { Cue } from './audio/soundscape.ts'
import type { ChapterId, SavedProgress } from './lib/progress.ts'

export type Experience = {
  reduced: boolean
  soundOn: boolean
  toggleSound: () => Promise<void>
  play: (cue: Cue) => void
  notify: (message: string) => void
  progress: SavedProgress
  update: (patch: (current: SavedProgress) => SavedProgress) => void
  go: (chapter: ChapterId) => void
  replay: () => void
}

export const ExperienceContext = createContext<Experience | null>(null)

export function useExperience(): Experience {
  const value = useContext(ExperienceContext)
  if (!value) throw new Error('The night is missing its context.')
  return value
}
