'use client'

import Link from 'next/link'
import { useState } from 'react'
import GoogleAuth from './GoogleAuth'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌅</span>
            <span className="font-bold text-xl text-gray-900">Morning Sprint</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/try" className="text-gray-600 hover:text-primary-600 transition-colors">
              Try Free
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-primary-600 transition-colors">
              Pricing
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
              Dashboard
            </Link>
            <GoogleAuth />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link href="/try" className="text-gray-600 hover:text-primary-600">
                Try Free
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-primary-600">
                Pricing
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-primary-600">
                Dashboard
              </Link>
              <div className="pt-2">
                <GoogleAuth />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
