'use client'

import { useEffect, useRef } from 'react'

const W = 360
const H = 640
const GRAVITY = 1400
const JUMP = -420
const PIPE_GAP = 170
const PIPE_W = 60
const PIPE_SPEED = 200
const PIPE_INTERVAL = 1800

export default function FlappyBird() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private bird!: Phaser.GameObjects.Arc
        private birdVel = 0
        private birdX = 80
        private birdY = H / 2
        private pipes: { x: number; topH: number }[] = []
        private gfx!: Phaser.GameObjects.Graphics
        private bgGfx!: Phaser.GameObjects.Graphics
        private score = 0
        private highScore = 0
        private scoreText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private running = false
        private pipeTimer = 0
        private birdAngle = 0
        private groundY = H - 80
        private clouds: { x: number; y: number; w: number }[] = []
        private bgScroll = 0

        constructor() { super('Game') }

        create() {
          this.bgGfx = this.add.graphics()
          this.gfx = this.add.graphics()

          this.scoreText = this.add.text(W / 2, 60, '0', {
            fontSize: '52px', color: '#fff', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 4,
          }).setOrigin(0.5).setDepth(2)

          this.clouds = Array.from({ length: 5 }, (_, i) => ({
            x: i * 80, y: 60 + Math.random() * 100, w: 50 + Math.random() * 60,
          }))

          this.overlay = this.add.container(W / 2, H / 2).setDepth(3)
          this.showOverlay('FLAPPY BIRD', 'Tap or press Space to flap')

          this.input.on('pointerdown', () => this.onInput())
          this.input.keyboard?.on('keydown-SPACE', () => this.onInput())
        }

        onInput() {
          if (!this.running) { this.startGame(); return }
          this.birdVel = JUMP
          this.birdAngle = -30
        }

        showOverlay(title: string, sub: string, extra = '') {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 300, extra ? 230 : 190, 0x000000, 0.85).setStrokeStyle(2, 0xfbbf24)
          const t = this.add.text(0, extra ? -80 : -60, title, {
            fontSize: '28px', color: '#fbbf24', fontFamily: 'Arial', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, extra ? -30 : -10, sub, {
            fontSize: '14px', color: '#e2e8f0', fontFamily: 'Arial',
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (extra) {
            const ex = this.add.text(0, 20, extra, {
              fontSize: '16px', color: '#fff', fontFamily: 'Arial', fontStyle: 'bold',
            }).setOrigin(0.5)
            items.push(ex)
          }
          const btn = this.add.text(0, extra ? 75 : 50, '[ PLAY ]', {
            fontSize: '20px', color: '#000', fontFamily: 'Arial', fontStyle: 'bold',
            backgroundColor: '#fbbf24', padding: { x: 16, y: 8 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.birdY = H / 2
          this.birdVel = 0
          this.birdAngle = 0
          this.pipes = []
          this.pipeTimer = 0
          this.score = 0
          this.running = true
          this.overlay.setVisible(false)
          this.scoreText.setText('0')
        }

        update(_: number, delta: number) {
          const dt = delta / 1000

          if (this.running) {
            // Bird physics
            this.birdVel += GRAVITY * dt
            this.birdY += this.birdVel * dt
            this.birdAngle = Phaser.Math.Clamp(this.birdAngle + 300 * dt, -30, 90)

            // Pipes
            this.pipeTimer += delta
            if (this.pipeTimer > PIPE_INTERVAL) {
              this.pipeTimer = 0
              const topH = 80 + Math.random() * (this.groundY - PIPE_GAP - 120)
              this.pipes.push({ x: W + PIPE_W, topH })
            }

            this.pipes.forEach(p => { p.x -= PIPE_SPEED * dt })
            this.pipes = this.pipes.filter(p => p.x > -PIPE_W - 20)

            // Score
            this.pipes.forEach(p => {
              if (p.x + PIPE_W < this.birdX && !('scored' in p)) {
                (p as { scored?: boolean }).scored = true
                this.score++
                this.scoreText.setText(String(this.score))
                if (this.score > this.highScore) this.highScore = this.score
              }
            })

            // Collision
            const birdR = 16
            const dead =
              this.birdY + birdR >= this.groundY ||
              this.birdY - birdR <= 0 ||
              this.pipes.some(p => {
                const inX = this.birdX + birdR > p.x + 4 && this.birdX - birdR < p.x + PIPE_W - 4
                return inX && (this.birdY - birdR < p.topH || this.birdY + birdR > p.topH + PIPE_GAP)
              })

            if (dead) {
              this.running = false
              this.showOverlay(
                'GAME OVER',
                `Score: ${this.score}`,
                `Best: ${this.highScore}`,
              )
            }
          }

          // Scroll background
          this.bgScroll = (this.bgScroll + (this.running ? 60 * delta / 1000 : 0)) % W
          this.clouds.forEach(c => {
            if (this.running) c.x -= 20 * delta / 1000
            if (c.x < -c.w) c.x = W + c.w
          })

          this.drawScene()
        }

        drawScene() {
          const g = this.bgGfx
          g.clear()
          // Sky gradient via layers
          g.fillStyle(0x38bdf8)
          g.fillRect(0, 0, W, this.groundY)
          // Ground
          g.fillStyle(0x84cc16)
          g.fillRect(0, this.groundY, W, H - this.groundY)
          g.fillStyle(0x65a30d)
          g.fillRect(0, this.groundY, W, 8)
          // Clouds
          this.clouds.forEach(c => {
            g.fillStyle(0xffffff, 0.85)
            g.fillEllipse(c.x, c.y, c.w, c.w * 0.5)
            g.fillEllipse(c.x - c.w * 0.25, c.y + 4, c.w * 0.6, c.w * 0.35)
            g.fillEllipse(c.x + c.w * 0.2, c.y + 5, c.w * 0.55, c.w * 0.3)
          })

          const fg = this.gfx
          fg.clear()
          // Pipes
          this.pipes.forEach(p => {
            // Top pipe
            fg.fillStyle(0x22c55e)
            fg.fillRect(p.x, 0, PIPE_W, p.topH)
            fg.fillStyle(0x16a34a)
            fg.fillRect(p.x - 4, p.topH - 22, PIPE_W + 8, 22)
            // Bottom pipe
            const botY = p.topH + PIPE_GAP
            fg.fillStyle(0x22c55e)
            fg.fillRect(p.x, botY, PIPE_W, this.groundY - botY)
            fg.fillStyle(0x16a34a)
            fg.fillRect(p.x - 4, botY, PIPE_W + 8, 22)
          })

          // Bird
          const angle = this.birdAngle * Math.PI / 180
          const bx = this.birdX, by = this.birdY
          fg.save()
          fg.fillStyle(0xfbbf24)
          fg.fillCircle(bx, by, 18)
          // Eye
          fg.fillStyle(0xffffff)
          const ex = bx + Math.cos(angle - 0.4) * 8
          const ey = by + Math.sin(angle - 0.4) * 8
          fg.fillCircle(ex, ey, 5)
          fg.fillStyle(0x1e3a5f)
          fg.fillCircle(ex + 1, ey + 1, 3)
          // Beak
          fg.fillStyle(0xf97316)
          fg.fillTriangle(
            bx + Math.cos(angle) * 16, by + Math.sin(angle) * 16,
            bx + Math.cos(angle) * 22, by + Math.sin(angle) * 22 - 4,
            bx + Math.cos(angle) * 22, by + Math.sin(angle) * 22 + 4,
          )
          // Wing
          fg.fillStyle(0xf59e0b)
          fg.fillEllipse(
            bx - Math.cos(angle) * 6, by + Math.sin(angle + Math.PI / 2) * 8,
            20, 10,
          )
          fg.restore()
        }
      }

      const config: import('phaser').Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: W,
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
