'use client'

import { useEffect, useRef, type CSSProperties } from 'react'

import { LOGO_SRC } from './logo'

/**
 * İmza logosu; logoya fareyle gelince bir kez parlar. `glintOnLoad` açıksa (varsayılan) açılışta da
 * (600 ms sonra) parlar; ana sayfada ortadaki imza zaten parladığı için kapalıdır.
 */
export function LogoMark({ alt, glintOnLoad = true }: { alt: string; glintOnLoad?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const mark = ref.current
    if (!mark) return
    const timers: ReturnType<typeof setTimeout>[] = []
    const parla = () => {
      if (mark.classList.contains('parla')) return
      mark.classList.add('parla')
      timers.push(setTimeout(() => mark.classList.remove('parla'), 1400))
    }
    const logo = mark.closest('.logo')
    logo?.addEventListener('mouseenter', parla)
    if (glintOnLoad) timers.push(setTimeout(parla, 600))
    return () => {
      logo?.removeEventListener('mouseenter', parla)
      timers.forEach(clearTimeout)
    }
  }, [glintOnLoad])

  return (
    <span
      ref={ref}
      className="logo-mark"
      style={{ '--logo-src': `url("${LOGO_SRC}")` } as CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SRC} alt={alt} />
    </span>
  )
}
