'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getLocalProgress } from '@/lib/localProgress'
import type { User } from '@supabase/supabase-js'

interface Enrollment {
  id: string
  status: string
  cohort: {
    id: string
    slug: string
    language: string
    start_at: string
    end_at: string
    meeting_time_local: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [stats, setStats] = useState({ streak: 0, totalDrills: 0, bestStreak: 0 })

  useEffect(() => {
    const supabase = createClient()

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/sign-in')
        return
      }

      setUser(user)

      // Get enrollments
      const { data: enrollmentData } = await supabase
        .from('cohort_enrollments')
        .select(`
          id,
          status,
          cohort:cohorts (
            id,
            slug,
            language,
            start_at,
            end_at,
            meeting_time_local
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (enrollmentData) {
        setEnrollments(enrollmentData as unknown as Enrollment[])
      }

      // Get local stats (merged with any DB stats)
      const localProgress = getLocalProgress()
      setStats({
        streak: localProgress.streak.current,
        totalDrills: localProgress.totalDrillsCompleted,
        bestStreak: localProgress.streak.longest,
      })

      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    )
  }

  const hasActiveEnrollment = enrollments.length > 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}!
          </h1>
          <p className="text-gray-600 mt-1">
            Keep up your daily practice to build fluency.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.streak}</div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-accent-600">{stats.totalDrills}</div>
            <div className="text-sm text-gray-500">Drills Completed</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600">{stats.bestStreak}</div>
            <div className="text-sm text-gray-500">Best Streak</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Daily Drill Card */}
          <Link href="/try" className="card hover:shadow-xl transition-shadow group">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  Today&apos;s Drill
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Complete your daily speaking practice with AI feedback.
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Cohort Card */}
          {hasActiveEnrollment ? (
            <Link href="/cohort" className="card hover:shadow-xl transition-shadow group bg-gradient-to-br from-primary-50 to-accent-50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📹</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    Your Cohort
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Access live sessions, assessments, and cohort resources.
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ) : (
            <Link href="/pricing" className="card hover:shadow-xl transition-shadow group border-dashed border-2 border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    Join a Sprint
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Upgrade to a cohort program with live sessions and instructor feedback.
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )}
        </div>

        {/* Enrolled Cohorts */}
        {hasActiveEnrollment && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Enrollments</h2>
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {enrollment.cohort.language} Sprint
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(enrollment.cohort.start_at).toLocaleDateString()} -{' '}
                      {new Date(enrollment.cohort.end_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    {enrollment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {stats.totalDrills > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🎯</span>
                  <span className="text-gray-700">Daily drill completed</span>
                </div>
                <span className="text-sm text-gray-500">Today</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No activity yet. Complete your first drill to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
