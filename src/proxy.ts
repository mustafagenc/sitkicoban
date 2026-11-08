import { NextResponse, type NextRequest } from 'next/server'

import { internalPath, resolvePath } from '@/i18n/config'

const NOT_FOUND_PATH = '/_yok'

export function proxy(request: NextRequest) {
  const result = resolvePath(request.nextUrl.pathname)
  const url = request.nextUrl.clone()

  // Bilinmeyen yol: hiçbir sayfaya karşılık gelmeyen iç yola yönlendir (kesin 404).
  if (!result) {
    url.pathname = NOT_FOUND_PATH
    return NextResponse.rewrite(url)
  }

  if ('redirect' in result) {
    url.pathname = result.redirect
    return NextResponse.redirect(url, 308)
  }
  url.pathname = internalPath(result)
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!(?:admin|api|_next|media)(?:/|$)|.*\\..*).*)'],
}
