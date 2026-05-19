import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname

  // Protect all dashboard routes
  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/clients') ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/sops') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/settings')

  if (isDashboardRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === '/login' || pathname === '/') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
