import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import GameFrame from '@/components/GameFrame'
import GameCard from '@/components/GameCard'
import AdBanner from '@/components/AdBanner'
import ScorePanel from '@/components/ScorePanel'
import { getGame, games } from '@/lib/games'
import gameContent from '@/lib/gameContent'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }))
}

const BASE_URL = 'https://fun.nexahost.top'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const game = getGame(slug)
  if (!game) return { title: 'Game Not Found' }
  return {
    title: game.title,
    description: game.description,
    alternates: { canonical: `${BASE_URL}/games/${slug}` },
    openGraph: {
      title: `${game.title} | NexaGames`,
      description: game.description,
      url: `${BASE_URL}/games/${slug}`,
      images: [{ url: game.thumbnail, alt: game.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${game.title} | NexaGames`,
      description: game.description,
      images: [game.thumbnail],
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.description,
    url: `${BASE_URL}/games/${game.slug}`,
    image: `${BASE_URL}${game.thumbnail}`,
    genre: game.category,
    gamePlatform: 'Web Browser',
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    ...(game.rating !== undefined && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: game.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: game.plays ?? 100,
      },
    }),
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

      {/* Rectangle ad below game canvas */}
      <AdBanner slot="1234567890" format="rectangle" className="mt-4" />

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

      {/* Game content: How to Play / About / Tips */}
      {gameContent[game.slug] && (() => {
        const content = gameContent[game.slug]
        return (
          <section className="mt-10 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-black text-gray-900">How to Play {game.title}</h2>
              <ul className="space-y-2">
                {content.howToPlay.map((step, i) => (
                  <li key={i} className="flex gap-3 text-gray-600 leading-relaxed">
                    <span className="mt-0.5 flex-shrink-0 text-orange-500 font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-black text-gray-900">About {game.title}</h2>
              <p className="text-gray-600 leading-relaxed">{content.about}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-black text-gray-900">Tips &amp; Strategy</h2>
              <ul className="space-y-2">
                {content.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-gray-600 leading-relaxed">
                    <span className="mt-0.5 flex-shrink-0 text-orange-500">★</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )
      })()}

      {/* Ad below score panel */}
      <AdBanner slot="1234567890" format="horizontal" className="mt-8" />

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
