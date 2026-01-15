import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">🤔</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Changed Your Mind?
        </h1>

        <p className="text-gray-600 mb-8">
          No worries! Your checkout was canceled and you haven&apos;t been charged.
          Feel free to continue exploring or come back when you&apos;re ready.
        </p>

        <div className="space-y-4">
          <Link href="/pricing" className="btn-primary w-full block">
            Back to Pricing
          </Link>
          <Link href="/try" className="btn-secondary w-full block">
            Try a Free Drill
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Have questions?{' '}
          <a href="mailto:support@morningsprint.com" className="text-primary-600 hover:text-primary-700">
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}
