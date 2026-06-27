import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PropFlow — Prop Firm Manager',
  description: 'Gestor financiero premium para traders de prop firms de futuros.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-background antialiased">{children}</body>
    </html>
  )
}
