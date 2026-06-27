'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 480
const BUBBLE_R = 18, COLS = 9, TOP_ROWS = 8
const COLORS = [0xff4444, 0xff9900, 0x44dd44, 0x44aaff, 0xcc44ff, 0xffdd00]

type Bubble = { col: number; row: number; color: number; active: boolean }
type Shot = { x: number; y: number; vx: number; vy: number; color: number; active: boolean }

function colRow2xy(col: number, row: number): { x: number; y: number } {
  const offset = row % 2 === 0 ? 0 : BUBBLE_R
  return { x: BUBBLE_R + col * BUBBLE_R * 2 + offset, y: 50 + row * BUBBLE_R * 1.73 }
}

function xy2colRow(x: number, y: number, row: number): number {
  const offset = row % 2 === 0 ? 0 : BUBBLE_R
  return Math.round((x - BUBBLE_R - offset) / (BUBBLE_R * 2))
}

export default function BubbleShooter() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private grid: (Bubble | null)[][] = []
        private shot: Shot | null = null
        private nextColor = 0
        private score = 0
        private running = false
        private shootCooldown = 0
        private aimAngle = -Math.PI / 2
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#0f0f2e')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(W / 2, 10, 'Score: 0', { fontSize: '16px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(2)
          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('BUBBLE SHOOTER', 'Click/tap to aim and shoot\nMatch 3+ bubbles to pop!')

          this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (!this.running) return
            const dx = p.x - W / 2, dy = p.y - (H - 40)
            this.aimAngle = Math.atan2(dy, dx)
            if (this.aimAngle > -0.15) this.aimAngle = -0.15
            if (this.aimAngle < -Math.PI + 0.15) this.aimAngle = -Math.PI + 0.15
          })
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (!this.running) { this.startGame(); return }
            const dx = p.x - W / 2, dy = p.y - (H - 40)
            this.aimAngle = Math.atan2(dy, dx)
            if (this.aimAngle > -0.15) this.aimAngle = -0.15
            if (this.aimAngle < -Math.PI + 0.15) this.aimAngle = -Math.PI + 0.15
            this.shootBubble()
          })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 300, 200, 0x0f0f2e, 0.95).setStrokeStyle(2, 0x44aaff)
          const t = this.add.text(0, -70, title, { fontSize: '20px', color: '#44aaff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -25, sub, { fontSize: '12px', color: '#aaa', fontFamily: 'monospace', align: 'center', wordWrap: { width: 280 } }).setOrigin(0.5)
          const sc = this.score > 0 ? this.add.text(0, 15, `Score: ${this.score}`, { fontSize: '16px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5) : null
          const btn = this.add.text(0, 65, '[ SHOOT! ]', { fontSize: '20px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#44aaff', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s, btn]
          if (sc) items.push(sc)
          this.overlay.add(items); this.overlay.setVisible(true)
        }

        startGame() {
          this.grid = []
          for (let r = 0; r < TOP_ROWS; r++) {
            this.grid[r] = []
            const cols = r % 2 === 0 ? COLS : COLS - 1
            for (let c = 0; c < cols; c++) {
              this.grid[r][c] = { col: c, row: r, color: COLORS[Math.floor(Math.random() * COLORS.length)], active: true }
            }
          }
          this.shot = null; this.score = 0
          this.nextColor = COLORS[Math.floor(Math.random() * COLORS.length)]
          this.running = true; this.overlay.setVisible(false)
          this.scoreText.setText('Score: 0')
        }

        shootBubble() {
          if (this.shot || this.shootCooldown > 0) return
          const speed = 600
          this.shot = { x: W / 2, y: H - 40, vx: Math.cos(this.aimAngle) * speed, vy: Math.sin(this.aimAngle) * speed, color: this.nextColor, active: true }
          this.nextColor = COLORS[Math.floor(Math.random() * COLORS.length)]
          this.shootCooldown = 300
        }

        update(_: number, delta: number) {
          if (!this.running) return
          const dt = delta / 1000
          if (this.shootCooldown > 0) this.shootCooldown -= delta

          if (this.shot) {
            this.shot.x += this.shot.vx * dt
            this.shot.y += this.shot.vy * dt
            // Wall bounce
            if (this.shot.x < BUBBLE_R) { this.shot.x = BUBBLE_R; this.shot.vx = Math.abs(this.shot.vx) }
            if (this.shot.x > W - BUBBLE_R) { this.shot.x = W - BUBBLE_R; this.shot.vx = -Math.abs(this.shot.vx) }
            // Top wall — snap
            if (this.shot.y < 50 + BUBBLE_R) { this.snapBubble(this.shot.x, 0); this.shot = null }
            else {
              // Collision with grid bubbles
              for (let r = 0; r < this.grid.length; r++) {
                if (!this.grid[r]) continue
                for (let c = 0; c < (this.grid[r]?.length ?? 0); c++) {
                  const b = this.grid[r]?.[c]
                  if (!b?.active) continue
                  const { x: bx, y: by } = colRow2xy(c, r)
                  if (Math.hypot(this.shot.x - bx, this.shot.y - by) < BUBBLE_R * 1.8) {
                    this.snapBubble(this.shot.x, r); this.shot = null; break
                  }
                }
                if (!this.shot) break
              }
            }
          }
          this.draw()
        }

        snapBubble(x: number, nearRow: number) {
          const row = Math.max(0, Math.min(TOP_ROWS + 5, Math.round(nearRow + 0.5)))
          const col = Math.max(0, Math.min(COLS - 1, xy2colRow(x, 0, row)))
          if (!this.grid[row]) this.grid[row] = []
          if (!this.grid[row][col]) {
            this.grid[row][col] = { col, row, color: this.shot?.color ?? COLORS[0], active: true }
            this.findAndPop(col, row)
          }
          // Game over if bubbles reach too low
          for (const row2 of this.grid) { if (!row2) continue; for (const b of row2) { if (b?.active && b.row > TOP_ROWS + 3) { this.running = false; this.showOverlay('GAME OVER', `Score: ${this.score}`); return } } }
        }

        findAndPop(startCol: number, startRow: number) {
          const color = this.grid[startRow]?.[startCol]?.color
          if (color === undefined) return
          const visited = new Set<string>()
          const queue: [number, number][] = [[startCol, startRow]]
          const group: [number, number][] = []
          while (queue.length) {
            const [c, r] = queue.shift()!
            const key = `${c},${r}`
            if (visited.has(key)) continue
            visited.add(key)
            const b = this.grid[r]?.[c]
            if (!b?.active || b.color !== color) continue
            group.push([c, r])
            const dirs = r % 2 === 0 ? [[1,0],[-1,0],[0,-1],[0,1],[1,-1],[-1,-1]] : [[1,0],[-1,0],[0,-1],[0,1],[1,1],[-1,1]]
            for (const [dc, dr] of dirs) queue.push([c + dc, r + dr])
          }
          if (group.length >= 3) {
            group.forEach(([c, r]) => { if (this.grid[r]?.[c]) this.grid[r][c] = null })
            this.score += group.length * 10 * group.length
            this.scoreText.setText(`Score: ${this.score}`)
          }
          // Check win
          let remaining = 0
          for (const row of this.grid) { if (!row) continue; for (const b of row) { if (b?.active) remaining++ } }
          if (remaining === 0) { this.running = false; this.showOverlay('YOU WIN! 🎉', `Score: ${this.score}`) }
        }

        draw() {
          const g = this.gfx; g.clear()
          // Draw grid
          for (let r = 0; r < this.grid.length; r++) {
            const row = this.grid[r]; if (!row) continue
            for (let c = 0; c < row.length; c++) {
              const b = row[c]; if (!b?.active) continue
              const { x, y } = colRow2xy(c, r)
              g.fillStyle(b.color); g.fillCircle(x, y, BUBBLE_R - 1)
              g.fillStyle(0xffffff, 0.3); g.fillCircle(x - 5, y - 5, 6)
            }
          }
          // Moving shot
          if (this.shot) {
            g.fillStyle(this.shot.color); g.fillCircle(this.shot.x, this.shot.y, BUBBLE_R - 1)
            g.fillStyle(0xffffff, 0.3); g.fillCircle(this.shot.x - 5, this.shot.y - 5, 6)
          }
          // Shooter
          g.fillStyle(0x334155); g.fillCircle(W / 2, H - 40, BUBBLE_R + 4)
          g.fillStyle(this.nextColor); g.fillCircle(W / 2, H - 40, BUBBLE_R - 1)
          // Aim line
          g.lineStyle(1, 0xffffff, 0.3)
          let ax = W / 2, ay = H - 40
          for (let i = 0; i < 3; i++) {
            const tx = ax + Math.cos(this.aimAngle) * 60, ty = ay + Math.sin(this.aimAngle) * 60
            g.lineBetween(ax, ay, tx, ty)
            ax = tx; ay = ty
          }
          // HUD separator
          g.lineStyle(1, 0x334155); g.lineBetween(0, H - 70, W, H - 70)
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
