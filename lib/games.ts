export type Game = {
  slug: string
  title: string
  description: string
  thumbnail: string
  category: string
  component: string
  featured?: boolean
  plays?: number
}

export type Category = {
  slug: string
  label: string
  icon: string
}

export const categories: Category[] = [
  { slug: 'all', label: 'All Games', icon: '🎮' },
  { slug: 'arcade', label: 'Arcade', icon: '🕹️' },
  { slug: 'puzzle', label: 'Puzzle', icon: '🧩' },
  { slug: 'action', label: 'Action', icon: '⚡' },
  { slug: 'sports', label: 'Sports', icon: '⚽' },
]

export const games: Game[] = [
  {
    slug: 'snake',
    title: 'Snake',
    description: 'Classic snake game. Eat food, grow longer, and don\'t hit the walls or yourself!',
    thumbnail: '/games/snake/thumb.svg',
    category: 'arcade',
    component: 'Snake',
    featured: true,
    plays: 12400,
  },
  {
    slug: 'tetris',
    title: 'Tetris',
    description: 'Stack falling blocks to clear lines in this timeless puzzle classic.',
    thumbnail: '/games/tetris/thumb.svg',
    category: 'puzzle',
    component: 'Tetris',
    featured: true,
    plays: 9800,
  },
  {
    slug: '2048',
    title: '2048',
    description: 'Slide and merge tiles to reach the 2048 tile. Simple to learn, hard to master!',
    thumbnail: '/games/2048/thumb.svg',
    category: 'puzzle',
    component: 'Game2048',
    plays: 7600,
  },
  {
    slug: 'flappy-bird',
    title: 'Flappy Bird',
    description: 'Tap to fly through the pipes. How far can you go without crashing?',
    thumbnail: '/games/flappy-bird/thumb.svg',
    category: 'arcade',
    component: 'FlappyBird',
    featured: true,
    plays: 21300,
  },
  {
    slug: 'breakout',
    title: 'Breakout',
    description: 'Break all the bricks with your paddle and ball. Clear every level!',
    thumbnail: '/games/breakout/thumb.svg',
    category: 'arcade',
    component: 'Breakout',
    plays: 5200,
  },
  {
    slug: 'space-invaders',
    title: 'Space Invaders',
    description: 'Blast alien invaders in this retro space shooter. Survive the waves!',
    thumbnail: '/games/space-invaders/thumb.svg',
    category: 'action',
    component: 'SpaceInvaders',
    plays: 8900,
  },
]

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug)
}

export function getGamesByCategory(category: string): Game[] {
  if (category === 'all') return games
  return games.filter((g) => g.category === category)
}

export function getFeaturedGames(): Game[] {
  return games.filter((g) => g.featured)
}

export function formatPlays(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
