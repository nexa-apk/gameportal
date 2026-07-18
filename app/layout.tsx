import type { Metadata } from 'next'
import { Inter, Press_Start_2P } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
})

const BASE_URL = 'https://fun.nexahost.top'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'NexaGames - Free Online Games | Play Now',
    template: '%s | NexaGames',
  },
  description: 'Play 19+ free online games instantly. Arcade, puzzle, action, sports games. No download needed!',
  keywords: [
    'free online games',
    'browser games',
    'play free games',
    'arcade games',
    'puzzle games',
    'action games',
    'sports games',
    'no download games',
    'NexaGames',
  ],
  authors: [{ name: 'NexaGames' }],
  creator: 'NexaGames',
  publisher: 'NexaGames',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    siteName: 'NexaGames',
    type: 'website',
    url: BASE_URL,
    title: 'NexaGames - Free Online Games | Play Now',
    description: 'Play 19+ free online games instantly. Arcade, puzzle, action, sports games. No download needed!',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'NexaGames - Free Online Games' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexaGames - Free Online Games | Play Now',
    description: 'Play 19+ free online games instantly. No download needed!',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🎮</span>
          <span className="text-xl font-extrabold tracking-tight text-white" style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.85rem' }}>
            Nexa<span className="text-orange-400">Games</span>
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
          <Link
            href="/leaderboard"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            🏆 Leaderboard
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
            <span className="font-extrabold text-white" style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.75rem' }}>
              Nexa<span className="text-orange-400">Games</span>
            </span>
          </div>
          <p className="text-sm text-center">
            Free browser games — no downloads, no sign-ups. Just play!
          </p>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <nav className="flex items-center gap-4 text-xs">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </nav>
            <p className="text-xs">© {new Date().getFullYear()} NexaGames. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${pressStart2P.variable} antialiased`}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9172954381668177" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9172954381668177"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-gray-50 font-sans text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
