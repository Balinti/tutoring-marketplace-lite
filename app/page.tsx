import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-16 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
              <span className="mr-2">🌅</span>
              Next Cohort Starts Soon
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Master a Language in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                {' '}Morning Sprints
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Daily 15-minute live sessions + AI-powered speaking drills + weekly assessments.
              Join a cohort of motivated learners and build fluency together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/try" className="btn-primary text-lg px-8 py-4">
                Try Free Drill Now
              </Link>
              <Link href="/pricing" className="btn-secondary text-lg px-8 py-4">
                View Pricing
              </Link>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              No signup required to try. Start speaking in 30 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            How Morning Sprints Work
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            A structured, immersive approach to language learning that fits your busy morning routine.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎙️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Daily AI Drills</h3>
              <p className="text-gray-600">
                Speak to a new prompt each day. Get instant AI feedback on fluency, pronunciation, grammar, and vocabulary.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📹</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Morning Sessions</h3>
              <p className="text-gray-600">
                Join 15-minute live sessions with an instructor and your cohort. Practice conversation in a supportive group.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Weekly Assessments</h3>
              <p className="text-gray-600">
                Submit longer speaking samples weekly. Receive detailed instructor feedback to track your real progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Schedule */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Your Daily Sprint Schedule
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Consistency is key. Here&apos;s what a typical morning looks like.
          </p>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-100">
              <div className="flex items-center p-6">
                <div className="w-20 text-center">
                  <span className="text-2xl font-bold text-primary-600">7:00</span>
                  <span className="text-sm text-gray-500 block">AM</span>
                </div>
                <div className="flex-1 ml-6">
                  <h4 className="font-semibold text-gray-900">Daily Drill Opens</h4>
                  <p className="text-gray-600 text-sm">New prompt available. Complete on your own time before the live session.</p>
                </div>
                <span className="text-2xl">🎯</span>
              </div>

              <div className="flex items-center p-6 bg-primary-50">
                <div className="w-20 text-center">
                  <span className="text-2xl font-bold text-primary-600">7:30</span>
                  <span className="text-sm text-gray-500 block">AM</span>
                </div>
                <div className="flex-1 ml-6">
                  <h4 className="font-semibold text-gray-900">Live Morning Room</h4>
                  <p className="text-gray-600 text-sm">15-minute live session with instructor and cohort members.</p>
                </div>
                <span className="text-2xl">📹</span>
              </div>

              <div className="flex items-center p-6">
                <div className="w-20 text-center">
                  <span className="text-2xl font-bold text-primary-600">7:45</span>
                  <span className="text-sm text-gray-500 block">AM</span>
                </div>
                <div className="flex-1 ml-6">
                  <h4 className="font-semibold text-gray-900">Review AI Feedback</h4>
                  <p className="text-gray-600 text-sm">Check your drill results and note areas to improve.</p>
                </div>
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Sessions are available Mon-Fri. Weekends are for catching up and extra practice.
          </p>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What You&apos;ll Achieve
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our 4-week sprint is designed to build real conversational confidence.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Speaking Confidence</h4>
                <p className="text-gray-600">Overcome hesitation and speak more naturally through daily practice.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Better Pronunciation</h4>
                <p className="text-gray-600">AI feedback identifies and helps correct pronunciation issues.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Expanded Vocabulary</h4>
                <p className="text-gray-600">Learn new words and phrases in context through varied prompts.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Consistent Habit</h4>
                <p className="text-gray-600">Build a daily language practice habit that sticks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">What time are the live sessions?</h4>
              <p className="text-gray-600">Sessions are at 7:30 AM in your selected timezone, Monday through Friday. Perfect for starting your day with purpose.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Can I try before I buy?</h4>
              <p className="text-gray-600">Absolutely! Click &ldquo;Try Free Drill Now&rdquo; to complete a full AI-powered speaking drill without any signup.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">What if I miss a session?</h4>
              <p className="text-gray-600">Daily drills stay open until the next day. While live sessions aren&apos;t recorded (to encourage live participation), you can still complete all drills.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">How many people are in a cohort?</h4>
              <p className="text-gray-600">Cohorts are capped at 15 learners to ensure everyone gets speaking time in live sessions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Language Journey?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Try a free drill right now, no signup required.
          </p>
          <Link href="/try" className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
            Try Free Drill Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-2xl">🌅</span>
              <span className="font-bold text-white">Morning Sprint</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/try" className="hover:text-white transition-colors">Try Free</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Morning Sprint. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
