import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  // ── Guard: if Supabase isn't configured, skip auth entirely ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Let every page render — the SetupBanner / setup page will tell the
    // owner what's missing.  API routes protect themselves individually.
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Capture referral code from ?ref= query param into a cookie
  const ref = request.nextUrl.searchParams.get('ref')
  if (ref && !request.cookies.get('ref_code')?.value) {
    response.cookies.set('ref_code', ref, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      sameSite: 'lax',
    })
  }

  const { data: { user } } = await supabase.auth.getUser()
  const protectedPrefixes = ['/dashboard', '/owner', '/agents', '/history', '/account', '/billing', '/customers', '/settings']
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
  const isProtected = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p))
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return response
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] }
