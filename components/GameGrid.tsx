'use client'

import { useState } from 'react'
import GameCard from '@/components/GameCard'
import { Game, Category } from '@/lib/games'

type GameGridProps = {
  games: Game[]
  categories: Category[]
}

export default function GameGrid({ games, categories }: GameGridProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? games
    : games.filter((g) => g.category === activeCategory)

  return (
    <section>
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 ${
              activeCategory === cat.slug
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Game grid */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 text-center text-gray-400">
          <span className="text-4xl">🕹️</span>
          <p className="mt-2">No games in this category yet.</p>
        </div>
      )}
    </section>
  )
}
