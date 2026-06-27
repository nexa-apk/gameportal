'use client'

import { useEffect, useRef } from 'react'

const COLS = 10
const ROWS = 20
const BLOCK = 30
const W = COLS * BLOCK
const H = ROWS * BLOCK

const PIECES = [
  { shape: [[1,1,1,1]], color: 0x06b6d4 },        // I
  { shape: [[1,1],[1,1]], color: 0xfbbf24 },         // O
  { shape: [[0,1,0],[1,1,1]], color: 0xa855f7 },     // T
  { shape: [[0,1,1],[1,1,0]], color: 0x22c55e },     // S
  { shape: [[1,1,0],[0,1,1]], color: 0xef4444 },     // Z
  { shape: [[1,0,0],[1,1,1]], color: 0x3b82f6 },     // J
  { shape: [[0,0,1],[1,1,1]], color: 0xf97316 },     // L
]

type Piece = { shape: number[][]; color: number; x: number; y: number }

export default function Tetris() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private board: (number | null)[][] = []
        private current!: Piece
        private next!: Piece
        private graphics!: Phaser.GameObjects.Graphics
        private previewGfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private levelText!: Phaser.GameObjects.Text
        private linesText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private score = 0
        private level = 1
        private lines = 0
        private dropTimer = 0
        private dropInterval = 800
        private running = false
        private lastKey = 0
        private PANEL = 120

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#0f0f1a')
          this.graphics = this.add.graphics()
          this.previewGfx = this.add.graphics()

          // Side panel
          const px = W + 10
          this.add.text(px, 20, 'NEXT', { fontSize: '14px', color: '#888', fontFamily: 'monospace' })
          this.scoreText = this.add.text(px, 160, 'SCORE\n0', {
            fontSize: '14px', color: '#fff', fontFamily: 'monospace', align: 'left',
          })
          this.levelText = this.add.text(px, 230, 'LEVEL\n1', {
            fontSize: '14px', color: '#fff', fontFamily: 'monospace',
          })
          this.linesText = this.add.text(px, 300, 'LINES\n0', {
            fontSize: '14px', color: '#fff', fontFamily: 'monospace',
          })

          this.overlay = this.add.container((W + this.PANEL) / 2, H / 2)
          this.showStartOverlay('TETRIS', '← → move  ↑ rotate  ↓ drop')

          this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
            if (!this.running) { this.startGame(); return }
            const now = Date.now()
            switch (e.key) {
              case 'ArrowLeft': this.move(-1); break
              case 'ArrowRight': this.move(1); break
              case 'ArrowDown': this.softDrop(); break
              case 'ArrowUp': case 'x': case 'X': this.rotate(); break
              case ' ': this.hardDrop(); break
            }
            if (now - this.lastKey > 50) this.lastKey = now
            e.preventDefault()
          })

          let tx = 0, ty = 0
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { tx = p.x; ty = p.y })
          this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
            if (!this.running) { this.startGame(); return }
            const dx = p.x - tx, dy = p.y - ty
            if (Math.abs(dx) < 15 && Math.abs(dy) < 15) { this.rotate(); return }
            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0) this.move(1); else this.move(-1)
            } else {
              if (dy > 0) this.hardDrop()
            }
          })
        }

        showStartOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 260, 190, 0x000000, 0.9).setStrokeStyle(2, 0x06b6d4)
          const t = this.add.text(0, -60, title, {
            fontSize: '32px', color: '#06b6d4', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, -10, sub, {
            fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace',
            wordWrap: { width: 240 }, align: 'center',
          }).setOrigin(0.5)
          const btn = this.add.text(0, 55, '[ PLAY ]', {
            fontSize: '20px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#06b6d4', padding: { x: 14, y: 8 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          this.overlay.add([bg, t, s, btn])
          this.overlay.setVisible(true)
        }

        startGame() {
          this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
          this.score = 0; this.level = 1; this.lines = 0; this.dropInterval = 800
          this.running = true
          this.overlay.setVisible(false)
          this.current = this.spawnPiece()
          this.next = this.spawnPiece()
          this.updateHUD()
        }

        spawnPiece(): Piece {
          const p = PIECES[Math.floor(Math.random() * PIECES.length)]
          return { shape: p.shape.map(r => [...r]), color: p.color, x: Math.floor(COLS / 2) - 1, y: 0 }
        }

        move(dx: number) {
          this.current.x += dx
          if (this.collides()) this.current.x -= dx
        }

        rotate() {
          const orig = this.current.shape
          const rows = orig.length, cols = orig[0].length
          const rotated = Array.from({ length: cols }, (_, c) =>
            Array.from({ length: rows }, (_, r) => orig[rows - 1 - r][c])
          )
          const prev = this.current.shape
          this.current.shape = rotated
          if (this.collides()) {
            // wall kick
            this.current.x -= 1
            if (this.collides()) {
              this.current.x += 2
              if (this.collides()) {
                this.current.x -= 1
                this.current.shape = prev
              }
            }
          }
        }

        softDrop() {
          this.current.y++
          if (this.collides()) {
            this.current.y--
            this.lock()
          }
          this.dropTimer = 0
        }

        hardDrop() {
          while (!this.collides()) this.current.y++
          this.current.y--
          this.lock()
        }

        collides(piece?: Piece): boolean {
          const p = piece ?? this.current
          return p.shape.some((row, r) =>
            row.some((cell, c) => {
              if (!cell) return false
              const nx = p.x + c, ny = p.y + r
              return nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && this.board[ny][nx] !== null)
            })
          )
        }

        lock() {
          this.current.shape.forEach((row, r) =>
            row.forEach((cell, c) => {
              if (cell) {
                const ny = this.current.y + r
                if (ny >= 0) this.board[ny][this.current.x + c] = this.current.color
              }
            })
          )
          this.clearLines()
          this.current = this.next
          this.next = this.spawnPiece()
          if (this.collides()) { this.endGame(); return }
        }

        clearLines() {
          let cleared = 0
          for (let r = ROWS - 1; r >= 0; r--) {
            if (this.board[r].every(c => c !== null)) {
              this.board.splice(r, 1)
              this.board.unshift(Array(COLS).fill(null))
              cleared++; r++
            }
          }
          if (cleared) {
            const pts = [0, 100, 300, 500, 800][cleared] * this.level
            this.score += pts
            this.lines += cleared
            this.level = Math.floor(this.lines / 10) + 1
            this.dropInterval = Math.max(80, 800 - (this.level - 1) * 70)
            this.updateHUD()
          }
        }

        updateHUD() {
          this.scoreText.setText(`SCORE\n${this.score}`)
          this.levelText.setText(`LEVEL\n${this.level}`)
          this.linesText.setText(`LINES\n${this.lines}`)
        }

        endGame() {
          this.running = false
          this.showStartOverlay('GAME OVER', `Score: ${this.score}  Level: ${this.level}`)
        }

        update(_: number, delta: number) {
          if (!this.running) return
          this.dropTimer += delta
          if (this.dropTimer >= this.dropInterval) {
            this.dropTimer = 0
            this.current.y++
            if (this.collides()) { this.current.y--; this.lock() }
          }
          this.drawBoard()
          this.drawPreview()
        }

        drawBoard() {
          const g = this.graphics
          g.clear()
          // Board bg
          g.fillStyle(0x0a0a14)
          g.fillRect(0, 0, W, H)
          // Grid lines
          g.lineStyle(1, 0x1e1e2e, 1)
          for (let c = 0; c <= COLS; c++) { g.lineBetween(c * BLOCK, 0, c * BLOCK, H) }
          for (let r = 0; r <= ROWS; r++) { g.lineBetween(0, r * BLOCK, W, r * BLOCK) }
          // Locked cells
          this.board.forEach((row, r) =>
            row.forEach((color, c) => {
              if (color !== null) this.drawBlock(g, c, r, color)
            })
          )
          // Ghost piece
          const ghost = { ...this.current, shape: this.current.shape.map(r => [...r]) }
          while (!this.collides(ghost)) ghost.y++
          ghost.y--
          ghost.shape.forEach((row, r) =>
            row.forEach((cell, c) => {
              if (cell && ghost.y + r >= 0) {
                g.fillStyle(this.current.color, 0.2)
                g.fillRect((ghost.x + c) * BLOCK + 1, (ghost.y + r) * BLOCK + 1, BLOCK - 2, BLOCK - 2)
              }
            })
          )
          // Current piece
          this.current.shape.forEach((row, r) =>
            row.forEach((cell, c) => {
              if (cell && this.current.y + r >= 0) this.drawBlock(g, this.current.x + c, this.current.y + r, this.current.color)
            })
          )
          // Border
          g.lineStyle(2, 0x334155)
          g.strokeRect(0, 0, W, H)
        }

        drawBlock(g: Phaser.GameObjects.Graphics, c: number, r: number, color: number) {
          g.fillStyle(color)
          g.fillRect(c * BLOCK + 1, r * BLOCK + 1, BLOCK - 2, BLOCK - 2)
          g.fillStyle(0xffffff, 0.2)
          g.fillRect(c * BLOCK + 2, r * BLOCK + 2, BLOCK - 4, 4)
        }

        drawPreview() {
          const g = this.previewGfx
          g.clear()
          const px = W + 10
          g.fillStyle(0x1e1e2e)
          g.fillRect(px, 36, 100, 100)
          const s = 20
          const rows = this.next.shape.length
          const cols = this.next.shape[0].length
          const ox = px + (100 - cols * s) / 2
          const oy = 36 + (100 - rows * s) / 2
          this.next.shape.forEach((row, r) =>
            row.forEach((cell, c) => {
              if (cell) {
                g.fillStyle(this.next.color)
                g.fillRect(ox + c * s + 1, oy + r * s + 1, s - 2, s - 2)
              }
            })
          )
        }
      }

      const config: import('phaser').Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: W + 130,
        height: H,
        parent: containerRef.current,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
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
