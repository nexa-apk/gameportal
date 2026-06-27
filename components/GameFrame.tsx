'use client'

import dynamic from 'next/dynamic'
import { Game } from '@/lib/games'

// Static map — all importable game components must be listed here
const gameComponentMap: Record<string, React.ComponentType> = {
  Snake: dynamic(() => import('@/components/games/Snake'), { ssr: false, loading: () => <GameLoading /> }),
  Tetris: dynamic(() => import('@/components/games/Tetris'), { ssr: false, loading: () => <GameLoading /> }),
  Game2048: dynamic(() => import('@/components/games/Game2048'), { ssr: false, loading: () => <GameLoading /> }),
  FlappyBird: dynamic(() => import('@/components/games/FlappyBird'), { ssr: false, loading: () => <GameLoading /> }),
  Breakout: dynamic(() => import('@/components/games/Breakout'), { ssr: false, loading: () => <GameLoading /> }),
  SpaceInvaders: dynamic(() => import('@/components/games/SpaceInvaders'), { ssr: false, loading: () => <GameLoading /> }),
}

function GameLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-900 text-white">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      <p className="text-sm text-slate-400">Loading game...</p>
    </div>
  )
}

function GameComingSoon({ game }: { game: Game }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
      <span className="text-6xl">🎮</span>
      <h2 className="text-2xl font-bold">{game.title}</h2>
      <p className="text-slate-400">This game is coming soon!</p>
    </div>
  )
}

export default function GameFrame({ game }: { game: Game }) {
  const GameComponent = gameComponentMap[game.component]

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 shadow-2xl" style={{ paddingBottom: '56.25%' }}>
      <div className="absolute inset-0">
        {GameComponent ? <GameComponent /> : <GameComingSoon game={game} />}
      </div>
    </div>
  )
}
