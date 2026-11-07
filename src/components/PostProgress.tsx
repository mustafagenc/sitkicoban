'use client'

import { useEffect, useRef } from 'react'

/** Okuma ilerleme çizgisi: yazı metninin (`.prose`) kaydırılma oranını gösterir. */
export function PostProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const art = document.querySelector('.yazi .prose')
    if (!art) return
    const onScroll = () => {
      const r = art.getBoundingClientRect()
      const total = r.height - innerHeight * 0.6
      const v = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${v})`
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  return <div className="yazi-progress" ref={bar} aria-hidden="true" />
}
