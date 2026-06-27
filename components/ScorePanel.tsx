'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

type ScoreRow = {
  id: number
  game_slug: string
  player_name: string
  score: number
  created_at: string
}

type Phase = 'idle' | 'form' | 'submitted'

const SESSION_KEY = 'nexagames_player'

function medal(rank: number) {
  if (rank === 1) return '👑'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

export default function ScorePanel({
  gameSlug,
  gameTitle,
}: {
  gameSlug: string
  gameTitle: string
}) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [pendingScore, setPendingScore] = useState<number>(0)
  const [playerName, setPlayerName] = useState('')
  const [rank, setRank] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [leaderboard, setLeaderboard] = useState<ScoreRow[]>([])
  const [sessionPlayer, setSessionPlayer] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/scores/${gameSlug}`)
      if (res.ok) {
        const data = (await res.json()) as { scores: ScoreRow[] }
        setLeaderboard(data.scores)
      }
    } catch {
      // silently fail
    }
  }, [gameSlug])

  // Load saved player name
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY) ?? ''
    setPlayerName(saved)
    setSessionPlayer(saved)
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Listen for score events from Phaser games
  useEffect(() => {
    function onScore(e: Event) {
      const score = (e as CustomEvent<{ score: number }>).detail?.score ?? 0
      setPendingScore(Math.round(score))
      setPhase('form')
      setRank(null)
      // Auto-focus input
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    window.addEventListener('nexagames:score', onScore)
    return () => window.removeEventListener('nexagames:score', onScore)
  }, [])

  // Auto-refresh leaderboard every 30s
  useEffect(() => {
    const id = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(id)
  }, [fetchLeaderboard])

  async function submitScore() {
    if (!playerName.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_slug: gameSlug, player_name: playerName.trim(), score: pendingScore }),
      })
      if (res.ok) {
        const data = (await res.json()) as { rank: number }
        setRank(data.rank)
        setPhase('submitted')
        localStorage.setItem(SESSION_KEY, playerName.trim())
        setSessionPlayer(playerName.trim())
        await fetchLeaderboard()
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {/* Score submission panel */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-white">
          <span>🏆</span> Your Score
        </h3>

        {phase === 'idle' && (
          <p className="text-sm text-slate-400">
            Play <span className="font-semibold text-orange-400">{gameTitle}</span> and your
            score will automatically appear here at game over!
          </p>
        )}

        {phase === 'form' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-800 px-4 py-3">
              <span className="text-sm text-slate-400">Your score</span>
              <span className="text-2xl font-black text-orange-400 tabular-nums">
                {pendingScore.toLocaleString()}
              </span>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Enter your name to save
              </label>
              <input
                ref={inputRef}
                type="text"
                maxLength={20}
                placeholder="Your name…"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitScore()}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <button
              onClick={submitScore}
              disabled={submitting || !playerName.trim()}
              className="w-full rounded-lg bg-orange-500 py-2 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
            >
              {submitting ? 'Saving…' : 'Submit Score →'}
            </button>
            <button
              onClick={() => setPhase('idle')}
              className="w-full text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Skip
            </button>
          </div>
        )}

        {phase === 'submitted' && rank !== null && (
          <div className="space-y-3">
            <div className="rounded-lg bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 px-4 py-3 text-center">
              <div className="text-3xl mb-1">{rank <= 3 ? medal(rank) : '🎮'}</div>
              <p className="text-sm text-slate-300">
                You ranked{' '}
                <span className="font-black text-orange-400">#{rank}</span> on {gameTitle}
              </p>
              <p className="text-lg font-black text-white mt-1">
                {pendingScore.toLocaleString()} pts
              </p>
            </div>
            <button
              onClick={() => { setPhase('idle'); setPendingScore(0) }}
              className="w-full rounded-lg border border-slate-700 py-2 text-xs font-medium text-slate-400 hover:border-slate-500 hover:text-white transition"
            >
              Play again to beat your score
            </button>
          </div>
        )}
      </div>

      {/* Live leaderboard */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-white">
          <span>📊</span> Top 10 — {gameTitle}
        </h3>

        {leaderboard.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No scores yet — be the first! 🚀
          </p>
        ) : (
          <ol className="space-y-1.5">
            {leaderboard.map((entry, i) => {
              const isYou = entry.player_name === sessionPlayer && sessionPlayer !== ''
              return (
                <li
                  key={entry.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    i === 0
                      ? 'bg-yellow-500/10 border border-yellow-500/30'
                      : isYou
                      ? 'bg-orange-500/10 border border-orange-500/20'
                      : 'bg-slate-800/60'
                  }`}
                >
                  <span className="w-8 shrink-0 text-center font-bold text-slate-400">
                    {medal(i + 1)}
                  </span>
                  <span className={`flex-1 font-medium truncate ${isYou ? 'text-orange-400' : 'text-white'}`}>
                    {entry.player_name}
                    {isYou && <span className="ml-1 text-xs text-orange-500">(you)</span>}
                  </span>
                  <span className="font-black tabular-nums text-white">
                    {entry.score.toLocaleString()}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {timeAgo(entry.created_at)}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
