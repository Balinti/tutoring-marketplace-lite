'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Recorder from '@/components/Recorder'
import type { User } from '@supabase/supabase-js'

interface Cohort {
  id: string
  slug: string
  language: string
  level_range: string
  start_at: string
  end_at: string
  meeting_time_local: string
  meeting_timezone: string
  meeting_link: string
}

interface Assessment {
  id: string
  week_number: number
  prompt_text: string
}

export default function CohortPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/sign-in')
        return
      }

      setUser(user)

      // Check enrollment
      const { data: enrollment } = await supabase
        .from('cohort_enrollments')
        .select('cohort_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!enrollment) {
        router.push('/pricing')
        return
      }

      // Get cohort details
      const { data: cohortData } = await supabase
        .from('cohorts')
        .select('*')
        .eq('id', enrollment.cohort_id)
        .single()

      if (cohortData) {
        setCohort(cohortData)

        // Get assessments for this cohort
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('id, week_number, prompt_text')
          .eq('cohort_id', cohortData.id)
          .order('week_number')

        if (assessmentData) {
          setAssessments(assessmentData)
        }
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleAssessmentSubmit = async (blob: Blob) => {
    if (!selectedAssessment || !user) return

    setSubmitting(true)

    try {
      const supabase = createClient()

      // Upload audio
      const fileName = `assessments/${user.id}/${selectedAssessment.id}-${Date.now()}.webm`
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, blob)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Failed to upload recording')
        return
      }

      // Create submission record
      await supabase.from('assessment_submissions').insert({
        assessment_id: selectedAssessment.id,
        user_id: user.id,
        audio_path: fileName,
      })

      alert('Assessment submitted! You\'ll receive feedback soon.')
      setSelectedAssessment(null)
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to submit assessment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!cohort) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Enrollment</h2>
          <p className="text-gray-600 mb-6">You need to enroll in a cohort to access this page.</p>
          <Link href="/pricing" className="btn-primary">
            View Pricing
          </Link>
        </div>
      </div>
    )
  }

  const now = new Date()
  const startDate = new Date(cohort.start_at)
  const endDate = new Date(cohort.end_at)
  const isActive = now >= startDate && now <= endDate
  const currentWeek = Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Cohort Header */}
        <div className="card mb-8 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{cohort.language} Morning Sprint</h1>
              <p className="text-white/80 mt-1">
                {new Date(cohort.start_at).toLocaleDateString()} - {new Date(cohort.end_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">Week {Math.max(1, Math.min(currentWeek, 4))}</div>
              <div className="text-white/80">of 4</div>
            </div>
          </div>
        </div>

        {/* Today's Session */}
        {isActive && (
          <div className="card mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">📹</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Live Session</h2>
                <p className="text-gray-600 mt-1">
                  {cohort.meeting_time_local} ({cohort.meeting_timezone})
                </p>
                {cohort.meeting_link ? (
                  <a
                    href={cohort.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-block mt-4"
                  >
                    Join Meeting
                  </a>
                ) : (
                  <p className="text-gray-500 mt-4">Meeting link will be available soon.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Daily Drill */}
        <div className="card mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🎯</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Daily Drill</h2>
              <p className="text-gray-600 mt-1">
                Complete today&apos;s speaking practice to maintain your streak.
              </p>
              <Link href="/try" className="btn-secondary inline-block mt-4">
                Go to Drill
              </Link>
            </div>
          </div>
        </div>

        {/* Weekly Assessments */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Assessments</h2>

          {selectedAssessment ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">
                  Week {selectedAssessment.week_number} Assessment
                </h3>
                <button
                  onClick={() => setSelectedAssessment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
                <p className="text-gray-800">{selectedAssessment.prompt_text}</p>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Record a 2-3 minute response to the prompt above. Take your time and speak naturally.
              </p>

              <Recorder
                onRecordingComplete={handleAssessmentSubmit}
                disabled={submitting}
              />

              {submitting && (
                <p className="text-center text-primary-600 mt-4">
                  Submitting your assessment...
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">Week {assessment.week_number}</h4>
                      <p className="text-sm text-gray-500 truncate max-w-md">
                        {assessment.prompt_text}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedAssessment(assessment)}
                      className="btn-secondary text-sm py-2"
                      disabled={assessment.week_number > currentWeek}
                    >
                      {assessment.week_number > currentWeek ? 'Locked' : 'Submit'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Assessments will be available as the cohort progresses.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Buddy System Placeholder */}
        <div className="card mt-6 border-dashed border-2 border-gray-200">
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">👥</span>
            <h3 className="font-semibold text-gray-900 mb-2">Buddy System</h3>
            <p className="text-gray-500">
              Coming soon! Connect with a cohort buddy for extra practice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
