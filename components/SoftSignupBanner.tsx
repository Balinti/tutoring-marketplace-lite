'use client'

import Link from 'next/link'
import { useState } from 'react'

interface SoftSignupBannerProps {
  onDismiss?: () => void
}

export default function SoftSignupBanner({ onDismiss }: SoftSignupBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary-600 to-accent-600 text-white p-4 shadow-lg z-40">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold">Save your progress!</p>
            <p className="text-sm text-white/80">
              Create a free account to track your streak and access your history across devices.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/auth/sign-up"
            className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Free Account
          </Link>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white p-2"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
