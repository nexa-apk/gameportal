'use client'
import { useEffect, useRef } from 'react'

const W = 320, H = 480
const BALL_R = 14
const COLORS = [0xff4444, 0x44aaff, 0xffdd00, 0x44dd44]
const COLOR_NAMES = ['#ff4444', '#44aaff', '#ffdd00', '#44dd44']

export default function ColorSwitch() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      type Obstacle = {
        y: number
        angle: number
        speed: number
        type: 'spinner' | 'sawblade'
        colorOffset: number
      }

      class GameScene extends Phaser.Scene {
        private ballY = H / 2; private ballVY = 0
        private ballColorIdx = 0
        private obstacles: Obstacle[] = []
        private nextObstacleY = H / 2 - 200
        private score = 0
        private running = false
        private cameraY = 0
        private bestScore = 0
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private particles: { x: number; y: number; vx: number; vy: number; color: number; life: number }[] = []

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#0a0a1a')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(W / 2, 20, '0', { fontSize: '36px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(3)
          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('COLOR SWITCH', 'Tap to bounce!\nMatch your color to pass through')

          this.input.on('pointerdown', () => { if (!this.running) { this.startGame(); return }; this.ballVY = -500 })
          this.input.keyboard?.on('keydown-SPACE', () => { if (!this.running) { this.startGame(); return }; this.ballVY = -500 })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 280, 200, 0x000, 0.92).setStrokeStyle(2, 0xffffff)
          const t = this.add.text(0, -70, title, { fontSize: '24px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -25, sub, { fontSize: '13px', color: '#aaa', fontFamily: 'monospace', align: 'center', wordWrap: { width: 260 } }).setOrigin(0.5)
          const sc = this.score > 0 ? this.add.text(0, 15, `Score: ${this.score}  Best: ${this.bestScore}`, { fontSize: '14px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5) : null
          const btn = this.add.text(0, 65, '[ TAP! ]', { fontSize: '22px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#ffffff', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s, btn]
          if (sc) items.push(sc)
          this.overlay.add(items); this.overlay.setVisible(true)
        }

        startGame() {
          this.ballY = H * 0.6; this.ballVY = -400; this.ballColorIdx = 0
          this.obstacles = []; this.nextObstacleY = H * 0.6 - 200
          this.score = 0; this.cameraY = 0; this.particles = []
          this.running = true; this.overlay.setVisible(false)
          this.scoreText.setText('0')
        }

        spawnObstacle() {
          this.obstacles.push({ y: this.nextObstacleY, angle: 0, speed: 0.8 + this.score * 0.05, type: this.score % 5 === 4 ? 'sawblade' : 'spinner', colorOffset: Math.floor(Math.random() * 4) })
          this.nextObstacleY -= 200 + Math.random() * 100
        }

        update(_: number, delta: number) {
          if (!this.running) return
          const dt = delta / 1000

          this.ballVY += 1200 * dt
          this.ballVY = Math.min(this.ballVY, 700)
          this.ballY += this.ballVY * dt

          // Camera follows ball up
          const screenY = this.ballY - this.cameraY
          if (screenY < H * 0.4) this.cameraY = this.ballY - H * 0.4

          // Spawn obstacles
          while (this.nextObstacleY > this.cameraY - 50) this.spawnObstacle()
          this.obstacles = this.obstacles.filter(o => o.y - this.cameraY < H + 100)

          // Rotate obstacles
          this.obstacles.forEach(o => { o.angle += o.speed * dt })

          // Check collisions
          for (const o of this.obstacles) {
            const sy = o.y - this.cameraY
            const dx = W / 2 - W / 2, dy = this.ballY - this.cameraY - sy
            const dist = Math.abs(dy)
            if (dist < 55 && dist > 30) {
              // Ball is passing through obstacle — check if color matches
              const angleToball = Math.atan2(this.ballY - this.cameraY - sy, W / 2 - W / 2)
              const segAngle = (angleToball - o.angle + Math.PI * 10) % (Math.PI * 2)
              const segIdx = Math.floor((segAngle / (Math.PI * 2)) * 4)
              const colorIdx = (segIdx + o.colorOffset) % 4
              if (colorIdx !== this.ballColorIdx) {
                this.bestScore = Math.max(this.bestScore, this.score)
                this.running = false; this.showOverlay('GAME OVER', `Score: ${this.score}`)
                return
              }
            }
            if (dist < 30 && dist > -10) {
              // Passed through — switch ball color
              this.ballColorIdx = (this.ballColorIdx + 1) % 4
              this.score++; this.scoreText.setText(String(this.score))
              // Particle burst
              for (let i = 0; i < 8; i++) {
                const a = Math.random() * Math.PI * 2
                this.particles.push({ x: W / 2, y: this.ballY - this.cameraY, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, color: COLORS[this.ballColorIdx], life: 400 })
              }
            }
          }

          // Die if fallen off screen
          if (this.ballY - this.cameraY > H + 50) {
            this.bestScore = Math.max(this.bestScore, this.score)
            this.running = false; this.showOverlay('GAME OVER', `Score: ${this.score}`)
            return
          }

          this.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= delta; p.vy += 200 * dt })
          this.particles = this.particles.filter(p => p.life > 0)
          this.draw()
        }

        draw() {
          const g = this.gfx; g.clear()
          // Background dots
          for (let i = 0; i < 20; i++) {
            const y = (i * 80 - this.cameraY * 0.3) % H
            g.fillStyle(0x1a1a3a); g.fillCircle(W / 2, y, 3)
          }
          // Obstacles
          for (const o of this.obstacles) {
            const sy = o.y - this.cameraY
            const R = 50, r2 = 35
            g.lineStyle(0, 0x000000, 0); g.fillStyle(0)
            for (let seg = 0; seg < 4; seg++) {
              const startA = o.angle + (seg / 4) * Math.PI * 2
              const endA = o.angle + ((seg + 0.85) / 4) * Math.PI * 2
              const colorIdx = (seg + o.colorOffset) % 4
              g.fillStyle(COLORS[colorIdx])
              g.slice(W / 2, sy, R, startA, endA, false)
              g.fillPath()
              // Inner cut
              g.fillStyle(0x0a0a1a)
              g.slice(W / 2, sy, r2, startA, endA, false)
              g.fillPath()
            }
          }
          // Particles
          for (const p of this.particles) { g.fillStyle(p.color, p.life / 400); g.fillCircle(p.x, p.y, 5) }
          // Ball
          g.fillStyle(0x111); g.fillCircle(W / 2, this.ballY - this.cameraY, BALL_R + 3)
          g.fillStyle(COLORS[this.ballColorIdx]); g.fillCircle(W / 2, this.ballY - this.cameraY, BALL_R)
          g.fillStyle(0xffffff, 0.4); g.fillCircle(W / 2 - 4, this.ballY - this.cameraY - 4, 5)
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
