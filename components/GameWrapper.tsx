'use client'

import { useEffect, useRef, useState } from 'react'

type Control = {
  key: string
  action: string
}

type GameWrapperProps = {
  gameId: string
  title: string
  description: string
  genre: string
  controls: Control[]
}

declare global {
  interface Window {
    Phaser?: typeof import('phaser')
  }
}

export default function GameWrapper({ gameId, title, description, genre, controls }: GameWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<{ destroy: (removeCanvas: boolean, noReturn?: boolean) => void } | null>(null)
  const [status, setStatus] = useState('Loading game...')

  useEffect(() => {
    let cancelled = false
    let script: HTMLScriptElement | null = null

    async function loadGame() {
      try {
        const Phaser = (await import('phaser')).default
        if (cancelled) return

        window.Phaser = Phaser
        const OriginalGame = Phaser.Game

        ;(Phaser as typeof Phaser & { Game: unknown }).Game = function patchedGame(
          this: unknown,
          config: Phaser.Types.Core.GameConfig,
        ) {
          const game = new OriginalGame(config)
          gameRef.current = game
          return game
        } as unknown as typeof Phaser.Game

        script = document.createElement('script')
        script.src = `/games/${gameId}/main.js`
        script.async = true
        script.onload = () => {
          ;(Phaser as typeof Phaser & { Game: unknown }).Game = OriginalGame
          if (!cancelled) {
            setStatus('')
            containerRef.current?.focus()
          }
        }
        script.onerror = () => {
          ;(Phaser as typeof Phaser & { Game: unknown }).Game = OriginalGame
          if (!cancelled) setStatus('Unable to load game.')
        }
        document.body.appendChild(script)
      } catch {
        if (!cancelled) setStatus('Unable to load game.')
      }
    }

    loadGame()

    return () => {
      cancelled = true
      if (script?.parentNode) script.parentNode.removeChild(script)
      gameRef.current?.destroy(true)
      gameRef.current = null
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [gameId])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <span className="rounded-full bg-orange-100 px-3 py-0.5 text-sm font-medium text-orange-700 capitalize">
            {genre}
          </span>
        </div>
        <p className="mt-1 text-gray-600">{description}</p>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 shadow-2xl">
        <div className="flex min-h-[360px] items-center justify-center p-3">
          {status && <p className="text-sm text-slate-300">{status}</p>}
          <div id="game-container" ref={containerRef} className="w-full" tabIndex={0} />
        </div>
      </div>

      <section className="mt-5">
        <h2 className="text-lg font-bold text-gray-900">Controls</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {controls.map((control) => (
            <div key={`${control.key}-${control.action}`} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="text-sm font-semibold text-gray-900">{control.key}</div>
              <div className="mt-1 text-sm text-gray-500">{control.action}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
