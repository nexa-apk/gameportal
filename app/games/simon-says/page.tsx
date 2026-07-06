import type { Metadata } from 'next'
import GameWrapper from '@/components/GameWrapper'

export const metadata: Metadata = {
  title: 'Simon Says — NexaGames',
  description: 'Watch the pattern, repeat it back. How many rounds can you remember?',
  openGraph: {
    title: 'Simon Says — NexaGames',
    description: 'Memory pattern game. Watch, listen, repeat!',
    url: 'https://fun.nexahost.top/games/simon-says',
  },
}

export default function SimonSaysPage() {
  return (
    <GameWrapper
      gameId="simon-says"
      title="Simon Says"
      description="Watch the colour pattern, then repeat it back! Each round adds one more step."
      genre="puzzle"
      controls={[
        { key: 'Mouse Click', action: 'Select colour' },
        { key: 'Touch', action: 'Tap colour (mobile)' },
      ]}
    />
  )
}
