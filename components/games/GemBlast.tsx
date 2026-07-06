'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const COLS = 8, ROWS = 8
const CELL = 40
const GRID_X = (W - COLS * CELL) / 2   // = 20
const GRID_Y = 62
const GEM_R = 15

const GEM_COLORS = [
  0xe74c3c,  // red
  0xe67e22,  // orange
  0x2ecc71,  // green
  0x3498db,  // blue
  0x9b59b6,  // purple
  0xf1c40f,  // yellow
]

type GameState = 'overlay' | 'idle' | 'swapping' | 'flashing' | 'settling' | 'gameover'

export default function GemBlast() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private grid: number[][] = []      // color index 0-5, or -1 for empty; populated in create()
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private movesText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        private score = 0
        private bestScore = 0
        private movesLeft = 20
        private combo = 0
        private gameState: GameState = 'overlay'

        // Selection
        private selR = -1
        private selC = -1

        // Swap animation
        private swapR1 = 0; private swapC1 = 0
        private swapR2 = 0; private swapC2 = 0
        private swapCol1 = 0; private swapCol2 = 0
        private swapValid = false
        private swapT = 0
        private readonly SWAP_DUR = 180

        // Flash animation (matched gems fading out)
        private flashCells: Set<string> = new Set()
        private flashT = 0
        private readonly FLASH_DUR = 160

        // Settle pause after gravity
        private settleT = 0
        private readonly SETTLE_DUR = 150

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#0a0a1a')
          // grid must be initialized before update()/draw() fire on the first frame
          this.grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(-1))
          this.gfx = this.add.graphics()

          this.scoreText = this.add.text(14, 14, 'Score: 0', {
            fontSize: '14px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(2)
          this.movesText = this.add.text(W - 14, 14, 'Moves: 20', {
            fontSize: '14px', color: '#f1c40f', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(2)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('GEM BLAST', 'Click a gem, then click an\nadjacent gem to swap.\nMatch 3+ in a row or column!')

          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.handleClick(p.x, p.y))
        }

        showOverlay(title: string, sub: string) {
          this.gameState = 'overlay'
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 260 : 220
          const bg = this.add.rectangle(0, 0, 310, bh, 0x0a0a1a, 0.95).setStrokeStyle(2, 0xa855f7)
          const ty = hasScore ? -105 : -85
          const t = this.add.text(0, ty, title, {
            fontSize: '28px', color: '#a855f7', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 52, sub, {
            fontSize: '12px', color: '#cccccc', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 275 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 22, `Score: ${this.score}`, {
                fontSize: '17px', color: '#f1c40f', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 50, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#888888', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 100 : 68
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#000000', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#a855f7', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.score = 0; this.movesLeft = 20; this.combo = 0
          this.selR = -1; this.selC = -1
          this.flashCells.clear()
          this.grid = Array.from({ length: ROWS }, () =>
            Array.from({ length: COLS }, () => Math.floor(Math.random() * GEM_COLORS.length))
          )
          // Clear any starting matches so the board begins clean
          for (let pass = 0; pass < 8; pass++) {
            const m = this.findMatchedCells()
            if (m.size === 0) break
            for (const key of m) {
              const [r, c] = key.split(',').map(Number)
              this.grid[r][c] = Math.floor(Math.random() * GEM_COLORS.length)
            }
          }
          this.overlay.setVisible(false)
          this.gameState = 'idle'
          this.updateHud()
        }

        cellXY(r: number, c: number) {
          return { x: GRID_X + c * CELL + CELL / 2, y: GRID_Y + r * CELL + CELL / 2 }
        }

        findMatchedCells(): Set<string> {
          const matched = new Set<string>()
          // Horizontal runs
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c <= COLS - 3; c++) {
              const col = this.grid[r][c]
              if (col < 0) continue
              let len = 1
              while (c + len < COLS && this.grid[r][c + len] === col) len++
              if (len >= 3) for (let i = 0; i < len; i++) matched.add(`${r},${c + i}`)
            }
          }
          // Vertical runs
          for (let c = 0; c < COLS; c++) {
            for (let r = 0; r <= ROWS - 3; r++) {
              const col = this.grid[r][c]
              if (col < 0) continue
              let len = 1
              while (r + len < ROWS && this.grid[r + len][c] === col) len++
              if (len >= 3) for (let i = 0; i < len; i++) matched.add(`${r + i},${c}`)
            }
          }
          return matched
        }

        scoreForMatchSize(n: number): number {
          if (n >= 5) return 100
          if (n === 4) return 60
          return 30
        }

        handleClick(px: number, py: number) {
          if (this.gameState !== 'idle') return
          const c = Math.floor((px - GRID_X) / CELL)
          const r = Math.floor((py - GRID_Y) / CELL)

          if (r < 0 || r >= ROWS || c < 0 || c >= COLS) {
            this.selR = -1; this.selC = -1; return
          }
          if (this.selR < 0) {
            this.selR = r; this.selC = c; return
          }
          if (r === this.selR && c === this.selC) {
            this.selR = -1; this.selC = -1; return
          }
          const dr = Math.abs(r - this.selR)
          const dc = Math.abs(c - this.selC)
          if (dr + dc !== 1) {
            // Not adjacent — reselect
            this.selR = r; this.selC = c; return
          }
          this.doSwap(this.selR, this.selC, r, c)
          this.selR = -1; this.selC = -1
        }

        doSwap(r1: number, c1: number, r2: number, c2: number) {
          this.swapCol1 = this.grid[r1][c1]
          this.swapCol2 = this.grid[r2][c2]
          // Tentative swap to check validity
          this.grid[r1][c1] = this.swapCol2
          this.grid[r2][c2] = this.swapCol1
          this.swapValid = this.findMatchedCells().size > 0
          if (!this.swapValid) {
            // Revert — animate as a nudge
            this.grid[r1][c1] = this.swapCol1
            this.grid[r2][c2] = this.swapCol2
          }
          this.swapR1 = r1; this.swapC1 = c1
          this.swapR2 = r2; this.swapC2 = c2
          this.swapT = 0
          this.gameState = 'swapping'
        }

        beginFlash() {
          const matched = this.findMatchedCells()
          if (matched.size === 0) {
            this.combo = 0
            if (this.movesLeft <= 0) {
              this.endGame()
            } else {
              this.gameState = 'idle'
            }
            return
          }
          const comboMult = 1 + this.combo * 0.5
          this.score += Math.round(this.scoreForMatchSize(matched.size) * comboMult)
          this.combo++
          this.updateHud()
          this.flashCells = matched
          this.flashT = 0
          this.gameState = 'flashing'
        }

        applyGravityAndRefill() {
          for (const key of this.flashCells) {
            const [r, c] = key.split(',').map(Number)
            this.grid[r][c] = -1
          }
          this.flashCells.clear()
          for (let c = 0; c < COLS; c++) {
            let writeR = ROWS - 1
            for (let r = ROWS - 1; r >= 0; r--) {
              if (this.grid[r][c] >= 0) {
                this.grid[writeR][c] = this.grid[r][c]
                if (r !== writeR) this.grid[r][c] = -1
                writeR--
              }
            }
            for (let r = writeR; r >= 0; r--) {
              this.grid[r][c] = Math.floor(Math.random() * GEM_COLORS.length)
            }
          }
          this.settleT = 0
          this.gameState = 'settling'
        }

        endGame() {
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('GAME OVER', 'No moves remaining!')
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          this.movesText.setText(`Moves: ${this.movesLeft}`)
          this.movesText.setColor(this.movesLeft <= 5 ? '#ff5555' : '#f1c40f')
        }

        update(_time: number, delta: number) {
          if (this.gameState === 'swapping') {
            this.swapT += delta
            if (this.swapT >= this.SWAP_DUR) {
              this.swapT = this.SWAP_DUR
              if (this.swapValid) {
                this.movesLeft--
                this.updateHud()
                this.beginFlash()
              } else {
                this.gameState = 'idle'
              }
            }
          } else if (this.gameState === 'flashing') {
            this.flashT += delta
            if (this.flashT >= this.FLASH_DUR) {
              this.applyGravityAndRefill()
            }
          } else if (this.gameState === 'settling') {
            this.settleT += delta
            if (this.settleT >= this.SETTLE_DUR) {
              this.beginFlash()  // cascade check
            }
          }
          this.draw()
        }

        drawGem(g: Phaser.GameObjects.Graphics, x: number, y: number, colorIdx: number, alpha: number) {
          if (colorIdx < 0 || alpha <= 0) return
          const color = GEM_COLORS[colorIdx]
          g.fillStyle(0x000000, 0.22 * alpha)
          g.fillCircle(x + 2, y + 2, GEM_R)
          g.fillStyle(color, alpha)
          g.fillCircle(x, y, GEM_R)
          // Inner highlight
          g.fillStyle(0xffffff, 0.28 * alpha)
          g.fillCircle(x - GEM_R * 0.28, y - GEM_R * 0.32, GEM_R * 0.38)
          // Tiny top glint
          g.fillStyle(0xffffff, 0.55 * alpha)
          g.fillCircle(x - GEM_R * 0.1, y - GEM_R * 0.55, GEM_R * 0.18)
        }

        draw() {
          const g = this.gfx
          g.clear()

          // HUD bar
          g.fillStyle(0x0a0a1a, 1)
          g.fillRect(0, 0, W, GRID_Y - 4)
          g.lineStyle(1, 0x2a2a4a, 1)
          g.lineBetween(0, GRID_Y - 4, W, GRID_Y - 4)

          // Checkerboard grid background
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const { x, y } = this.cellXY(r, c)
              g.fillStyle((r + c) % 2 === 0 ? 0x111128 : 0x0e0e22, 1)
              g.fillRect(x - CELL / 2, y - CELL / 2, CELL, CELL)
            }
          }

          const easeOut = (t: number) => 1 - (1 - Math.min(1, t)) ** 2

          if (this.gameState === 'swapping') {
            const t = easeOut(this.swapT / this.SWAP_DUR)
            const { x: x1, y: y1 } = this.cellXY(this.swapR1, this.swapC1)
            const { x: x2, y: y2 } = this.cellXY(this.swapR2, this.swapC2)

            // Draw all non-swapping gems first
            for (let r = 0; r < ROWS; r++) {
              for (let c = 0; c < COLS; c++) {
                if ((r === this.swapR1 && c === this.swapC1) || (r === this.swapR2 && c === this.swapC2)) continue
                const { x, y } = this.cellXY(r, c)
                this.drawGem(g, x, y, this.grid[r][c], 1)
              }
            }
            // Animate the two swapping gems
            if (this.swapValid) {
              this.drawGem(g, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, this.swapCol1, 1)
              this.drawGem(g, x2 + (x1 - x2) * t, y2 + (y1 - y2) * t, this.swapCol2, 1)
            } else {
              // Nudge toward each other and spring back
              const bounce = Math.sin(t * Math.PI) * 0.32
              this.drawGem(g, x1 + (x2 - x1) * bounce, y1 + (y2 - y1) * bounce, this.swapCol1, 1)
              this.drawGem(g, x2 + (x1 - x2) * bounce, y2 + (y1 - y2) * bounce, this.swapCol2, 1)
            }
          } else {
            // Normal draw — flash cells fade out
            const flashAlpha = this.gameState === 'flashing'
              ? 1 - easeOut(this.flashT / this.FLASH_DUR)
              : 1

            for (let r = 0; r < ROWS; r++) {
              for (let c = 0; c < COLS; c++) {
                if (this.grid[r][c] < 0) continue
                const { x, y } = this.cellXY(r, c)
                const isFlashing = this.flashCells.has(`${r},${c}`)
                this.drawGem(g, x, y, this.grid[r][c], isFlashing ? flashAlpha : 1)
              }
            }
          }

          // Selection ring
          if (this.gameState === 'idle' && this.selR >= 0) {
            const { x, y } = this.cellXY(this.selR, this.selC)
            g.lineStyle(3, 0xffffff, 1)
            g.strokeCircle(x, y, GEM_R + 4)
            g.lineStyle(1, 0xffffff, 0.35)
            g.strokeCircle(x, y, GEM_R + 8)
          }

          // Low-moves pulsing border
          if (this.gameState === 'idle' && this.movesLeft <= 5 && this.movesLeft > 0) {
            const pulse = (Math.sin(Date.now() / 200) * 0.5 + 0.5) * 0.6
            g.lineStyle(3, 0xff4444, pulse)
            g.strokeRect(GRID_X, GRID_Y, COLS * CELL, ROWS * CELL)
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
