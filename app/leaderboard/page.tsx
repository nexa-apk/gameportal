'use client'
import { useEffect, useState, useCallback } from 'react'
import { games } from '@/lib/games'

type ScoreRow = {
  id: number
  game_slug: string
  player_name: string
  score: number
  created_at: string
}

const SESSION_KEY = 'nexagames_player'

function medal(rank: number) {
  if (rank === 1) return '👑'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'Z')
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function LeaderboardPage() {
  const [scores, setScores] = useState<ScoreRow[]>([])
  const [filterSlug, setFilterSlug] = useState('all')
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [sessionPlayer] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) ?? '' : ''
  )

  const fetchScores = useCallback(async () => {
    try {
      const url =
        filterSlug === 'all'
          ? '/api/leaderboard'
          : `/api/scores/${filterSlug}`
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        const data = (await res.json()) as { scores: ScoreRow[] }
        setScores(data.scores)
        setLastRefresh(new Date())
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [filterSlug])

  useEffect(() => {
    setLoading(true)
    fetchScores()
  }, [fetchScores])

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(fetchScores, 30000)
    return () => clearInterval(id)
  }, [fetchScores])

  // Display: global board shows top per game; per-game shows top 10
  const displayed =
    filterSlug === 'all' ? scores.slice(0, 50) : scores.slice(0, 10)

  // For the "all games" view, show rank per row in the list
  function getRankLabel(entry: ScoreRow, idx: number) {
    return medal(idx + 1)
  }

  function getGameTitle(slug: string) {
    return games.find((g) => g.slug === slug)?.title ?? slug
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
          🏆 Leaderboard
        </h1>
        <p className="mt-2 text-gray-500">Top scores across all games</p>
        {lastRefresh && (
          <p className="mt-1 text-xs text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 30s
          </p>
        )}
      </div>

      {/* Game filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Filter:</span>
        <button
          onClick={() => setFilterSlug('all')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            filterSlug === 'all'
              ? 'bg-orange-500 text-white shadow'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
          }`}
        >
          All Games
        </button>
        {games.map((g) => (
          <button
            key={g.slug}
            onClick={() => setFilterSlug(g.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filterSlug === g.slug
                ? 'bg-orange-500 text-white shadow'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {g.title}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Scores', value: scores.length.toString(), icon: '🎯' },
          { label: 'Top Score', value: displayed[0]?.score.toLocaleString() ?? '—', icon: '⭐' },
          { label: 'Unique Players', value: String(new Set(scores.map((s) => s.player_name)).size), icon: '👥' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white border border-gray-200 p-4 text-center shadow-sm">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-black text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Top 3 podium */}
        {displayed.length >= 3 && (
          <div className="border-b border-gray-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-2xl">🥈</div>
                <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
                  <div className="text-xs font-bold text-white truncate max-w-[80px]">
                    {displayed[1].player_name}
                  </div>
                  <div className="text-sm font-black text-blue-300">
                    {displayed[1].score.toLocaleString()}
                  </div>
                  {filterSlug === 'all' && (
                    <div className="text-xs text-slate-400 mt-0.5">{getGameTitle(displayed[1].game_slug)}</div>
                  )}
                </div>
              </div>
              {/* 1st */}
              <div className="flex flex-col items-center gap-2 -mb-2">
                <div className="text-3xl animate-bounce">👑</div>
                <div className="rounded-xl bg-yellow-500/20 border border-yellow-500/40 px-4 py-3 text-center">
                  <div className="text-sm font-black text-yellow-300 truncate max-w-[100px]">
                    {displayed[0].player_name}
                  </div>
                  <div className="text-xl font-black text-white">
                    {displayed[0].score.toLocaleString()}
                  </div>
                  {filterSlug === 'all' && (
                    <div className="text-xs text-slate-400 mt-0.5">{getGameTitle(displayed[0].game_slug)}</div>
                  )}
                </div>
              </div>
              {/* 3rd */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-2xl">🥉</div>
                <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
                  <div className="text-xs font-bold text-white truncate max-w-[80px]">
                    {displayed[2].player_name}
                  </div>
                  <div className="text-sm font-black text-orange-300">
                    {displayed[2].score.toLocaleString()}
                  </div>
                  {filterSlug === 'all' && (
                    <div className="text-xs text-slate-400 mt-0.5">{getGameTitle(displayed[2].game_slug)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🎮</div>
            <p className="text-gray-500 font-medium">No scores yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to play and submit your score!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600 w-16">Rank</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Player</th>
                {filterSlug === 'all' && (
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Game</th>
                )}
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Score</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed.map((entry, i) => {
                const isYou = entry.player_name === sessionPlayer && sessionPlayer !== ''
                const isTop3 = i < 3
                return (
                  <tr
                    key={entry.id}
                    className={`transition ${
                      isYou
                        ? 'bg-orange-50 border-l-2 border-orange-400'
                        : isTop3
                        ? 'bg-yellow-50/50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-center">
                      <span className={isTop3 ? 'text-lg' : 'text-gray-400'}>
                        {getRankLabel(entry, i)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${isYou ? 'text-orange-600' : 'text-gray-900'}`}>
                        {entry.player_name}
                      </span>
                      {isYou && (
                        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600">
                          You!
                        </span>
                      )}
                    </td>
                    {filterSlug === 'all' && (
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                        {getGameTitle(entry.game_slug)}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right font-black tabular-nums text-gray-900">
                      {entry.score.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
