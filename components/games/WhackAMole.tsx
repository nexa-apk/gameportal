'use client'
import { useEffect, useRef } from 'react'

const COLS = 3, ROWS = 3, HOLES = COLS * ROWS
const W = 360, H = 420
const HOLE_R = 44, GAME_TIME = 30000

export default function WhackAMole() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private moles: { up: boolean; timer: number; upTime: number; hit: boolean; anim: number }[] = []
        private score = 0; private misses = 0; private bestScore = 0
        private timeLeft = GAME_TIME; private running = false
        private spawnTimer = 0; private spawnInterval = 900
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private timerText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private whackEffects: { x: number; y: number; age: number }[] = []

        constructor() { super('Game') }

        holePos(i: number) {
          const col = i % COLS, row = Math.floor(i / COLS)
          return { x: 60 + col * 120, y: 140 + row * 100 }
        }

        create() {
          this.cameras.main.setBackgroundColor('#2d5016')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '18px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setDepth(2)
          this.timerText = this.add.text(W - 10, 10, 'Time: 30', { fontSize: '18px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(1, 0).setDepth(2)
          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('WHACK-A-MOLE', 'Click/tap the moles!\nYou have 30 seconds.')
          this.moles = Array.from({ length: HOLES }, () => ({ up: false, timer: 0, upTime: 1200, hit: false, anim: 0 }))

          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (!this.running) { this.startGame(); return }
            let hit = false
            for (let i = 0; i < HOLES; i++) {
              const { x, y } = this.holePos(i)
              const dist = Math.hypot(p.x - x, p.y - (y - 20))
              if (dist < HOLE_R && this.moles[i].up && !this.moles[i].hit) {
                this.moles[i].hit = true; this.moles[i].timer = 100
                this.score += 10; this.scoreText.setText(`Score: ${this.score}`)
                this.whackEffects.push({ x: p.x, y: p.y, age: 0 })
                hit = true
              }
            }
            if (!hit) { this.misses++ }
          })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 280, 200, 0x1a3006, 0.95).setStrokeStyle(2, 0x7cba2d)
          const t = this.add.text(0, -70, title, { fontSize: '22px', color: '#7cba2d', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -25, sub, { fontSize: '12px', color: '#ccc', fontFamily: 'monospace', align: 'center', wordWrap: { width: 260 } }).setOrigin(0.5)
          const sc = this.score > 0 ? this.add.text(0, 15, `Score: ${this.score}  Best: ${this.bestScore}`, { fontSize: '14px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5) : null
          const btn = this.add.text(0, 65, '[ WHACK! ]', { fontSize: '20px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#7cba2d', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s, btn]
          if (sc) items.push(sc)
          this.overlay.add(items); this.overlay.setVisible(true)
        }

        startGame() {
          this.moles.forEach(m => { m.up = false; m.timer = 0; m.hit = false; m.anim = 0 })
          this.score = 0; this.misses = 0; this.timeLeft = GAME_TIME
          this.spawnTimer = 0; this.spawnInterval = 900; this.whackEffects = []
          this.running = true; this.overlay.setVisible(false)
          this.scoreText.setText('Score: 0'); this.timerText.setText('Time: 30')
        }

        update(_: number, delta: number) {
          if (!this.running) return
          this.timeLeft -= delta
          this.timerText.setText(`Time: ${Math.max(0, Math.ceil(this.timeLeft / 1000))}`)
          if (this.timeLeft <= 0) {
            this.running = false
            this.bestScore = Math.max(this.bestScore, this.score)
            window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
            this.showOverlay('TIME UP!', `Score: ${this.score}  Best: ${this.bestScore}`)
            return
          }

          // Spawn moles
          this.spawnTimer -= delta
          if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnInterval
            this.spawnInterval = Math.max(500, this.spawnInterval - 10)
            const idle = this.moles.map((m, i) => m.up ? -1 : i).filter(i => i >= 0)
            if (idle.length > 0) {
              const pick = idle[Math.floor(Math.random() * idle.length)]
              this.moles[pick].up = true; this.moles[pick].hit = false
              this.moles[pick].upTime = 1000 + Math.random() * 1000
              this.moles[pick].timer = this.moles[pick].upTime
              this.moles[pick].anim = 0
            }
          }

          // Update moles
          for (const m of this.moles) {
            if (m.up) { m.timer -= delta; m.anim = Math.min(1, m.anim + delta / 150) }
            if (m.timer <= 0 && m.up) { m.up = false; m.anim = 0 }
          }

          this.whackEffects.forEach(e => e.age += delta); this.whackEffects = this.whackEffects.filter(e => e.age < 400)
          this.draw()
        }

        draw() {
          const g = this.gfx; g.clear()
          // Ground
          g.fillStyle(0x3a6b1a); g.fillRect(0, 0, W, H)
          // Grass patches
          for (let i = 0; i < 20; i++) { g.fillStyle(0x4a8c22); g.fillEllipse(i * 20, 380 + (i % 3) * 10, 30, 12) }

          for (let i = 0; i < HOLES; i++) {
            const { x, y } = this.holePos(i)
            const m = this.moles[i]
            // Hole
            g.fillStyle(0x1a0d00); g.fillEllipse(x, y + 15, HOLE_R * 2, HOLE_R * 0.7)
            g.fillStyle(0x2d1a00); g.fillEllipse(x, y + 12, HOLE_R * 1.8, HOLE_R * 0.5)
            // Mole
            if (m.up) {
              const rise = m.hit ? Math.max(0, 1 - (m.upTime - m.timer) / 100) : m.anim
              const moleY = y + 20 - rise * 40
              // Body
              g.fillStyle(m.hit ? 0xff4444 : 0x6b4226); g.fillEllipse(x, moleY, 50, 55)
              // Face
              g.fillStyle(0xc8916c); g.fillEllipse(x, moleY - 5, 36, 38)
              // Eyes
              g.fillStyle(0x000); g.fillCircle(x - 8, moleY - 10, 5); g.fillCircle(x + 8, moleY - 10, 5)
              g.fillStyle(0xffffff); g.fillCircle(x - 7, moleY - 12, 2); g.fillCircle(x + 9, moleY - 12, 2)
              // Nose
              g.fillStyle(0xff6666); g.fillEllipse(x, moleY - 3, 12, 8)
              // Teeth
              g.fillStyle(0xffffff); g.fillRect(x - 6, moleY + 3, 5, 6); g.fillRect(x + 1, moleY + 3, 5, 6)
              if (m.hit) {
                for (let j = 0; j < 4; j++) { const a = (j / 4) * Math.PI * 2; g.fillStyle(0xffdd00); g.fillCircle(x + Math.cos(a) * 28, moleY - 20 + Math.sin(a) * 28, 6) }
              }
            }
          }
          // Whack effects
          for (const e of this.whackEffects) {
            const t = 1 - e.age / 400
            const sr = (20 * t + 10)
            g.fillStyle(0xffff00, t)
            for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; g.fillCircle(e.x + Math.cos(a) * sr * 0.6, e.y + Math.sin(a) * sr * 0.6, sr * 0.3) }
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
