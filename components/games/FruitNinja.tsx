'use client'
import { useEffect, useRef } from 'react'

const W = 400, H = 480
const COLORS = [0xff4444, 0xff9900, 0xffdd00, 0x44dd44, 0x44aaff, 0xcc44ff]
const FRUIT_R = 24

type Fruit = { x: number; y: number; vx: number; vy: number; color: number; sliced: boolean; missed: boolean; angle: number; spin: number; active: boolean }
type Slice = { x: number; y: number; age: number; color: number }
type Trail = { x: number; y: number; age: number }

export default function FruitNinja() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private fruits: Fruit[] = []
        private slices: Slice[] = []
        private trail: Trail[] = []
        private score = 0
        private misses = 0
        private combo = 0
        private spawnTimer = 0
        private spawnInterval = 1200
        private running = false
        private lastPointerX = 0; private lastPointerY = 0
        private pointerActive = false
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private missText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#1a0a00')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setDepth(2)
          this.missText = this.add.text(W - 10, 10, '❤️❤️❤️', { fontSize: '16px', fontFamily: 'monospace' }).setOrigin(1, 0).setDepth(2)
          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('FRUIT NINJA', 'Swipe across fruits to slice!\nMiss 3 = game over')

          this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (!this.running) return
            if (p.isDown) {
              this.trail.push({ x: p.x, y: p.y, age: 0 })
              this.checkSlice(p.x, p.y, this.lastPointerX, this.lastPointerY)
            }
            this.lastPointerX = p.x; this.lastPointerY = p.y
          })
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (!this.running) { this.startGame(); return }
            this.lastPointerX = p.x; this.lastPointerY = p.y
          })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.92).setStrokeStyle(2, 0xff9900)
          const t = this.add.text(0, -70, title, { fontSize: '26px', color: '#ff9900', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -25, sub, { fontSize: '13px', color: '#ccc', fontFamily: 'monospace', align: 'center', wordWrap: { width: 280 } }).setOrigin(0.5)
          const sc = this.score > 0 ? this.add.text(0, 20, `Score: ${this.score}`, { fontSize: '18px', color: '#ffdd00', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5) : null
          const btn = this.add.text(0, 70, '[ SLICE! ]', { fontSize: '20px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#ff9900', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s, btn]
          if (sc) items.push(sc)
          this.overlay.add(items); this.overlay.setVisible(true)
        }

        startGame() {
          this.fruits = []; this.slices = []; this.trail = []
          this.score = 0; this.misses = 0; this.combo = 0
          this.spawnTimer = 0; this.spawnInterval = 1200
          this.running = true; this.overlay.setVisible(false)
          this.scoreText.setText('Score: 0')
          this.missText.setText('❤️❤️❤️')
        }

        spawnFruit() {
          const x = 60 + Math.random() * (W - 120)
          const speed = 350 + Math.random() * 150
          const spread = (Math.random() - 0.5) * 200
          this.fruits.push({ x, y: H + 30, vx: spread, vy: -speed, color: COLORS[Math.floor(Math.random() * COLORS.length)], sliced: false, missed: false, angle: 0, spin: (Math.random() - 0.5) * 4, active: true })
        }

        checkSlice(x: number, y: number, px: number, py: number) {
          for (const f of this.fruits) {
            if (!f.active || f.sliced) continue
            const d = Math.hypot(f.x - x, f.y - y)
            if (d < FRUIT_R + 8) {
              f.sliced = true; f.active = false
              this.combo++
              this.score += 10 * (this.combo > 2 ? this.combo : 1)
              this.scoreText.setText(`Score: ${this.score}`)
              for (let i = 0; i < 8; i++) {
                const a = Math.random() * Math.PI * 2
                this.slices.push({ x: f.x + Math.cos(a) * 10, y: f.y + Math.sin(a) * 10, age: 0, color: f.color })
              }
            }
          }
        }

        update(_: number, delta: number) {
          if (!this.running) return
          const dt = delta / 1000
          this.spawnTimer -= delta
          if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnInterval
            this.spawnFruit()
            if (Math.random() < 0.3) this.spawnFruit()
            this.spawnInterval = Math.max(600, this.spawnInterval - 20)
          }

          let comboReset = true
          for (const f of this.fruits) {
            if (!f.active) continue
            f.vy += 600 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.angle += f.spin * dt
            if (f.y > H + 50 && !f.missed) {
              f.missed = true; f.active = false; this.misses++; this.combo = 0
              const hearts = '❤️'.repeat(Math.max(0, 3 - this.misses))
              this.missText.setText(hearts || '💀')
              if (this.misses >= 3) { this.running = false; window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } })); this.showOverlay('GAME OVER', `Score: ${this.score}`); return }
            } else if (!f.sliced) comboReset = false
          }
          if (comboReset) this.combo = 0
          this.fruits = this.fruits.filter(f => f.y < H + 100)
          this.slices.forEach(s => s.age += delta); this.slices = this.slices.filter(s => s.age < 400)
          this.trail.forEach(t => t.age += delta); this.trail = this.trail.filter(t => t.age < 150)
          this.draw()
        }

        draw() {
          const g = this.gfx; g.clear()
          // Trail
          for (let i = 1; i < this.trail.length; i++) {
            const a = this.trail[i - 1], b = this.trail[i]
            g.lineStyle(3 * (1 - b.age / 150), 0xffffff, 1 - b.age / 150)
            g.lineBetween(a.x, a.y, b.x, b.y)
          }
          // Fruits
          for (const f of this.fruits) {
            if (!f.active) continue
            g.fillStyle(f.color); g.fillCircle(f.x, f.y, FRUIT_R)
            g.fillStyle(0xffffff, 0.3); g.fillCircle(f.x - 6, f.y - 6, 8)
          }
          // Juice splats
          for (const s of this.slices) {
            g.fillStyle(s.color, 1 - s.age / 400); g.fillCircle(s.x, s.y, 5)
          }
          // Combo text
          if (this.combo > 2) {
            g.fillStyle(0xffdd00, 0.8)
            g.fillRoundedRect(W / 2 - 60, 50, 120, 30, 6)
          }
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
