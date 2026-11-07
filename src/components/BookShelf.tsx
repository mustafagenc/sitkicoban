'use client'

import { useCallback, useState } from 'react'

import type { UiMetinleri } from '@/payload-types'

import { BookCover } from './BookCover'
import { BookModal } from './BookModal'
import { type Book, type BookRole, ROLE_ORDER, roleLabel } from './books'

/** Kitaplar rafı: rol çipleri ve ayrıntı penceresi (oklar süzülmüş liste içinde gezer). */
export function BookShelf({ books, ui }: { books: Book[]; ui: UiMetinleri }) {
  const [secili, setSecili] = useState<BookRole | null>(null)
  const [open, setOpen] = useState<{ list: Book[]; index: number } | null>(null)
  const close = useCallback(() => setOpen(null), [])

  const present = new Set(books.map((b) => b.rol).filter((r): r is BookRole => Boolean(r)))
  const chips = ROLE_ORDER.filter((r) => present.has(r))
  const visible = books.filter((b) => !secili || b.rol === secili)

  return (
    <main className="wrap">
      <div className="cats" id="cats">
        {[null, ...chips].map((r) => (
          <button
            key={r ?? '__all'}
            type="button"
            className={`chip${secili === r ? ' on' : ''}`}
            onClick={() => setSecili(r)}
          >
            {r ? roleLabel(ui, r) : ui.tumu}
          </button>
        ))}
      </div>
      <div className="shelf" id="shelf">
        {visible.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className="book"
            onClick={() => setOpen({ list: visible, index: i })}
          >
            <div className="cover">
              <BookCover kitap={b} />
            </div>
            <h3>{b.baslik}</h3>
            <div className="role">
              <b>{roleLabel(ui, b.rol)}</b>
              {b.asilYazar ? ` · ${b.asilYazar}` : ''}
            </div>
          </button>
        ))}
      </div>
      {open && <BookModal list={open.list} index={open.index} ui={ui} onClose={close} />}
    </main>
  )
}
