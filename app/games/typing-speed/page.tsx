import type { Metadata } from 'next'
import GameWrapper from '@/components/GameWrapper'

export const metadata: Metadata = {
  title: 'Typing Speed — NexaGames',
  description: 'Type the falling words before they hit the ground! Test your WPM and reflexes.',
  openGraph: {
    title: 'Typing Speed — NexaGames',
    description: 'Type falling words before they hit the ground!',
    url: 'https://fun.nexahost.top/games/typing-speed',
  },
}

export default function TypingSpeedPage() {
  return (
    <GameWrapper
      gameId="typing-speed"
      title="Typing Speed"
      description="Type the falling words before they hit the ground! Each correct word scores points and removes it. Miss 3 and it's game over."
      genre="puzzle"
      controls={[
        { key: 'Keyboard', action: 'Type the word shown' },
        { key: 'Enter', action: 'Submit word (auto on match)' },
      ]}
    />
  )
}
