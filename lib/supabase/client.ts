import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that won't throw errors when Supabase isn't configured
    const mockClient = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: (_callback: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async (_credentials: unknown) => ({
          data: { user: null, session: null },
          error: { message: 'Supabase not configured', name: 'AuthError', status: 500 }
        }),
        signUp: async (_credentials: unknown) => ({
          data: { user: null, session: null },
          error: { message: 'Supabase not configured', name: 'AuthError', status: 500 }
        }),
      },
    }
    return mockClient as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
