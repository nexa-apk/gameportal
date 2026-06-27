import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import GameFrame from '@/components/GameFrame'
import GameCard from '@/components/GameCard'
import AdBanner from '@/components/AdBanner'
import ScorePanel from '@/components/ScorePanel'
import { getGame, games, formatPlays } from '@/lib/games'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const game = getGame(slug)
  if (!game) return { title: 'Game Not Found' }
  return {
    title: game.title,
    description: game.description,
    openGraph: {
      title: game.title,
      description: game.description,
      images: [{ url: game.thumbnail }],
    },
  }
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params
  const game = getGame(slug)
  if (!game) notFound()

  const related = games
    .filter((g) => g.category === game.category && g.slug !== game.slug)
    .slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
        <span>›</span>
        <Link href="/#games" className="hover:text-orange-500 transition-colors capitalize">
          {game.category}
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">{game.title}</span>
      </nav>

      {/* Game frame */}
      <GameFrame game={game} />

      {/* Game info */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{game.title}</h1>
            <span className="rounded-full bg-orange-100 px-3 py-0.5 text-sm font-medium text-orange-700 capitalize">
              {game.category}
            </span>
          </div>
          <p className="mt-1 text-gray-600">{game.description}</p>
          {game.plays !== undefined && (
            <p className="mt-1 text-sm text-gray-400">🎮 {formatPlays(game.plays)} plays</p>
          )}
        </div>

        <a
          href="#"
          className="shrink-0 rounded-full bg-orange-500 px-6 py-2.5 font-bold text-white shadow-md transition hover:bg-orange-400 active:scale-95 text-center"
        >
          ▶ Play Now
        </a>
      </div>

      {/* Score submission + leaderboard */}
      <ScorePanel gameSlug={game.slug} gameTitle={game.title} />

      {/* Ad below game */}
      <AdBanner slot="game-page-bottom" format="horizontal" className="mt-8" />

      {/* Related games */}
      {related.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h2 className="text-lg font-bold text-gray-900">More {game.category} games</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
