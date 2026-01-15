'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  name: string
  role: string
}

interface Enrollment {
  id: string
  status: string
  paid_at: string
  user: Profile
}

interface AssessmentSubmission {
  id: string
  audio_path: string
  transcript: string | null
  ai_feedback_json: Record<string, unknown> | null
  instructor_feedback_json: Record<string, unknown> | null
  published_at: string | null
  created_at: string
  user: Profile
  assessment: {
    week_number: number
    prompt_text: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([])
  const [activeTab, setActiveTab] = useState<'roster' | 'assessments'>('roster')
  const [feedbackText, setFeedbackText] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/sign-in')
        return
      }

      setUser(user)

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)

      // Load enrollments
      const { data: enrollmentData } = await supabase
        .from('cohort_enrollments')
        .select(`
          id,
          status,
          paid_at,
          user:profiles (id, email, name, role)
        `)
        .order('paid_at', { ascending: false })

      if (enrollmentData) {
        setEnrollments(enrollmentData as unknown as Enrollment[])
      }

      // Load assessment submissions
      const { data: submissionData } = await supabase
        .from('assessment_submissions')
        .select(`
          id,
          audio_path,
          transcript,
          ai_feedback_json,
          instructor_feedback_json,
          published_at,
          created_at,
          user:profiles (id, email, name, role),
          assessment:assessments (week_number, prompt_text)
        `)
        .is('published_at', null)
        .order('created_at', { ascending: true })

      if (submissionData) {
        setSubmissions(submissionData as unknown as AssessmentSubmission[])
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const handlePublishFeedback = async (submissionId: string) => {
    if (!feedbackText.trim()) {
      alert('Please enter feedback')
      return
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('assessment_submissions')
      .update({
        instructor_feedback_json: { feedback: feedbackText },
        published_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    if (error) {
      console.error('Error publishing feedback:', error)
      alert('Failed to publish feedback')
      return
    }

    // Remove from list
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId))
    setFeedbackText('')
    setSelectedSubmission(null)
    alert('Feedback published!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'roster'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cohort Roster ({enrollments.length})
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'assessments'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending Assessments ({submissions.length})
          </button>
        </div>

        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Enrolled Students</h2>

            {enrollments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">{enrollment.user?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-600">{enrollment.user?.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {enrollment.paid_at
                            ? new Date(enrollment.paid_at).toLocaleDateString()
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No enrollments yet.</p>
            )}
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Assessment Reviews</h2>

            {submissions.length > 0 ? (
              <div className="space-y-6">
                {submissions.map((submission) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {submission.user?.name || submission.user?.email}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Week {submission.assessment?.week_number} -{' '}
                          {new Date(submission.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-600 font-medium mb-1">Prompt:</p>
                      <p className="text-gray-800">{submission.assessment?.prompt_text}</p>
                    </div>

                    {submission.audio_path && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Recording:</p>
                        <audio controls className="w-full">
                          <source src={`/api/audio/${submission.audio_path}`} />
                        </audio>
                      </div>
                    )}

                    {selectedSubmission === submission.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Enter instructor feedback..."
                          className="input min-h-32"
                        />
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handlePublishFeedback(submission.id)}
                            className="btn-primary"
                          >
                            Publish Feedback
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSubmission(null)
                              setFeedbackText('')
                            }}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedSubmission(submission.id)}
                        className="btn-secondary"
                      >
                        Add Feedback
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No pending assessments to review.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
