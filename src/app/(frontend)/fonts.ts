import { Amiri, Playfair_Display, Source_Serif_4 } from 'next/font/google'

/** Tasarımdaki üç aile; CSS'te var(--font-*) ile kullanılır (styles/ortak.css). */
export const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-source-serif',
  display: 'swap',
})

export const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
  preload: false,
})

export const fontVars = [playfair.variable, sourceSerif.variable, amiri.variable].join(' ')
