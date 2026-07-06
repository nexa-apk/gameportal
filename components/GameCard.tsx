'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Game } from '@/lib/games'

export default function GameCard({ game }: { game: Game }) {
  const [imgError, setImgError] = useState(false)

  const categoryColors: Record<string, string> = {
    arcade: 'bg-orange-100 text-orange-700',
    puzzle: 'bg-blue-100 text-blue-700',
    action: 'bg-red-100 text-red-700',
    sports: 'bg-green-100 text-green-700',
  }

  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900">
          {!imgError ? (
            <img
              src={game.thumbnail}
              alt={game.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">🎮</div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-lg">
              ▶ PLAY NOW
            </span>
          </div>
          {game.featured && (
            <span className="absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-yellow-900">
              HOT
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-gray-900 transition-colors group-hover:text-orange-500 truncate">
            {game.title}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
          <div className="mt-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${categoryColors[game.category] ?? 'bg-gray-100 text-gray-600'}`}>
              {game.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
