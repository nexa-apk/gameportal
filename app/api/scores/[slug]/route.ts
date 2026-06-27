import { NextResponse } from 'next/server'
import { getTopScoresBySlug } from '@/lib/db'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params
  const scores = await getTopScoresBySlug(slug, 10)
  return NextResponse.json({ scores })
}
