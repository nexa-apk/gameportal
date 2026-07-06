import type { Metadata } from 'next'
import GameWrapper from '@/components/GameWrapper'

export const metadata: Metadata = {
  title: 'Brick Breaker Deluxe — NexaGames',
  description: 'Break all the bricks with power-ups, multi-ball and explosive effects!',
  openGraph: {
    title: 'Brick Breaker Deluxe — NexaGames',
    description: 'Breakout upgraded — power-ups, multi-ball, explosive bricks!',
    url: 'https://fun.nexahost.top/games/brick-breaker',
  },
}

export default function BrickBreakerPage() {
  return (
    <GameWrapper
      gameId="brick-breaker"
      title="Brick Breaker Deluxe"
      description="Upgraded Breakout with power-ups! Catch multi-ball, wide paddle, and explosive brick power-ups as you clear every row."
      genre="arcade"
      controls={[
        { key: '← / →', action: 'Move paddle' },
        { key: 'Mouse', action: 'Move paddle' },
        { key: 'Space', action: 'Launch ball' },
      ]}
    />
  )
}
