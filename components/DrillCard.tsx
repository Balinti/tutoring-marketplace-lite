'use client'

interface DrillCardProps {
  prompt: string
  date: string
  language?: string
  level?: string
}

export default function DrillCard({ prompt, date, language = 'English', level = 'All Levels' }: DrillCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎯</span>
          <span className="text-sm font-medium text-gray-500">Today&apos;s Drill</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
            {language}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {level}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-2">{date}</p>

      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6">
        <p className="text-xl font-medium text-gray-800 leading-relaxed">
          &ldquo;{prompt}&rdquo;
        </p>
      </div>

      <div className="mt-4 flex items-center text-sm text-gray-500">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Speak naturally for 30-60 seconds. Focus on fluency over perfection.</span>
      </div>
    </div>
  )
}
