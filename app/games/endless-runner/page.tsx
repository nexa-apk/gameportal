import type { Metadata } from 'next'
import GameWrapper from '@/components/GameWrapper'

export const metadata: Metadata = {
  title: 'Endless Runner — NexaGames',
  description: 'Run, jump and slide to dodge obstacles in this addictive endless runner! How far can you go?',
  openGraph: {
    title: 'Endless Runner — NexaGames',
    description: 'Run, jump and slide to dodge obstacles. No download needed!',
    url: 'https://fun.nexahost.top/games/endless-runner',
  },
}

export default function EndlessRunnerPage() {
  return (
    <GameWrapper
      gameId="endless-runner"
      title="Endless Runner"
      description="Run, jump and slide to dodge obstacles! How far can you go?"
      genre="arcade"
      controls={[
        { key: 'Space / ↑', action: 'Jump' },
        { key: 'Space (air)', action: 'Double Jump' },
        { key: '↓ / S', action: 'Slide' },
      ]}
    />
  )
}
