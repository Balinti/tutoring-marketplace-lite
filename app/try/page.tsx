'use client'

import { useState, useEffect, useCallback } from 'react'
import Recorder from '@/components/Recorder'
import DrillCard from '@/components/DrillCard'
import FeedbackCard from '@/components/FeedbackCard'
import SoftSignupBanner from '@/components/SoftSignupBanner'
import { getTodaysDrill } from '@/lib/drills'
import { getLocalProgress, addDrillSubmission, type DrillSubmission } from '@/lib/localProgress'
import type { FeedbackResponse } from '@/lib/schema'
import Link from 'next/link'

export default function TryPage() {
  const [drill] = useState(getTodaysDrill())
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [totalDrills, setTotalDrills] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const progress = getLocalProgress()
    setStreak(progress.streak)
    setTotalDrills(progress.totalDrillsCompleted)

    // Check if user already completed today's drill
    const today = new Date().toISOString().split('T')[0]
    const todaySubmission = progress.drillSubmissions.find(s => s.date === today)
    if (todaySubmission) {
      setFeedback(todaySubmission.feedback as FeedbackResponse)
      setSubmitted(true)
    }
  }, [])

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setAudioBlob(blob)
    setError(null)
  }, [])

  const handleSubmit = async () => {
    if (!audioBlob) {
      setError('Please record your response first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('prompt', drill.prompt)
      formData.append('language', drill.language || 'en')

      const response = await fetch('/api/ai/transcribe-and-feedback', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to get feedback')
      }

      const feedbackData: FeedbackResponse = await response.json()
      setFeedback(feedbackData)
      setSubmitted(true)

      // Save to localStorage
      const submission: DrillSubmission = {
        id: `submission-${Date.now()}`,
        date: drill.date,
        prompt: drill.prompt,
        transcript: feedbackData.transcript,
        feedback: {
          rubric: feedbackData.rubric,
          overall_score: feedbackData.overall_score,
          corrections: feedbackData.corrections,
          encouragement: feedbackData.encouragement,
        },
        createdAt: new Date().toISOString(),
      }

      const progress = addDrillSubmission(submission)
      setStreak(progress.streak)
      setTotalDrills(progress.totalDrillsCompleted)

      // Show signup banner after first drill
      if (progress.totalDrillsCompleted === 1) {
        setTimeout(() => setShowBanner(true), 2000)
      }
    } catch (err) {
      console.error('Submission error:', err)
      setError('Failed to process your recording. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTryAgain = () => {
    setFeedback(null)
    setAudioBlob(null)
    setSubmitted(false)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daily Speaking Drill
          </h1>
          <p className="text-gray-600">
            Practice speaking and get instant AI feedback
          </p>
        </div>

        {/* Progress Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{streak.current}</div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-600">{totalDrills}</div>
            <div className="text-sm text-gray-500">Drills Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{streak.longest}</div>
            <div className="text-sm text-gray-500">Best Streak</div>
          </div>
        </div>

        {/* Drill Card */}
        <div className="mb-8">
          <DrillCard
            prompt={drill.prompt}
            date={new Date(drill.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            language={drill.language}
            level={drill.level}
          />
        </div>

        {/* Recording or Feedback */}
        {!submitted ? (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Record Your Response
            </h2>

            <Recorder
              onRecordingComplete={handleRecordingComplete}
              disabled={loading}
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!audioBlob || loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Get AI Feedback</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <FeedbackCard feedback={{} as FeedbackResponse} loading={true} />
            ) : feedback ? (
              <>
                <FeedbackCard feedback={feedback} />

                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={handleTryAgain} className="btn-secondary">
                    Try Again
                  </button>
                  <Link href="/auth/sign-up" className="btn-primary text-center">
                    Save Progress - Create Account
                  </Link>
                </div>
              </>
            ) : null}
          </>
        )}

        {/* Open Morning Room Info */}
        <div className="mt-12 card bg-gradient-to-r from-primary-50 to-accent-50 border-primary-100">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">📹</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Open Morning Room
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Join our free weekly live session! Practice with other learners and get tips from instructors.
              </p>
              <p className="text-sm text-primary-700 font-medium">
                Every Saturday at 9:00 AM EST
              </p>
            </div>
          </div>
        </div>

        {/* Join Cohort CTA */}
        <div className="mt-6 text-center">
          <Link href="/pricing" className="text-primary-600 hover:text-primary-700 font-medium">
            Want more? Check out our structured Sprint programs →
          </Link>
        </div>
      </div>

      {/* Soft Signup Banner */}
      {showBanner && <SoftSignupBanner />}
    </div>
  )
}
