'use client'

import { useEffect, useState } from 'react'

/** "Bu sayfada" listesi: okunan bölüm vurgulanır (tasarim/hayati.html'deki IntersectionObserver). */
export function BioToc({ items, label }: { items: { id: string; text: string }[]; label: string }) {
  const [on, setOn] = useState<string | null>(null)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setOn(e.target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    for (const { id } of items) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [items])

  return (
    <nav className="toc" aria-label={label}>
      <div className="lbl">{label}</div>
      {items.map((it) => (
        <a key={it.id} href={`#${it.id}`} className={on === it.id ? 'on' : undefined}>
          {it.text}
        </a>
      ))}
    </nav>
  )
}
