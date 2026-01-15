'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [verified, setVerified] = useState(false)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // In production, we would verify the session with Stripe
    // For MVP, we trust the redirect from Stripe
    if (sessionId) {
      setVerified(true)
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-8">
          {verified
            ? 'Welcome to the Morning Sprint program! You\'re now enrolled in the next available cohort.'
            : 'Processing your enrollment...'}
        </p>

        <div className="space-y-4">
          <Link href="/dashboard" className="btn-primary w-full block">
            Go to Dashboard
          </Link>
          <Link href="/cohort" className="btn-secondary w-full block">
            View Your Cohort
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          You&apos;ll receive enrollment details via email shortly.
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
