import { NextResponse } from 'next/server'
import { getTopScoresAllGames } from '@/lib/db'

export async function GET() {
  const scores = await getTopScoresAllGames(50)
  return NextResponse.json({ scores })
}
