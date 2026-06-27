'use client'
import { useEffect, useRef } from 'react'

const COLS = 16, ROWS = 16, MINES = 30, CELL = 28
const W = COLS * CELL, H = ROWS * CELL + 50

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; adj: number }

function buildGrid(safeCol: number, safeRow: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ mine: false, revealed: false, flagged: false, adj: 0 }))
  )
  let placed = 0
  while (placed < MINES) {
    const c = Math.floor(Math.random() * COLS), r = Math.floor(Math.random() * ROWS)
    if (!grid[r][c].mine && (Math.abs(c - safeCol) > 1 || Math.abs(r - safeRow) > 1)) {
      grid[r][c].mine = true; placed++
    }
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (grid[r][c].mine) continue
    let count = 0
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (grid[r + dr]?.[c + dc]?.mine) count++
    }
    grid[r][c].adj = count
  }
  return grid
}

function flood(grid: Cell[][], c: number, r: number) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return
  const cell = grid[r][c]
  if (cell.revealed || cell.flagged || cell.mine) return
  cell.revealed = true
  if (cell.adj === 0) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) flood(grid, c + dc, r + dr)
  }
}

const ADJ_COLORS = ['', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b91c1c', '#0891b2', '#000', '#555']

export default function Minesweeper() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private grid: Cell[][] = []
        private started = false
        private state: 'idle' | 'playing' | 'won' | 'lost' = 'idle'
        private flagCount = 0
        private gfx!: Phaser.GameObjects.Graphics
        private overlay!: Phaser.GameObjects.Container
        private hud!: Phaser.GameObjects.Text
        private elapsed = 0

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#1e293b')
          this.gfx = this.add.graphics()
          this.hud = this.add.text(10, H - 42, `Mines: ${MINES}  Flags: 0  Time: 0`, { fontSize: '13px', color: '#fff', fontFamily: 'monospace' }).setDepth(2)
          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('MINESWEEPER', 'Left click = reveal\nRight click = flag\nFirst click is always safe')

          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (this.state === 'won' || this.state === 'lost') { this.startGame(); return }
            if (this.state === 'idle') { this.startGame(); return }
            const c = Math.floor(p.x / CELL), r = Math.floor(p.y / CELL)
            if (r >= ROWS || c >= COLS || c < 0 || r < 0) return
            if (p.rightButtonDown() || p.button === 2) { this.toggleFlag(c, r); return }
            this.reveal(c, r)
          })

          this.input.mouse?.disableContextMenu()
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 320, 190, 0x0f172a, 0.95).setStrokeStyle(2, 0x3b82f6)
          const t = this.add.text(0, -60, title, { fontSize: '24px', color: '#60a5fa', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -15, sub, { fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', align: 'center', wordWrap: { width: 300 } }).setOrigin(0.5)
          const btn = this.add.text(0, 55, '[ PLAY ]', { fontSize: '20px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#2563eb', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          this.overlay.add([bg, t, s, btn]); this.overlay.setVisible(true)
        }

        startGame() {
          this.grid = []; this.started = false; this.state = 'playing'; this.flagCount = 0; this.elapsed = 0
          this.overlay.setVisible(false)
        }

        toggleFlag(c: number, r: number) {
          const cell = this.grid[r]?.[c]
          if (!cell || cell.revealed) return
          cell.flagged = !cell.flagged
          this.flagCount += cell.flagged ? 1 : -1
          this.updateHud()
        }

        reveal(c: number, r: number) {
          if (!this.grid.length) this.grid = buildGrid(c, r)
          const cell = this.grid[r]?.[c]
          if (!cell || cell.revealed || cell.flagged) return
          if (cell.mine) { cell.revealed = true; this.state = 'lost'; this.revealAll(); window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: 0 } })); this.showOverlay('BOOM! 💥', `You hit a mine! Flags: ${this.flagCount}`); return }
          flood(this.grid, c, r)
          this.checkWin()
        }

        revealAll() { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (this.grid[r][c].mine) this.grid[r][c].revealed = true }

        checkWin() {
          let hidden = 0
          for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!this.grid[r][c].revealed) hidden++
          if (hidden === MINES) { this.state = 'won'; window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: Math.round(10000 / Math.max(1, this.elapsed)) } })); this.showOverlay('YOU WIN! 🎉', `Cleared in ${Math.round(this.elapsed)}s`) }
          this.updateHud()
        }

        updateHud() { this.hud.setText(`Mines: ${MINES - this.flagCount}  Flags: ${this.flagCount}  Time: ${Math.round(this.elapsed)}s`) }

        update(_: number, delta: number) {
          if (this.state === 'playing') this.elapsed += delta / 1000
          this.draw()
        }

        draw() {
          const g = this.gfx; g.clear()
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const cell = this.grid[r]?.[c]
              const x = c * CELL, y = r * CELL
              if (!cell || !cell.revealed) {
                g.fillStyle(0x475569); g.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
                g.fillStyle(0x94a3b8); g.fillRect(x + 1, y + 1, CELL - 2, 3)
                g.fillRect(x + 1, y + 1, 3, CELL - 2)
                if (cell?.flagged) { this.drawFlag(g, x + CELL / 2, y + CELL / 2) }
              } else if (cell.mine) {
                g.fillStyle(0xff0000); g.fillCircle(x + CELL / 2, y + CELL / 2, CELL / 2 - 4)
              } else {
                g.fillStyle(0x1e293b); g.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
                if (cell.adj > 0) {
                  this.add.text(x + CELL / 2, y + CELL / 2, String(cell.adj), { fontSize: '14px', color: ADJ_COLORS[cell.adj], fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1)
                    .setName(`${c}_${r}`)
                }
              }
            }
          }
        }

        drawFlag(g: Phaser.GameObjects.Graphics, x: number, y: number) {
          g.fillStyle(0xff4444); g.fillTriangle(x - 2, y - 8, x - 2, y, x + 8, y - 4)
          g.lineStyle(2, 0xffdd00); g.lineBetween(x - 2, y - 8, x - 2, y + 6)
        }
      }

      const config: import('phaser').Types.Core.GameConfig = {
        type: Phaser.AUTO, width: W, height: H,
        parent: containerRef.current,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [GameScene],
      }
      gameRef.current = new Phaser.Game(config)
    }
    init()
    return () => { isMounted = false; gameRef.current?.destroy(true); gameRef.current = null }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
