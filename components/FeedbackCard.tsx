'use client'

import type { FeedbackResponse } from '@/lib/schema'

interface FeedbackCardProps {
  feedback: FeedbackResponse
  loading?: boolean
}

function ScoreBar({ label, score, max = 5 }: { label: string; score: number; max?: number }) {
  const percentage = (score / max) * 100

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{score}/{max}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function FeedbackCard({ feedback, loading = false }: FeedbackCardProps) {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card space-y-6">
      {/* Overall Score */}
      <div className="text-center pb-4 border-b border-gray-100">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 mb-2">
          <span className="text-3xl font-bold text-primary-700">
            {feedback.overall_score}
          </span>
        </div>
        <p className="text-sm text-gray-500">Overall Score</p>
      </div>

      {/* Transcript */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
          <span className="mr-2">📝</span> Your Response
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 italic">&ldquo;{feedback.transcript}&rdquo;</p>
        </div>
      </div>

      {/* Rubric Scores */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="mr-2">📊</span> Performance Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreBar label="Fluency" score={feedback.rubric.fluency} />
          <ScoreBar label="Pronunciation" score={feedback.rubric.pronunciation} />
          <ScoreBar label="Grammar" score={feedback.rubric.grammar} />
          <ScoreBar label="Vocabulary" score={feedback.rubric.vocabulary} />
        </div>
      </div>

      {/* Corrections */}
      {feedback.corrections.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">💡</span> Areas for Improvement
          </h3>
          <div className="space-y-3">
            {feedback.corrections.map((correction, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <p className="font-medium text-yellow-800 mb-1">{correction.issue}</p>
                <p className="text-sm text-yellow-700 mb-2">{correction.suggestion}</p>
                <p className="text-sm text-gray-600 italic">
                  Example: &ldquo;{correction.example}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
        <p className="text-green-800 flex items-start">
          <span className="mr-2 text-xl">🌟</span>
          <span>{feedback.encouragement}</span>
        </p>
      </div>

      {/* Next Prompt */}
      {feedback.next_prompt && (
        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            <span className="mr-2">🎯</span> Suggested Practice
          </h3>
          <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
            &ldquo;{feedback.next_prompt}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
