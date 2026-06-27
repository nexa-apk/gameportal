import { NextResponse } from 'next/server'
import { insertScore, getRankForScore } from '@/lib/db'
import { getGame } from '@/lib/games'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { game_slug?: unknown; player_name?: unknown; score?: unknown }
    const { game_slug, player_name, score } = body

    if (typeof game_slug !== 'string' || typeof player_name !== 'string' || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
    }

    if (!getGame(game_slug)) {
      return NextResponse.json({ error: 'Unknown game' }, { status: 400 })
    }

    const name = player_name.trim().slice(0, 20) || 'Anonymous'
    const entry = await insertScore(game_slug, name, Math.round(score))
    const rank = await getRankForScore(game_slug, Math.round(score))

    return NextResponse.json({ success: true, entry, rank })
  } catch (err) {
    console.error('[POST /api/scores]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
