import type { Metadata } from 'next'
import GameWrapper from '@/components/GameWrapper'

export const metadata: Metadata = {
  title: 'Ping Pong — NexaGames',
  description: 'Classic table tennis vs the CPU. First to 7 wins!',
  openGraph: {
    title: 'Ping Pong — NexaGames',
    description: 'Classic table tennis vs CPU. First to 7 wins!',
    url: 'https://fun.nexahost.top/games/ping-pong',
  },
}

export default function PingPongPage() {
  return (
    <GameWrapper
      gameId="ping-pong"
      title="Ping Pong"
      description="Classic table tennis! Move your paddle to beat the CPU. First to 7 wins!"
      genre="sports"
      controls={[
        { key: '↑ / ↓', action: 'Move paddle' },
        { key: 'W / S', action: 'Move paddle (alt)' },
        { key: 'Mouse', action: 'Move paddle' },
      ]}
    />
  )
}
