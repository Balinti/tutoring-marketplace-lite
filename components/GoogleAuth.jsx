'use client'

import { useEffect, useState, useRef } from 'react'

// Hardcoded Supabase configuration - DO NOT use env vars
const SUPABASE_URL = 'https://api.srv936332.hstgr.cloud'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
const APP_SLUG = 'tutoring-marketplace-lite'

export default function GoogleAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [supabaseClient, setSupabaseClient] = useState(null)
  const supabaseLoadedRef = useRef(false)

  // Track user login - upsert to user_tracking table
  const trackUserLogin = async (supabase, userEmail) => {
    if (!supabase || !userEmail) return

    try {
      const now = new Date().toISOString()

      // Try to get existing record
      const { data: existing } = await supabase
        .from('user_tracking')
        .select('login_cnt')
        .eq('user_email', userEmail)
        .eq('app', APP_SLUG)
        .single()

      if (existing) {
        // Update existing record
        await supabase
          .from('user_tracking')
          .update({
            login_cnt: existing.login_cnt + 1,
            last_login_ts: now
          })
          .eq('user_email', userEmail)
          .eq('app', APP_SLUG)
      } else {
        // Insert new record
        await supabase
          .from('user_tracking')
          .insert({
            user_email: userEmail,
            app: APP_SLUG,
            login_cnt: 1,
            last_login_ts: now
          })
      }
    } catch (err) {
      console.error('Error tracking user login:', err)
    }
  }

  useEffect(() => {
    // Load Supabase client via CDN
    if (supabaseLoadedRef.current) return
    supabaseLoadedRef.current = true

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    script.onload = () => {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      setSupabaseClient(client)

      // Get initial user
      client.auth.getUser().then(({ data }) => {
        setUser(data.user)
        setLoading(false)
      })

      // Listen for auth state changes
      client.auth.onAuthStateChange((event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        // Track login on SIGNED_IN event
        if (event === 'SIGNED_IN' && currentUser?.email) {
          trackUserLogin(client, currentUser.email)
        }
      })
    }
    document.head.appendChild(script)
  }, [])

  const signInWithGoogle = async () => {
    if (!supabaseClient) return

    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  const signOut = async () => {
    if (!supabaseClient) return

    await supabaseClient.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return <div className="w-24 h-8 bg-gray-100 rounded animate-pulse" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:inline">{user.email}</span>
        <button
          onClick={signOut}
          className="text-gray-600 hover:text-primary-600 transition-colors text-sm"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  )
}
