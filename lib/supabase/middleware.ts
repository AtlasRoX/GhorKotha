import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, skipping auth middleware")
    return response
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
    const isAuthRoute = request.nextUrl.pathname.startsWith("/admin/login")

    if (isAdminRoute && !isAuthRoute && !session) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    return response
  }
}
