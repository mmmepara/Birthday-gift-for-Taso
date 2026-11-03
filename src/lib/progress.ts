import { story } from '../content/story.ts'

export type ChapterId = 'invitation' | 'room' | 'cake' | 'letters' | 'finale'

export type SavedProgress = {
  keepsakes: string[]
  letters: string[]
  gifts: string[]
  finaleSeen: boolean
  chapter: ChapterId
}

export const CHAPTERS: { id: ChapterId; label: string }[] = [
  { id: 'invitation', label: 'ასანთი' },
  { id: 'room', label: 'ოთახი' },
  { id: 'cake', label: 'ტორტი' },
  { id: 'letters', label: 'წერილები' },
  { id: 'finale', label: 'ცა' },
]

const STORAGE_KEY = 'for-taso-progress-v1'

const KEEPSAKES = new Set(story.room.keepsakes.map((item) => item.id))
const LETTERS = new Set(story.letters.map((item) => item.id))
const GIFTS = new Set(story.gifts.map((item) => item.id))

export function emptyProgress(): SavedProgress {
  return {
    keepsakes: [],
    letters: [],
    gifts: [],
    finaleSeen: false,
    chapter: 'invitation',
  }
}

export function replayProgress(): SavedProgress {
  return { ...emptyProgress(), finaleSeen: true, chapter: 'invitation' }
}

function isChapter(value: unknown): value is ChapterId {
  return (
    value === 'invitation' ||
    value === 'room' ||
    value === 'cake' ||
    value === 'letters' ||
    value === 'finale'
  )
}

function idList(value: unknown, allowed: Set<string>): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const item of value) {
    if (typeof item === 'string' && allowed.has(item) && !out.includes(item)) out.push(item)
  }
  return out
}

export function sanitize(value: unknown): SavedProgress {
  if (!value || typeof value !== 'object') return emptyProgress()
  const record = value as Record<string, unknown>
  const keepsakes = idList(record.keepsakes, KEEPSAKES)
  const letters = idList(record.letters, LETTERS)
  const gifts = idList(record.gifts, GIFTS)
  const finaleSeen = record.finaleSeen === true
  let chapter: ChapterId = isChapter(record.chapter) ? record.chapter : 'invitation'
  const ready = story.room.keepsakes.every((item) => keepsakes.includes(item.id))
  const late = chapter === 'cake' || chapter === 'letters' || chapter === 'finale'
  if (late && !ready && !finaleSeen) chapter = 'room'
  return { keepsakes, letters, gifts, finaleSeen, chapter }
}

export function addId(
  progress: SavedProgress,
  key: 'keepsakes' | 'letters' | 'gifts',
  id: string,
): SavedProgress {
  if (progress[key].includes(id)) return progress
  return { ...progress, [key]: [...progress[key], id] }
}

export function loadProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    return sanitize(JSON.parse(raw) as unknown)
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: SavedProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Private mode or a full disk. The night still plays.
  }
}
