// Types for localStorage progress tracking

export interface DrillSubmission {
  id: string
  date: string
  prompt: string
  audioBlob?: string // base64 encoded
  transcript: string
  feedback: {
    rubric: {
      fluency: number
      pronunciation: number
      grammar: number
      vocabulary: number
    }
    overall_score: number
    corrections: Array<{
      issue: string
      suggestion: string
      example: string
    }>
    encouragement: string
  }
  createdAt: string
}

export interface LocalProgress {
  drillSubmissions: DrillSubmission[]
  streak: {
    current: number
    longest: number
    lastDrillDate: string | null
  }
  totalDrillsCompleted: number
  migrated: boolean
}

const STORAGE_KEY = 'morning-sprint-progress'

export function getLocalProgress(): LocalProgress {
  if (typeof window === 'undefined') {
    return getDefaultProgress()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error reading localStorage:', e)
  }

  return getDefaultProgress()
}

export function getDefaultProgress(): LocalProgress {
  return {
    drillSubmissions: [],
    streak: {
      current: 0,
      longest: 0,
      lastDrillDate: null,
    },
    totalDrillsCompleted: 0,
    migrated: false,
  }
}

export function saveLocalProgress(progress: LocalProgress): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (e) {
    console.error('Error saving to localStorage:', e)
  }
}

export function addDrillSubmission(submission: DrillSubmission): LocalProgress {
  const progress = getLocalProgress()

  // Add the submission
  progress.drillSubmissions.push(submission)
  progress.totalDrillsCompleted += 1

  // Update streak
  const today = new Date().toISOString().split('T')[0]
  const lastDate = progress.streak.lastDrillDate

  if (!lastDate) {
    // First drill ever
    progress.streak.current = 1
  } else {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastDate === today) {
      // Already did a drill today, streak unchanged
    } else if (lastDate === yesterdayStr) {
      // Continuing streak
      progress.streak.current += 1
    } else {
      // Streak broken
      progress.streak.current = 1
    }
  }

  // Update longest streak
  if (progress.streak.current > progress.streak.longest) {
    progress.streak.longest = progress.streak.current
  }

  progress.streak.lastDrillDate = today

  saveLocalProgress(progress)
  return progress
}

export function markAsMigrated(): void {
  const progress = getLocalProgress()
  progress.migrated = true
  saveLocalProgress(progress)
}

export function clearLocalProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function hasUnmigratedProgress(): boolean {
  const progress = getLocalProgress()
  return progress.totalDrillsCompleted > 0 && !progress.migrated
}
