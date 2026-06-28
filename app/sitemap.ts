import type { MetadataRoute } from 'next'
import { games, categories } from '@/lib/games'

const BASE_URL = 'https://fun.nexahost.top'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const gameUrls: MetadataRoute.Sitemap = games.map((game) => ({
    url: `${BASE_URL}/games/${game.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter((c) => c.slug !== 'all')
    .map((category) => ({
      url: `${BASE_URL}/#games?category=${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    ...gameUrls,
    ...categoryUrls,
  ]
}
