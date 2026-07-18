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
  PacMan: dynamic(() => import('@/components/games/PacMan'), { ssr: false, loading: () => <GameLoading /> }),
  Pong: dynamic(() => import('@/components/games/Pong'), { ssr: false, loading: () => <GameLoading /> }),
  Asteroids: dynamic(() => import('@/components/games/Asteroids'), { ssr: false, loading: () => <GameLoading /> }),
  Minesweeper: dynamic(() => import('@/components/games/Minesweeper'), { ssr: false, loading: () => <GameLoading /> }),
  FruitNinja: dynamic(() => import('@/components/games/FruitNinja'), { ssr: false, loading: () => <GameLoading /> }),
  DoodleJump: dynamic(() => import('@/components/games/DoodleJump'), { ssr: false, loading: () => <GameLoading /> }),
  CrossyRoad: dynamic(() => import('@/components/games/CrossyRoad'), { ssr: false, loading: () => <GameLoading /> }),
  BubbleShooter: dynamic(() => import('@/components/games/BubbleShooter'), { ssr: false, loading: () => <GameLoading /> }),
  TowerDefense: dynamic(() => import('@/components/games/TowerDefense'), { ssr: false, loading: () => <GameLoading /> }),
  MemoryMatchGame: dynamic(() => import('@/components/games/MemoryMatchGame'), { ssr: false, loading: () => <GameLoading /> }),
  WhackAMole: dynamic(() => import('@/components/games/WhackAMole'), { ssr: false, loading: () => <GameLoading /> }),
  ColorSwitch: dynamic(() => import('@/components/games/ColorSwitch'), { ssr: false, loading: () => <GameLoading /> }),
  Pool8: dynamic(() => import('@/components/games/Pool8'), { ssr: false, loading: () => <GameLoading /> }),
  GemBlast: dynamic(() => import('@/components/games/GemBlast'), { ssr: false, loading: () => <GameLoading /> }),
  BalloonPop: dynamic(() => import('@/components/games/BalloonPop'), { ssr: false, loading: () => <GameLoading /> }),
  KidsMath: dynamic(() => import('@/components/games/KidsMath'), { ssr: false, loading: () => <GameLoading /> }),
  AnimalMatch: dynamic(() => import('@/components/games/AnimalMatch'), { ssr: false, loading: () => <GameLoading /> }),
  CatchTheFruit: dynamic(() => import('@/components/games/CatchTheFruit'), { ssr: false, loading: () => <GameLoading /> }),
  PianoTiles: dynamic(() => import('@/components/games/PianoTiles'), { ssr: false, loading: () => <GameLoading /> }),
  ShapeMatch: dynamic(() => import('@/components/games/ShapeMatch'), { ssr: false, loading: () => <GameLoading /> }),
  BasketballShoot: dynamic(() => import('@/components/games/BasketballShoot'), { ssr: false, loading: () => <GameLoading /> }),
  LaneRunner: dynamic(() => import('@/components/games/LaneRunner'), { ssr: false, loading: () => <GameLoading /> }),
  OddOneOut: dynamic(() => import('@/components/games/OddOneOut'), { ssr: false, loading: () => <GameLoading /> }),
  RockPaperScissors: dynamic(() => import('@/components/games/RockPaperScissors'), { ssr: false, loading: () => <GameLoading /> }),
  KeepyUppy: dynamic(() => import('@/components/games/KeepyUppy'), { ssr: false, loading: () => <GameLoading /> }),
  NumberTap: dynamic(() => import('@/components/games/NumberTap'), { ssr: false, loading: () => <GameLoading /> }),
  QuickMath: dynamic(() => import('@/components/games/QuickMath'), { ssr: false, loading: () => <GameLoading /> }),
  TimesTables: dynamic(() => import('@/components/games/TimesTables'), { ssr: false, loading: () => <GameLoading /> }),
  MathRain: dynamic(() => import('@/components/games/MathRain'), { ssr: false, loading: () => <GameLoading /> }),
  NumberBonds: dynamic(() => import('@/components/games/NumberBonds'), { ssr: false, loading: () => <GameLoading /> }),
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
