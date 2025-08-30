import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"

export const isSupabaseConfigured = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if variables exist and are not placeholder values
  if (!url || !key || url.includes("your_supabase_project_url_here") || key.includes("your_supabase_anon_key_here")) {
    return false
  }

  // Validate URL format
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
})()

const createDummyClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: (table: string) => {
    const createChainableQuery = () => ({
      eq: (column: string, value: any) => createChainableQuery(),
      or: (filter: string) => createChainableQuery(),
      order: (column: string, options?: any) => createChainableQuery(),
      limit: (count: number) => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null }), // Make it thenable for await
    })

    return {
      select: (columns?: string) => createChainableQuery(),
      insert: (data: any) => ({
        select: () => createChainableQuery(),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => createChainableQuery(),
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ error: null }),
      }),
    }
  },
})

// Create a cached version of the Supabase client for Server Components
export const createClient = cache(() => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set or invalid. Using dummy client.")
    return createDummyClient()
  }

  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
})
