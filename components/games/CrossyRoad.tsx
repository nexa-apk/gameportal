'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 480
const CELL = 48, COLS = Math.floor(W / CELL), ROWS = Math.floor(H / CELL) + 2

type Lane = { type: 'safe' | 'road' | 'river'; cars: Car[]; logs: Log[]; speed: number; color: number }
type Car = { x: number; width: number; color: number }
type Log = { x: number; width: number }

function makeLane(row: number): Lane {
  if (row === 0 || row % 8 === 0) return { type: 'safe', cars: [], logs: [], speed: 0, color: 0x4a7c59 }
  const isRiver = row % 3 === 1
  const speed = (80 + Math.random() * 80) * (Math.random() < 0.5 ? 1 : -1)
  if (isRiver) {
    const logs: Log[] = []
    let x = Math.random() * 200
    while (x < W + 100) { logs.push({ x, width: 60 + Math.random() * 40 }); x += logs[logs.length - 1].width + 60 + Math.random() * 60 }
    return { type: 'river', cars: [], logs, speed, color: 0x1a6b9a }
  }
  const cars: Car[] = []
  let x = Math.random() * 200
  const carColors = [0xff4444, 0x44aaff, 0xffdd00, 0xff9900, 0xaa44ff]
  while (x < W + 100) {
    const w = 40 + Math.random() * 20
    cars.push({ x, width: w, color: carColors[Math.floor(Math.random() * carColors.length)] })
    x += w + 60 + Math.random() * 80
  }
  return { type: 'road', cars, logs: [], speed, color: 0x555555 }
}

export default function CrossyRoad() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private px = Math.floor(COLS / 2); private prow = ROWS - 2
        private lanes: Lane[] = []
        private cameraRow = 0
        private score = 0; private bestScore = 0
        private running = false
        private moving = false
        private pAnimTimer = 0
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
        private logX = 0; private onLog = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#2d5a27')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(W / 2, 10, 'Score: 0', { fontSize: '18px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(2)
          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('CROSSY ROAD', '← → ↑ ↓ to hop\nDon\'t get hit or drown!')
          this.cursors = this.input.keyboard!.createCursorKeys()

          let sx = 0, sy = 0
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { sx = p.x; sy = p.y })
          this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
            if (!this.running) { this.startGame(); return }
            const dx = p.x - sx, dy = p.y - sy
            if (Math.abs(dx) < 15 && Math.abs(dy) < 15) { this.hop(0, -1); return }
            if (Math.abs(dx) > Math.abs(dy)) this.hop(dx > 0 ? 1 : -1, 0)
            else this.hop(0, dy > 0 ? 1 : -1)
          })

          this.input.keyboard?.on('keydown-UP', () => { if (this.running) this.hop(0, -1) })
          this.input.keyboard?.on('keydown-DOWN', () => { if (this.running) this.hop(0, 1) })
          this.input.keyboard?.on('keydown-LEFT', () => { if (this.running) this.hop(-1, 0) })
          this.input.keyboard?.on('keydown-RIGHT', () => { if (this.running) this.hop(1, 0) })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.92).setStrokeStyle(2, 0x4caf50)
          const t = this.add.text(0, -70, title, { fontSize: '22px', color: '#4caf50', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -25, sub, { fontSize: '12px', color: '#ccc', fontFamily: 'monospace', align: 'center', wordWrap: { width: 280 } }).setOrigin(0.5)
          const scores: Phaser.GameObjects.GameObject[] = []
          if (this.bestScore > 0) scores.push(this.add.text(0, 15, `Best: ${this.bestScore}`, { fontSize: '14px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5))
          if (this.score > 0) scores.push(this.add.text(0, 38, `Score: ${this.score}`, { fontSize: '14px', color: '#ff9', fontFamily: 'monospace' }).setOrigin(0.5))
          const btn = this.add.text(0, 70, '[ HOP! ]', { fontSize: '20px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#4caf50', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          this.overlay.add([bg, t, s, btn, ...scores]); this.overlay.setVisible(true)
        }

        startGame() {
          this.px = Math.floor(COLS / 2); this.prow = ROWS - 2
          this.cameraRow = 0; this.score = 0; this.onLog = false
          this.lanes = Array.from({ length: ROWS + 20 }, (_, i) => makeLane(i))
          this.running = true; this.overlay.setVisible(false)
          this.scoreText.setText('Score: 0')
        }

        hop(dx: number, dy: number) {
          if (!this.running) return
          const nx = Phaser.Math.Clamp(this.px + dx, 0, COLS - 1)
          const nr = this.prow + dy
          this.px = nx; this.prow = nr
          this.pAnimTimer = 100
          if (dy < 0) {
            const newScore = Math.max(this.score, (ROWS - 2) - this.prow + this.cameraRow)
            if (newScore > this.score) { this.score = newScore; this.scoreText.setText(`Score: ${this.score}`) }
            if (this.prow < 4) { this.cameraRow += 4; this.prow += 4 }
          }
        }

        update(_: number, delta: number) {
          if (!this.running) return
          const dt = delta / 1000
          if (this.pAnimTimer > 0) this.pAnimTimer -= delta

          // Move cars and logs
          for (const lane of this.lanes) {
            if (lane.type === 'road') lane.cars.forEach(c => { c.x += lane.speed * dt; if (c.x > W + 80) c.x = -c.width - 10; if (c.x < -c.width - 10) c.x = W + 80 })
            if (lane.type === 'river') lane.logs.forEach(l => { l.x += lane.speed * dt; if (l.x > W + 80) l.x = -l.width - 10; if (l.x < -l.width - 10) l.x = W + 80 })
          }

          // Check collisions
          const lane = this.lanes[this.prow + this.cameraRow]
          const cx = this.px * CELL + CELL / 2
          this.onLog = false

          if (lane?.type === 'road') {
            for (const car of lane.cars) {
              if (cx >= car.x && cx <= car.x + car.width) { this.die(); return }
            }
          }
          if (lane?.type === 'river') {
            let safe = false
            for (const log of lane.logs) { if (cx >= log.x && cx <= log.x + log.width) { safe = true; this.px += lane.speed * dt / CELL; break } }
            if (!safe) { this.die(); return }
          }
          this.px = Phaser.Math.Clamp(this.px, 0, COLS - 1)
          if (this.prow > ROWS - 1) { this.die(); return }

          this.draw()
        }

        die() {
          this.bestScore = Math.max(this.bestScore, this.score)
          this.running = false; this.showOverlay('SQUASHED! 💀', `Score: ${this.score}`)
        }

        draw() {
          const g = this.gfx; g.clear()
          for (let r = 0; r < ROWS + 1; r++) {
            const laneIdx = r + this.cameraRow
            const lane = this.lanes[laneIdx]
            if (!lane) continue
            const y = (r - 0.5) * CELL
            // Lane background
            g.fillStyle(lane.color); g.fillRect(0, y, W, CELL)
            // Road markings
            if (lane.type === 'road') {
              g.fillStyle(0x888888); g.fillRect(0, y + CELL / 2 - 1, W, 2)
            }
            // Logs
            if (lane.type === 'river') {
              for (const log of lane.logs) { g.fillStyle(0x8b5e3c); g.fillRoundedRect(log.x, y + 8, log.width, CELL - 16, 8) }
            }
            // Cars
            if (lane.type === 'road') {
              for (const car of lane.cars) {
                g.fillStyle(car.color); g.fillRoundedRect(car.x, y + 6, car.width, CELL - 12, 6)
                g.fillStyle(0xaaddff); g.fillRect(car.x + 4, y + 10, 12, 10)
              }
            }
            // Safe lane trees
            if (lane.type === 'safe' && r % 3 === 1) {
              for (let c = 0; c < COLS; c += 3) { g.fillStyle(0x228833); g.fillCircle(c * CELL + CELL / 2, y + CELL / 2, 14) }
            }
          }
          // Player (chicken)
          const py = ((this.prow) - 0.5) * CELL
          const px = this.px * CELL
          const bob = this.pAnimTimer > 0 ? -4 : 0
          g.fillStyle(0xffffff); g.fillEllipse(px + CELL / 2, py + CELL / 2 + bob, 22, 28)
          g.fillStyle(0xffdd00); g.fillTriangle(px + CELL / 2 - 4, py + CELL / 2 - 2 + bob, px + CELL / 2 + 4, py + CELL / 2 - 2 + bob, px + CELL / 2, py + CELL / 2 + 4 + bob)
          g.fillStyle(0xff6666); g.fillEllipse(px + CELL / 2, py + CELL / 2 - 12 + bob, 8, 8)
          g.fillStyle(0x000); g.fillCircle(px + CELL / 2 + 3, py + CELL / 2 - 11 + bob, 2)
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
