import Link from 'next/link'
import type { Metadata } from 'next'
import GameGrid from '@/components/GameGrid'
import AdBanner from '@/components/AdBanner'
import { games, categories, getFeaturedGames } from '@/lib/games'

const BASE_URL = 'https://fun.nexahost.top'

export const metadata: Metadata = {
  title: 'NexaGames - Free Online Games | Play Now',
  description: 'Play 19+ free online games instantly. Arcade, puzzle, action, sports games. No download needed!',
  alternates: { canonical: BASE_URL },
}

function FeaturedBanner() {
  const featured = getFeaturedGames()

  return (
    <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <h2 className="text-xl font-bold text-white">Featured Games</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {featured.map((game, i) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-xl"
            >
              <div className={`relative aspect-video overflow-hidden ${i === 0 ? 'sm:aspect-[16/10]' : ''}`}>
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                    {game.category}
                  </p>
                  <h3 className="text-lg font-bold text-white">{game.title}</h3>
                  <p className="mt-1 text-xs text-gray-300 line-clamp-2">{game.description}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="rounded-full bg-orange-500 px-6 py-2 font-bold text-white shadow-lg">
                    ▶ PLAY NOW
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NexaGames',
  url: BASE_URL,
  description: 'Play 19+ free online games instantly. Arcade, puzzle, action, sports games. No download needed!',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/#games?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <FeaturedBanner />

      {/* Horizontal banner below hero */}
      <AdBanner slot="1234567890" format="horizontal" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6" />

      {/* Flash games promo banner disabled — section temporarily hidden */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" id="games">

        {/* Game grid with category filter */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">🕹️</span>
          <h2 className="text-xl font-bold text-gray-900">All Games</h2>
          <span className="ml-auto rounded-full bg-orange-100 px-3 py-0.5 text-sm font-medium text-orange-700">
            {games.length} games
          </span>
        </div>

        <GameGrid games={games} categories={categories} />

        {/* Mid-page ad */}
        <AdBanner slot="1234567890" format="horizontal" className="mt-10" />
      </div>
    </>
  )
}
