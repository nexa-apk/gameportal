import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: {
    default: 'FunGames — Free Online Games',
    template: '%s | FunGames',
  },
  description: 'Play free online games — arcade, puzzle, action and more. No downloads needed!',
  keywords: ['free games', 'online games', 'browser games', 'arcade', 'puzzle'],
  metadataBase: new URL('https://fun.nexahost.top'),
  openGraph: {
    siteName: 'FunGames',
    type: 'website',
  },
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🎮</span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Fun<span className="text-orange-400">Games</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/#games"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Games
          </Link>
          <a
            href="https://fun.nexahost.top"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-full bg-orange-500 px-4 py-1.5 text-sm font-bold text-white shadow-md transition hover:bg-orange-400 active:scale-95"
          >
            Play Free
          </a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <span className="font-extrabold text-white">
              Fun<span className="text-orange-400">Games</span>
            </span>
          </div>
          <p className="text-sm text-center">
            Free browser games — no downloads, no sign-ups. Just play!
          </p>
          <p className="text-xs">© {new Date().getFullYear()} FunGames. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-gray-50 font-sans text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
