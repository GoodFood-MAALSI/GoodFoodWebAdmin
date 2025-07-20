import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Skip middleware for static assets, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  console.log(`Middleware checking route: ${pathname}`)

  // Allow root path (login page) - clear cookies
  if (pathname === '/') {
    console.log('Root path - clearing cookies and allowing access')
    const response = NextResponse.next()
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    response.cookies.delete('forcePasswordChange')
    return response
  }

  // For ALL other routes, check status first
  console.log(`Checking status for route: ${pathname}`)
  
  try {
    const baseUrl = req.nextUrl.origin;
    const statusResponse = await fetch(`${baseUrl}/api/proxy/auth/status`, {
      method: 'GET',
      headers: {
        'Cookie': req.headers.get('cookie') || '',
        'Content-Type': 'application/json',
      },
    });

    console.log(`Status check response: ${statusResponse.status}`)

    if (!statusResponse.ok) {
      console.log(`Status check failed, redirecting ${pathname} to /`)
      const response = NextResponse.redirect(new URL('/', req.url))
      response.cookies.delete('accessToken')
      response.cookies.delete('refreshToken')
      response.cookies.delete('forcePasswordChange')
      return response
    }

    const statusData = await statusResponse.json();
    console.log(`Status data:`, statusData)

    // Check if user is suspended
    if (statusData.suspended || (statusData.message && statusData.message.toLowerCase().includes('suspendu')) || statusData.user?.status === 'suspended') {
      console.log(`User suspended, redirecting ${pathname} to /notallowed`)
      return NextResponse.redirect(new URL('/notallowed', req.url))
    }

    // Check if user is authenticated
    if (!statusData.authenticated) {
      console.log(`User not authenticated, redirecting ${pathname} to /`)
      const response = NextResponse.redirect(new URL('/', req.url))
      response.cookies.delete('accessToken')
      response.cookies.delete('refreshToken')
      response.cookies.delete('forcePasswordChange')
      return response
    }

    // Handle password change requirements
    if (statusData.force_password_change) {
      if (pathname !== '/change-password') {
        console.log(`Password change required, redirecting ${pathname} to /change-password`)
        return NextResponse.redirect(new URL('/change-password', req.url))
      }
    } else {
      if (pathname === '/change-password') {
        console.log(`No password change needed, redirecting /change-password to /dashboard`)
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    console.log(`Status verified, allowing access to ${pathname}`)
    return NextResponse.next()

  } catch (error) {
    console.error('Error checking status:', error)
    console.log(`Status check error, redirecting ${pathname} to /`)
    const response = NextResponse.redirect(new URL('/', req.url))
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    response.cookies.delete('forcePasswordChange')
    return response
  }
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
