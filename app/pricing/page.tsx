'use client'

import { useState } from 'react'
import Link from 'next/link'

const SPRINT_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_SPRINT_PRICE_ID
const SPRINT_PLUS_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_SPRINT_PLUS_PRICE_ID

interface PricingTier {
  name: string
  description: string
  price: string
  priceId: string | undefined
  features: string[]
  highlight?: boolean
  ctaText: string
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    description: 'Try our daily drills',
    price: '$0',
    priceId: undefined,
    features: [
      'Daily AI speaking drills',
      'Instant feedback on fluency, pronunciation, grammar',
      'Track your streak',
      'Basic progress history',
    ],
    ctaText: 'Start Free',
  },
  {
    name: 'Sprint',
    description: '4-week cohort program',
    price: '$149',
    priceId: SPRINT_PRICE_ID,
    features: [
      'Everything in Free',
      'Daily live 15-min sessions (Mon-Fri)',
      'Cohort of 15 learners max',
      'Weekly assessments with instructor feedback',
      'Access to recording playbacks',
      'Private community chat',
    ],
    highlight: true,
    ctaText: 'Join Sprint',
  },
  {
    name: 'Sprint+',
    description: 'Sprint with 1-on-1 coaching',
    price: '$299',
    priceId: SPRINT_PLUS_PRICE_ID,
    features: [
      'Everything in Sprint',
      '2x 30-min 1-on-1 sessions with instructor',
      'Personalized learning plan',
      'Priority assessment feedback',
      'Extended access (8 weeks)',
    ],
    ctaText: 'Join Sprint+',
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async (priceId: string) => {
    if (!priceId) return

    setLoading(priceId)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to start checkout')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Failed to start checkout')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready for structured cohort learning with live sessions and instructor feedback.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 ${
                tier.highlight
                  ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-2xl scale-105'
                  : 'bg-white shadow-lg'
              }`}
            >
              {tier.highlight && (
                <div className="text-sm font-medium text-white/80 mb-2">
                  Most Popular
                </div>
              )}

              <h3 className={`text-2xl font-bold ${tier.highlight ? 'text-white' : 'text-gray-900'}`}>
                {tier.name}
              </h3>
              <p className={`mt-1 ${tier.highlight ? 'text-white/80' : 'text-gray-600'}`}>
                {tier.description}
              </p>

              <div className="mt-6">
                <span className={`text-4xl font-bold ${tier.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {tier.price}
                </span>
                {tier.price !== '$0' && (
                  <span className={tier.highlight ? 'text-white/70' : 'text-gray-500'}>
                    {' '}one-time
                  </span>
                )}
              </div>

              <ul className="mt-8 space-y-4">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className={`w-5 h-5 mr-3 flex-shrink-0 ${
                        tier.highlight ? 'text-white' : 'text-green-500'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={tier.highlight ? 'text-white/90' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {tier.name === 'Free' ? (
                  <Link
                    href="/try"
                    className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                      tier.highlight
                        ? 'bg-white text-primary-600 hover:bg-gray-100'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {tier.ctaText}
                  </Link>
                ) : tier.priceId ? (
                  <button
                    onClick={() => handleCheckout(tier.priceId!)}
                    disabled={loading === tier.priceId}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                      tier.highlight
                        ? 'bg-white text-primary-600 hover:bg-gray-100'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {loading === tier.priceId ? 'Loading...' : tier.ctaText}
                  </button>
                ) : (
                  <div
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-center ${
                      tier.highlight
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    Coming Soon
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Questions?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                What if I can&apos;t make the live sessions?
              </h4>
              <p className="text-gray-600 text-sm">
                While live sessions aren&apos;t recorded to encourage live participation, you can still complete all daily drills and weekly assessments.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                Is there a refund policy?
              </h4>
              <p className="text-gray-600 text-sm">
                If you&apos;re not satisfied within the first 7 days, contact us for a full refund. No questions asked.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                When does the next cohort start?
              </h4>
              <p className="text-gray-600 text-sm">
                New cohorts start every 2 weeks. After purchase, you&apos;ll be enrolled in the next available cohort.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                What languages are available?
              </h4>
              <p className="text-gray-600 text-sm">
                Currently we offer English learning for speakers of any language. More target languages coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
