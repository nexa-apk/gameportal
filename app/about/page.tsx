import type { Metadata } from 'next'
import Link from 'next/link'
import ContactLink from '@/components/ContactLink'

export const metadata: Metadata = {
  title: 'About NexaGames',
  description: 'Learn about NexaGames — a free browser game portal with arcade, puzzle, action, and sports games. No downloads, no sign-ups. Just play!',
  robots: { index: true, follow: true },
}

const features = [
  { icon: '⚡', title: 'Instant Play', body: 'Every game loads in your browser — no downloads, no installs, no plugins. Click and play in seconds.' },
  { icon: '🆓', title: 'Always Free', body: 'All games on NexaGames are completely free to play. No paywalls, no premium tiers, no hidden costs.' },
  { icon: '🔒', title: 'No Sign-Up Required', body: 'Jump straight in. You never need to create an account or hand over personal information to enjoy any game.' },
  { icon: '📱', title: 'Works Everywhere', body: 'Designed to run smoothly on desktop, tablet, and mobile. Your game scales to fit your screen.' },
  { icon: '🏆', title: 'Global Leaderboard', body: 'Compete with players around the world. Submit your score, claim your rank, and see if you can take the top spot.' },
  { icon: '🎮', title: 'Growing Library', body: 'We ship new games regularly — from classic arcade and puzzle games to action and sports titles.' },
]

const games = [
  { emoji: '🐍', name: 'Snake', category: 'Arcade' },
  { emoji: '🧱', name: 'Tetris', category: 'Puzzle' },
  { emoji: '2️⃣', name: '2048', category: 'Puzzle' },
  { emoji: '🎴', name: 'Memory Match', category: 'Puzzle' },
  { emoji: '🚀', name: 'Space Shooter', category: 'Action' },
  { emoji: '🎯', name: 'Breakout', category: 'Arcade' },
  { emoji: '🎱', name: '8-Ball Pool', category: 'Sports' },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">About</span>
      </nav>

      {/* Hero */}
      <div className="mb-12 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-14 text-center">
        <div className="text-5xl mb-4">🎮</div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          About <span className="text-orange-400">NexaGames</span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-slate-300 leading-relaxed">
          A Miniclip-style game portal built for one thing: letting you play great browser games
          instantly, for free, with no fuss.
        </p>
        <Link
          href="/#games"
          className="mt-6 inline-block rounded-full bg-orange-500 px-8 py-3 font-bold text-white shadow-lg transition hover:bg-orange-400 active:scale-95"
        >
          ▶ Start Playing
        </Link>
      </div>

      {/* Mission */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-black text-gray-900">Our Mission</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-gray-600 leading-relaxed space-y-4">
          <p>
            NexaGames was built on a simple idea: the best games don't need an app store, a login wall,
            or a credit card. They just need a browser and a few seconds to load.
          </p>
          <p>
            We curate and build high-quality HTML5 games — powered by{' '}
            <strong>Phaser</strong>, one of the most capable browser game engines available — and serve them
            to anyone, anywhere, for free. Whether you have five minutes or five hours, there's a game here
            for you.
          </p>
          <p>
            The portal is kept alive by non-intrusive display advertising through Google AdSense. Ads let us
            run the service at zero cost to players. We've deliberately placed them outside the game canvas so
            they never interrupt your play.
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-black text-gray-900">Why NexaGames?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-orange-200"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-black text-gray-900">Built With</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {[
              'Next.js 16 (App Router)',
              'Phaser 4',
              'Tailwind CSS v4',
              'TypeScript',
              'SQLite (Leaderboard)',
              'Cloudflare Tunnel',
              'Google AdSense',
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700"
              >
                {tech}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500 leading-relaxed">
            Games are statically generated at build time for near-instant page loads. Each game runs entirely
            in your browser using the Phaser engine — no server-side game logic, no latency.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-10 text-center">
        <div className="text-3xl mb-3">✉️</div>
        <h2 className="text-xl font-black text-white mb-2">Get in Touch</h2>
        <p className="text-slate-400 text-sm mb-4">
          Got a game suggestion, a bug report, or just want to say hi?
        </p>
        <ContactLink
          user="support"
          domain="nexahost.top"
          label="Contact Support"
          className="inline-block rounded-full bg-orange-500 px-6 py-2.5 font-bold text-white shadow-md transition hover:bg-orange-400 active:scale-95"
        />
      </section>
    </div>
  )
}
