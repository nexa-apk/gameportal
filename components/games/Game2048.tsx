'use client'

import { useEffect, useRef } from 'react'

const SIZE = 4
const TILE = 100
const GAP = 12
const PAD = 16
const BOARD_SIZE = SIZE * TILE + (SIZE - 1) * GAP + GAP
const W = BOARD_SIZE + PAD * 2
const H = W + 80

const TILE_COLORS: Record<number, { bg: number; fg: string }> = {
  0:    { bg: 0xcdc1b4, fg: '#776e65' },
  2:    { bg: 0xeee4da, fg: '#776e65' },
  4:    { bg: 0xede0c8, fg: '#776e65' },
  8:    { bg: 0xf2b179, fg: '#f9f6f2' },
  16:   { bg: 0xf59563, fg: '#f9f6f2' },
  32:   { bg: 0xf67c5f, fg: '#f9f6f2' },
  64:   { bg: 0xf65e3b, fg: '#f9f6f2' },
  128:  { bg: 0xedcf72, fg: '#f9f6f2' },
  256:  { bg: 0xedcc61, fg: '#f9f6f2' },
  512:  { bg: 0xedc850, fg: '#f9f6f2' },
  1024: { bg: 0xedc53f, fg: '#f9f6f2' },
  2048: { bg: 0xedc22e, fg: '#f9f6f2' },
}

type Grid = number[][]

export default function Game2048() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private grid: Grid = []
        private score = 0
        private best = 0
        private gfx!: Phaser.GameObjects.Graphics
        private overlay!: Phaser.GameObjects.Container
        private scoreText!: Phaser.GameObjects.Text
        private bestText!: Phaser.GameObjects.Text
        private tileTexts: Phaser.GameObjects.Text[] = []
        private won = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#faf8ef')
          this.gfx = this.add.graphics()

          this.add.text(PAD, 14, '2048', {
            fontSize: '42px', color: '#776e65', fontFamily: 'Arial', fontStyle: 'bold',
          })

          // Score boxes
          const sx = W - PAD - 228, sy = 26
          this.add.rectangle(sx, sy, 108, 48, 0xbbada0).setOrigin(0, 0.5)
          this.add.text(sx + 54, sy - 10, 'SCORE', {
            fontSize: '11px', color: '#eee4da', fontFamily: 'Arial', fontStyle: 'bold',
          }).setOrigin(0.5)
          this.scoreText = this.add.text(sx + 54, sy + 8, '0', {
            fontSize: '18px', color: '#fff', fontFamily: 'Arial', fontStyle: 'bold',
          }).setOrigin(0.5)

          const bx = W - PAD - 110, by = 26
          this.add.rectangle(bx, by, 108, 48, 0xbbada0).setOrigin(0, 0.5)
          this.add.text(bx + 54, by - 10, 'BEST', {
            fontSize: '11px', color: '#eee4da', fontFamily: 'Arial', fontStyle: 'bold',
          }).setOrigin(0.5)
          this.bestText = this.add.text(bx + 54, by + 8, '0', {
            fontSize: '18px', color: '#fff', fontFamily: 'Arial', fontStyle: 'bold',
          }).setOrigin(0.5)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('2048', 'Swipe or arrow keys\nto merge tiles. Reach 2048!')

          // Keyboard
          this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
            const map: Record<string, [number, number]> = {
              ArrowLeft: [0, -1], ArrowRight: [0, 1],
              ArrowUp: [-1, 0], ArrowDown: [1, 0],
            }
            if (map[e.key]) { this.doMove(...map[e.key]); e.preventDefault() }
          })

          // Touch
          let tx = 0, ty = 0
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { tx = p.x; ty = p.y })
          this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
            const dx = p.x - tx, dy = p.y - ty
            if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return
            if (Math.abs(dx) > Math.abs(dy)) this.doMove(0, dx > 0 ? 1 : -1)
            else this.doMove(dy > 0 ? 1 : -1, 0)
          })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 310, 210, 0xbbada0, 0.95).setStrokeStyle(3, 0x8f7a66)
          const t = this.add.text(0, -70, title, {
            fontSize: '44px', color: '#f9f6f2', fontFamily: 'Arial', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, -10, sub, {
            fontSize: '14px', color: '#f9f6f2', fontFamily: 'Arial',
            align: 'center', wordWrap: { width: 290 },
          }).setOrigin(0.5)
          const btn = this.add.text(0, 65, '[ NEW GAME ]', {
            fontSize: '19px', color: '#fff', fontFamily: 'Arial', fontStyle: 'bold',
            backgroundColor: '#8f7a66', padding: { x: 16, y: 9 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          this.overlay.add([bg, t, s, btn])
          this.overlay.setVisible(true)
        }

        startGame() {
          this.grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
          this.score = 0
          this.won = false
          this.addTile()
          this.addTile()
          this.overlay.setVisible(false)
          this.redraw()
        }

        addTile() {
          const empty: [number, number][] = []
          this.grid.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]) }))
          if (!empty.length) return
          const [r, c] = empty[Math.floor(Math.random() * empty.length)]
          this.grid[r][c] = Math.random() < 0.9 ? 2 : 4
        }

        doMove(dr: number, dc: number) {
          if (this.overlay.visible) return
          const prev = JSON.stringify(this.grid)
          const next: Grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
          let gained = 0

          for (let i = 0; i < SIZE; i++) {
            // Extract line
            let line: number[]
            if (dc !== 0) line = this.grid[i].filter(v => v > 0)
            else line = this.grid.map(row => row[i]).filter(v => v > 0)

            if (dr > 0 || dc > 0) line.reverse()

            // Merge
            for (let j = 0; j < line.length - 1; j++) {
              if (line[j] === line[j + 1]) {
                line[j] *= 2; gained += line[j]; line.splice(j + 1, 1)
              }
            }
            while (line.length < SIZE) line.push(0)
            if (dr > 0 || dc > 0) line.reverse()

            if (dc !== 0) next[i] = line
            else line.forEach((v, r) => { next[r][i] = v })
          }

          this.grid = next
          if (JSON.stringify(this.grid) !== prev) {
            this.score += gained
            if (this.score > this.best) this.best = this.score
            this.scoreText.setText(String(this.score))
            this.bestText.setText(String(this.best))
            this.addTile()
            this.redraw()
          }

          if (!this.won && this.grid.some(row => row.some(v => v >= 2048))) {
            this.won = true
            window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
            this.showOverlay('YOU WIN! 🎉', `Score: ${this.score}`)
            return
          }
          if (this.isOver()) {
            window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
            this.showOverlay('GAME OVER', `Score: ${this.score}`)
          }
        }

        isOver(): boolean {
          for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
            if (!this.grid[r][c]) return false
            if (r + 1 < SIZE && this.grid[r][c] === this.grid[r + 1][c]) return false
            if (c + 1 < SIZE && this.grid[r][c] === this.grid[r][c + 1]) return false
          }
          return true
        }

        redraw() {
          this.tileTexts.forEach(t => t.destroy())
          this.tileTexts = []
          const g = this.gfx
          g.clear()

          const BY = 60
          g.fillStyle(0xbbada0)
          g.fillRoundedRect(PAD, BY, BOARD_SIZE + GAP, BOARD_SIZE + GAP, 8)

          for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
              const x = PAD + GAP / 2 + c * (TILE + GAP)
              const y = BY + GAP / 2 + r * (TILE + GAP)
              const val = this.grid[r][c]
              const key = Math.min(val, 2048)
              const col = TILE_COLORS[key] ?? TILE_COLORS[2048]
              g.fillStyle(col.bg)
              g.fillRoundedRect(x, y, TILE, TILE, 6)
              if (val > 0) {
                const fs = val >= 1024 ? 26 : val >= 128 ? 32 : 40
                const t = this.add.text(x + TILE / 2, y + TILE / 2, String(val), {
                  fontSize: `${fs}px`, color: col.fg,
                  fontFamily: 'Arial', fontStyle: 'bold',
                }).setOrigin(0.5).setDepth(1)
                this.tileTexts.push(t)
              }
            }
          }
        }
      }

      const config: import('phaser').Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: W,
        height: H,
        parent: containerRef.current,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [GameScene],
      }

      gameRef.current = new Phaser.Game(config)
    }

    init()
    return () => {
      isMounted = false
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
