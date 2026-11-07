import { NextResponse, type NextRequest } from 'next/server'

import { resolvePath } from '@/i18n/config'

export function proxy(request: NextRequest) {
  const result = resolvePath(request.nextUrl.pathname)
  if (!result) return NextResponse.next()

  const url = request.nextUrl.clone()
  if ('redirect' in result) {
    url.pathname = result.redirect
    return NextResponse.redirect(url, 308)
  }
  url.pathname = result.key === 'home' ? `/${result.locale}` : `/${result.locale}/${result.key}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!(?:admin|api|_next|media|tasarim)(?:/|$)|.*\\..*).*)'],
}
