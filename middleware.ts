import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Invite pages are always public — no auth check
  if (pathname.startsWith('/invite')) {
    return NextResponse.next()
  }

  // Auth pages are always public
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Protected pages — check for Supabase session cookie
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/cases')) {
    // Supabase stores the session in a cookie starting with "sb-"
    const hasCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'))
    if (!hasCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
