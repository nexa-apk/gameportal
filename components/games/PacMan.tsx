'use client'
import { useEffect, useRef } from 'react'

const COLS = 19, ROWS = 21, CELL = 18
const W = COLS * CELL, H = ROWS * CELL + 44

// 0=dot 1=wall 2=power 3=ghost-spawn 4=ghost-house-empty
const MAZE_TPL: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1],
  [1,2,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,2,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,0,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,0,1,0,0,0,1,0,1,1,0,1,1,1],
  [1,1,1,0,1,4,0,4,0,1,0,4,0,4,1,0,1,1,1],
  [0,0,0,0,1,4,3,4,0,0,0,4,3,4,1,0,0,0,0],
  [1,1,1,0,1,4,0,4,0,1,0,4,0,4,1,0,1,1,1],
  [1,1,1,0,1,1,0,1,0,0,0,1,0,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,0,1,0,0,0,1,0,1,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
  [1,2,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,2,1],
  [1,0,1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

type Ghost = { col: number; row: number; px: number; py: number; dx: number; dy: number; frightened: boolean; color: number; moving: boolean }

function isWalkable(maze: number[][], col: number, row: number): boolean {
  if (row < 0 || row >= ROWS) return false
  if (col < 0 || col >= COLS) return false
  const v = maze[row][col]
  return v !== 1
}

function isGhostWalkable(maze: number[][], col: number, row: number): boolean {
  if (row < 0 || row >= ROWS) return false
  if (col < 0 || col >= COLS) return false
  return maze[row][col] !== 1
}

export default function PacMan() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private maze: number[][] = []
        private totalDots = 0
        private dotsEaten = 0
        private score = 0
        private lives = 3
        private running = false
        // pac
        private px = 0; private py = 0
        private pcol = 9; private prow = 19
        private pdx = 0; private pdy = 0
        private ndx = -1; private ndy = 0
        private pSpeed = 90
        private mouthAngle = 0; private mouthOpen = true; private mouthTimer = 0
        // ghosts
        private ghosts: Ghost[] = []
        private frightenTimer = 0
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private livesText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#000')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(10, H - 36, 'Score: 0', { fontSize: '14px', color: '#fff', fontFamily: 'monospace' }).setDepth(2)
          this.livesText = this.add.text(W - 10, H - 36, '♥♥♥', { fontSize: '14px', color: '#f00', fontFamily: 'monospace' }).setOrigin(1, 0).setDepth(2)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('PAC-MAN', 'Arrow keys / swipe to move')

          this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
            if (!this.running) { this.startGame(); return }
            if (e.key === 'ArrowLeft') { this.ndx = -1; this.ndy = 0 }
            if (e.key === 'ArrowRight') { this.ndx = 1; this.ndy = 0 }
            if (e.key === 'ArrowUp') { this.ndx = 0; this.ndy = -1 }
            if (e.key === 'ArrowDown') { this.ndx = 0; this.ndy = 1 }
            e.preventDefault()
          })

          let sx = 0, sy = 0
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { sx = p.x; sy = p.y })
          this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
            if (!this.running) { this.startGame(); return }
            const dx = p.x - sx, dy = p.y - sy
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return
            if (Math.abs(dx) > Math.abs(dy)) { this.ndx = dx > 0 ? 1 : -1; this.ndy = 0 }
            else { this.ndx = 0; this.ndy = dy > 0 ? 1 : -1 }
          })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 280, 160, 0x000000, 0.92).setStrokeStyle(2, 0xffff00)
          const t = this.add.text(0, -50, title, { fontSize: '28px', color: '#ffff00', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -10, sub, { fontSize: '12px', color: '#aaa', fontFamily: 'monospace', align: 'center', wordWrap: { width: 260 } }).setOrigin(0.5)
          const btn = this.add.text(0, 45, '[ PLAY ]', { fontSize: '20px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#ffff00', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          this.overlay.add([bg, t, s, btn])
          this.overlay.setVisible(true)
        }

        startGame() {
          this.maze = MAZE_TPL.map(r => [...r])
          this.totalDots = 0
          this.dotsEaten = 0
          for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (this.maze[r][c] === 0 || this.maze[r][c] === 2) this.totalDots++
          this.score = 0
          this.lives = 3
          this.running = true
          this.overlay.setVisible(false)
          this.spawnPac()
          this.spawnGhosts()
          this.scoreText.setText('Score: 0')
          this.livesText.setText('♥♥♥')
        }

        spawnPac() {
          this.pcol = 9; this.prow = 19
          this.px = this.pcol * CELL + CELL / 2
          this.py = this.prow * CELL + CELL / 2
          this.pdx = 0; this.pdy = 0
          this.ndx = -1; this.ndy = 0
        }

        spawnGhosts() {
          const ghostData = [
            { col: 6, row: 9, color: 0xff0000 },
            { col: 12, row: 9, color: 0xffb8ff },
            { col: 6, row: 9, color: 0x00ffff },
            { col: 12, row: 9, color: 0xffb852 },
          ]
          this.ghosts = ghostData.map((g, i) => ({
            col: g.col, row: g.row,
            px: g.col * CELL + CELL / 2,
            py: g.row * CELL + CELL / 2,
            dx: i % 2 === 0 ? -1 : 1, dy: 0,
            frightened: false, color: g.color, moving: true,
          }))
          this.frightenTimer = 0
        }

        update(_: number, delta: number) {
          if (!this.running) return
          const dt = delta / 1000
          if (this.frightenTimer > 0) this.frightenTimer -= delta

          this.movePac(dt)
          this.moveGhosts(dt)
          this.eatDots()
          this.checkGhostCollision()
          this.drawScene()
        }

        movePac(dt: number) {
          // Try to apply new direction
          const tryCol = this.pcol + this.ndx, tryRow = this.prow + this.ndy
          const atCenter = Math.abs(this.px - (this.pcol * CELL + CELL / 2)) < 2 &&
                           Math.abs(this.py - (this.prow * CELL + CELL / 2)) < 2
          if (atCenter && isWalkable(this.maze, tryCol, tryRow)) {
            this.pdx = this.ndx; this.pdy = this.ndy
          }

          const nextCol = this.pcol + this.pdx, nextRow = this.prow + this.pdy
          if (this.pdx !== 0 || this.pdy !== 0) {
            if (!isWalkable(this.maze, nextCol, nextRow) && atCenter) {
              this.pdx = 0; this.pdy = 0
            }
          }

          this.px += this.pdx * this.pSpeed * dt
          this.py += this.pdy * this.pSpeed * dt

          // Tunnel wrap
          if (this.py === this.prow * CELL + CELL / 2) {
            if (this.px < 0) this.px = W
            if (this.px > W) this.px = 0
          }

          const snapCol = Math.round((this.px - CELL / 2) / CELL)
          const snapRow = Math.round((this.py - CELL / 2) / CELL)
          if (snapCol !== this.pcol || snapRow !== this.prow) {
            const sc = Math.max(0, Math.min(COLS - 1, snapCol))
            const sr = Math.max(0, Math.min(ROWS - 1, snapRow))
            if (isWalkable(this.maze, sc, sr)) { this.pcol = sc; this.prow = sr }
            else {
              this.px = this.pcol * CELL + CELL / 2
              this.py = this.prow * CELL + CELL / 2
            }
          }

          // Mouth animation
          this.mouthTimer += 120
          if (this.mouthTimer > 200) { this.mouthOpen = !this.mouthOpen; this.mouthTimer = 0 }
          this.mouthAngle = this.mouthOpen ? 30 : 5
        }

        moveGhosts(dt: number) {
          for (const g of this.ghosts) {
            if (!g.moving) continue
            const speed = g.frightened ? 45 : 70
            g.px += g.dx * speed * dt
            g.py += g.dy * speed * dt

            const snapCol = Math.round((g.px - CELL / 2) / CELL)
            const snapRow = Math.round((g.py - CELL / 2) / CELL)
            if (snapCol !== g.col || snapRow !== g.row) {
              const sc = Math.max(0, Math.min(COLS - 1, snapCol))
              const sr = Math.max(0, Math.min(ROWS - 1, snapRow))
              if (isGhostWalkable(this.maze, sc, sr)) { g.col = sc; g.row = sr }
              this.chooseGhostDir(g)
            }
          }
        }

        chooseGhostDir(g: Ghost) {
          const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }]
          const valid = dirs.filter(d => {
            if (d.dx === -g.dx && d.dy === -g.dy) return false
            return isGhostWalkable(this.maze, g.col + d.dx, g.row + d.dy)
          })
          if (!valid.length) { g.dx = -g.dx; g.dy = -g.dy; return }
          if (g.frightened || Math.random() < 0.35) {
            const pick = valid[Math.floor(Math.random() * valid.length)]
            g.dx = pick.dx; g.dy = pick.dy
          } else {
            // Chase pac
            let best = Infinity, pick = valid[0]
            for (const d of valid) {
              const tc = g.col + d.dx, tr = g.row + d.dy
              const dist = Math.abs(tc - this.pcol) + Math.abs(tr - this.prow)
              if (dist < best) { best = dist; pick = d }
            }
            g.dx = pick.dx; g.dy = pick.dy
          }
        }

        eatDots() {
          const v = this.maze[this.prow]?.[this.pcol]
          if (v === 0) { this.maze[this.prow][this.pcol] = 4; this.score += 10; this.dotsEaten++ }
          if (v === 2) {
            this.maze[this.prow][this.pcol] = 4
            this.score += 50; this.dotsEaten++
            this.frightenTimer = 6000
            this.ghosts.forEach(g => { g.frightened = true })
          }
          if (this.frightenTimer <= 0) this.ghosts.forEach(g => { g.frightened = false })
          this.scoreText.setText(`Score: ${this.score}`)
          if (this.dotsEaten >= this.totalDots) this.winGame()
        }

        checkGhostCollision() {
          for (const g of this.ghosts) {
            const dist = Math.hypot(g.px - this.px, g.py - this.py)
            if (dist < CELL * 0.75) {
              if (g.frightened) { g.frightened = false; this.score += 200; g.col = 6; g.row = 9; g.px = 6 * CELL + CELL / 2; g.py = 9 * CELL + CELL / 2 }
              else { this.loseLife() }
            }
          }
        }

        loseLife() {
          this.lives--
          this.livesText.setText('♥'.repeat(Math.max(0, this.lives)))
          if (this.lives <= 0) { this.running = false; this.showOverlay('GAME OVER', `Score: ${this.score}`); return }
          this.spawnPac()
        }

        winGame() {
          this.running = false
          this.showOverlay('YOU WIN! 🎉', `Score: ${this.score}`)
        }

        drawScene() {
          const g = this.gfx
          g.clear()
          // Maze
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const v = this.maze[r][c]
              const x = c * CELL, y = r * CELL
              if (v === 1) { g.fillStyle(0x0000aa); g.fillRect(x + 1, y + 1, CELL - 2, CELL - 2) }
              else if (v === 0) { g.fillStyle(0xffffff); g.fillCircle(x + CELL / 2, y + CELL / 2, 2) }
              else if (v === 2) { g.fillStyle(0xffffff); g.fillCircle(x + CELL / 2, y + CELL / 2, 5) }
            }
          }
          // Ghosts
          for (const gh of this.ghosts) {
            g.fillStyle(gh.frightened ? 0x0000ff : gh.color)
            g.fillCircle(gh.px, gh.py, CELL / 2 - 1)
            g.fillRect(gh.px - CELL / 2 + 1, gh.py, CELL - 2, CELL / 2 - 1)
            // Eyes
            if (!gh.frightened) {
              g.fillStyle(0xffffff); g.fillCircle(gh.px - 3, gh.py - 2, 3); g.fillCircle(gh.px + 3, gh.py - 2, 3)
              g.fillStyle(0x0000ff); g.fillCircle(gh.px - 2, gh.py - 2, 1); g.fillCircle(gh.px + 4, gh.py - 2, 1)
            }
          }
          // Pac-Man
          const angle = Math.atan2(this.pdy, this.pdx !== 0 || this.pdy !== 0 ? this.pdx : -1)
          const startA = angle + Phaser.Math.DegToRad(this.mouthAngle)
          const endA = angle - Phaser.Math.DegToRad(this.mouthAngle)
          g.fillStyle(0xffff00)
          g.slice(this.px, this.py, CELL / 2 - 1, startA, endA, false)
          g.fillPath()
          // HUD bg
          g.fillStyle(0x000000); g.fillRect(0, H - 44, W, 44)
        }
      }

      const config: import('phaser').Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: W, height: H,
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
