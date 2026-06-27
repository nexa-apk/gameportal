import Link from 'next/link'
import type { Metadata } from 'next'
import GameGrid from '@/components/GameGrid'
import AdBanner from '@/components/AdBanner'
import { games, categories, getFeaturedGames } from '@/lib/games'

export const metadata: Metadata = {
  title: 'FunGames — Free Online Games',
  description: 'Play free online arcade, puzzle and action games right in your browser. No downloads!',
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

export default function HomePage() {
  return (
    <>
      <FeaturedBanner />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" id="games">
        {/* Top ad */}
        <AdBanner slot="homepage-top" className="mb-8" />

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
        <AdBanner slot="homepage-mid" format="horizontal" className="mt-10" />
      </div>
    </>
  )
}
