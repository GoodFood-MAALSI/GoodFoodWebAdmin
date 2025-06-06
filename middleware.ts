import { NextRequest, NextResponse } from 'next/server'

const COOLDOWN_MS = 30_000 // 30 seconds

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const refreshToken = req.cookies.get('refreshToken')?.value
  const tokenExpires = req.cookies.get('tokenExpires')?.value
  const lastCheck = req.cookies.get('lastRefreshCheck')?.value

  if (!token || !refreshToken || !tokenExpires) {
    console.log("Cookies middleware missing:", { token, refreshToken, tokenExpires })
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  const now = Date.now()

  if (lastCheck && now - parseInt(lastCheck) < COOLDOWN_MS) {
    return NextResponse.next()
  }

  const tokenExp = parseInt(tokenExpires)
  const iat = getIatFromJWT(token)

  if (!iat || isNaN(tokenExp)) {
    console.warn('Invalid token timestamps')
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  const lifetime = tokenExp - iat * 1000
  const remaining = tokenExp - now
  const threshold = lifetime * 0.1

  const res = NextResponse.next()

  res.cookies.set('lastRefreshCheck', now.toString(), {
    httpOnly: true,
    path: '/',
  })

  if (remaining < threshold) {
    try {
      const refresh = await fetch('http://localhost:8080/restaurateur/api/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          Accept: '*/*',
        },
      })

      if (!refresh.ok) {
        console.warn('Token refresh failed')
        return NextResponse.redirect(new URL('/auth', req.url))
      }

      const { token: newToken, tokenExpires: newExp } = await refresh.json()

      res.cookies.set('token', newToken, { httpOnly: true, path: '/' })
      res.cookies.set('tokenExpires', newExp.toString(), { httpOnly: true, path: '/' })
    } catch (e) {
      console.error('Refresh error:', e)
      return NextResponse.redirect(new URL('/auth', req.url))
    }
  }

  return res
}

function getIatFromJWT(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.iat
  } catch {
    return 0
  }
}

export const config = {
  matcher: [
    '/(create-company|create-menu|profile|restaurants)/:path*',
  ],
}
