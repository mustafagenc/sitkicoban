import React from 'react'

export const metadata = {
  description: 'Hattat Sıtkı Çoban',
  title: 'Sıtkı Çoban',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{props.children}</body>
    </html>
  )
}
