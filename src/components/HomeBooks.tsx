'use client'

import { useCallback, useState } from 'react'

import type { UiMetinleri } from '@/payload-types'

import { BookCover } from './BookCover'
import { BookModal } from './BookModal'
import type { Book } from './books'

/** Ana sayfadaki kitaplar: tıklanan kitap ayrıntı penceresinde açılır; oklar bu kitaplar arasında gezer. */
export function HomeBooks({ books, ui, href }: { books: Book[]; ui: UiMetinleri; href: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])

  return (
    <>
      <div className="books">
        {books.map((b, i) => (
          <a
            key={b.id}
            className="book"
            href={href}
            onClick={(e) => {
              e.preventDefault()
              setOpen(i)
            }}
          >
            {b.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={`cover-img${b.contain ? ' contain' : ''}`}
                src={b.src}
                alt={b.baslik}
                loading="lazy"
              />
            ) : (
              <div className="cover-img">
                <BookCover kitap={b} />
              </div>
            )}
            <div className="cap">{b.baslik}</div>
          </a>
        ))}
      </div>
      {open !== null && <BookModal list={books} index={open} ui={ui} onClose={close} />}
    </>
  )
}
