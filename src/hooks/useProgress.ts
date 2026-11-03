import { useCallback, useEffect, useState } from 'react'
import { loadProgress, saveProgress, type SavedProgress } from '../lib/progress.ts'

export function useProgress(): [
  SavedProgress,
  (patch: (current: SavedProgress) => SavedProgress) => void,
] {
  const [progress, setProgress] = useState<SavedProgress>(() => loadProgress())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const update = useCallback((patch: (current: SavedProgress) => SavedProgress) => {
    setProgress((current) => patch(current))
  }, [])

  return [progress, update]
}
