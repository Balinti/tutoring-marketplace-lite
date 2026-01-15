// Sample drill prompts for when database is not available
// In production, these would come from the drills table

export interface DrillPrompt {
  id: string
  date: string
  prompt: string
  language: string
  level: string
}

const SAMPLE_PROMPTS: DrillPrompt[] = [
  {
    id: 'drill-1',
    date: new Date().toISOString().split('T')[0],
    prompt: 'Describe your morning routine. What do you do from the moment you wake up until you leave for work or start your day?',
    language: 'English',
    level: 'Intermediate',
  },
  {
    id: 'drill-2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    prompt: 'Talk about a memorable trip you took. Where did you go, who were you with, and what made it special?',
    language: 'English',
    level: 'Intermediate',
  },
  {
    id: 'drill-3',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    prompt: 'Explain your favorite hobby to someone who has never tried it. Why do you enjoy it and how did you get started?',
    language: 'English',
    level: 'Intermediate',
  },
  {
    id: 'drill-4',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    prompt: 'Describe the neighborhood you live in. What do you like about it and what would you change?',
    language: 'English',
    level: 'Beginner',
  },
  {
    id: 'drill-5',
    date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
    prompt: 'If you could have dinner with any historical figure, who would you choose and what would you talk about?',
    language: 'English',
    level: 'Advanced',
  },
  {
    id: 'drill-6',
    date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
    prompt: 'Talk about a skill you would like to learn. Why is it important to you and how would you go about learning it?',
    language: 'English',
    level: 'Intermediate',
  },
  {
    id: 'drill-7',
    date: new Date(Date.now() - 518400000).toISOString().split('T')[0],
    prompt: 'Describe your ideal weekend. What activities would you do and who would you spend it with?',
    language: 'English',
    level: 'Beginner',
  },
]

export function getTodaysDrill(): DrillPrompt {
  const today = new Date().toISOString().split('T')[0]
  const todaysDrill = SAMPLE_PROMPTS.find(p => p.date === today)

  if (todaysDrill) {
    return todaysDrill
  }

  // If no drill for today, return a random one with today's date
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const drill = SAMPLE_PROMPTS[dayOfYear % SAMPLE_PROMPTS.length]

  return {
    ...drill,
    id: `drill-${today}`,
    date: today,
  }
}

export function getDrillById(id: string): DrillPrompt | undefined {
  return SAMPLE_PROMPTS.find(p => p.id === id)
}

export function getRecentDrills(count: number = 7): DrillPrompt[] {
  return SAMPLE_PROMPTS.slice(0, count)
}
