export type Game = {
  slug: string
  title: string
  description: string
  thumbnail: string
  category: string
  component: string
  featured?: boolean
  plays?: number
  rating?: number
  isNew?: boolean
  isHot?: boolean
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
  { slug: 'strategy', label: 'Strategy', icon: '🏰' },
  { slug: 'sports', label: 'Sports', icon: '⚽' },
]

export const games: Game[] = [
  {
    slug: 'snake',
    title: 'Snake',
    description: "Classic snake game. Eat food, grow longer, and don't hit the walls or yourself!",
    thumbnail: '/games/snake/thumb.svg',
    category: 'arcade',
    component: 'Snake',
    featured: true,
    plays: 12400,
    rating: 4.5,
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
    rating: 4.8,
  },
  {
    slug: '2048',
    title: '2048',
    description: 'Slide and merge tiles to reach the 2048 tile. Simple to learn, hard to master!',
    thumbnail: '/games/2048/thumb.svg',
    category: 'puzzle',
    component: 'Game2048',
    plays: 7600,
    rating: 4.3,
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
    rating: 4.6,
    isHot: true,
  },
  {
    slug: 'breakout',
    title: 'Breakout',
    description: 'Break all the bricks with your paddle and ball. Clear every level!',
    thumbnail: '/games/breakout/thumb.svg',
    category: 'arcade',
    component: 'Breakout',
    plays: 5200,
    rating: 4.1,
  },
  {
    slug: 'space-invaders',
    title: 'Space Invaders',
    description: 'Blast alien invaders in this retro space shooter. Survive the waves!',
    thumbnail: '/games/space-invaders/thumb.svg',
    category: 'action',
    component: 'SpaceInvaders',
    plays: 8900,
    rating: 4.4,
  },
  {
    slug: 'pac-man',
    title: 'Pac-Man',
    description: 'Navigate the maze, eat all the dots, and avoid the ghosts. Eat power pellets to turn the tables!',
    thumbnail: '/games/pac-man/thumb.svg',
    category: 'arcade',
    component: 'PacMan',
    plays: 18500,
    rating: 4.7,
    isHot: true,
  },
  {
    slug: 'pong',
    title: 'Pong',
    description: 'The original arcade classic. Beat the CPU paddle and be first to 10 points!',
    thumbnail: '/games/pong/thumb.svg',
    category: 'arcade',
    component: 'Pong',
    plays: 6300,
    rating: 4.0,
    isNew: true,
  },
  {
    slug: 'asteroids',
    title: 'Asteroids',
    description: 'Pilot your ship through an asteroid field. Shoot rocks, survive waves, collect points!',
    thumbnail: '/games/asteroids/thumb.svg',
    category: 'action',
    component: 'Asteroids',
    plays: 7100,
    rating: 4.5,
    isNew: true,
  },
  {
    slug: 'minesweeper',
    title: 'Minesweeper',
    description: 'Reveal all safe cells without hitting a mine. Use number clues and flags wisely!',
    thumbnail: '/games/minesweeper/thumb.svg',
    category: 'puzzle',
    component: 'Minesweeper',
    plays: 11200,
    rating: 4.6,
  },
  {
    slug: 'fruit-ninja',
    title: 'Fruit Ninja',
    description: 'Swipe to slice flying fruits before they fall. Miss 3 and the game ends!',
    thumbnail: '/games/fruit-ninja/thumb.svg',
    category: 'arcade',
    component: 'FruitNinja',
    plays: 15700,
    rating: 4.5,
    isHot: true,
  },
  {
    slug: 'doodle-jump',
    title: 'Doodle Jump',
    description: 'Keep jumping higher and higher on platforms. How far can you reach?',
    thumbnail: '/games/doodle-jump/thumb.svg',
    category: 'arcade',
    component: 'DoodleJump',
    plays: 13200,
    rating: 4.4,
    isNew: true,
  },
  {
    slug: 'crossy-road',
    title: 'Crossy Road',
    description: 'Hop across roads, rivers, and train tracks. Time your moves to survive!',
    thumbnail: '/games/crossy-road/thumb.svg',
    category: 'arcade',
    component: 'CrossyRoad',
    plays: 9400,
    rating: 4.3,
    isNew: true,
  },
  {
    slug: 'bubble-shooter',
    title: 'Bubble Shooter',
    description: 'Aim and shoot colored bubbles. Match 3 or more to pop them and clear the board!',
    thumbnail: '/games/bubble-shooter/thumb.svg',
    category: 'puzzle',
    component: 'BubbleShooter',
    plays: 14800,
    rating: 4.5,
    isHot: true,
  },
  {
    slug: 'tower-defense',
    title: 'Tower Defense',
    description: 'Place towers to stop enemy waves from reaching the base. Upgrade and survive!',
    thumbnail: '/games/tower-defense/thumb.svg',
    category: 'strategy',
    component: 'TowerDefense',
    plays: 8600,
    rating: 4.6,
    isNew: true,
  },
  {
    slug: 'memory-match',
    title: 'Memory Match',
    description: 'Flip cards to find matching pairs. Complete the board in the fewest moves!',
    thumbnail: '/games/memory-match/thumb.svg',
    category: 'puzzle',
    component: 'MemoryMatchGame',
    plays: 10100,
    rating: 4.2,
  },
  {
    slug: 'whack-a-mole',
    title: 'Whack-a-Mole',
    description: 'Whack the moles before they disappear! You have 30 seconds — go for the high score!',
    thumbnail: '/games/whack-a-mole/thumb.svg',
    category: 'arcade',
    component: 'WhackAMole',
    plays: 12900,
    rating: 4.3,
    isHot: true,
  },
  {
    slug: 'color-switch',
    title: 'Color Switch',
    description: 'Tap to pass through spinning obstacles — but only through your matching color segment!',
    thumbnail: '/games/color-switch/thumb.svg',
    category: 'action',
    component: 'ColorSwitch',
    plays: 16300,
    rating: 4.7,
    isHot: true,
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
