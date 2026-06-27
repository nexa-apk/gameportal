'use client'

import { useEffect, useRef } from 'react'

const W = 480
const H = 600
const PADDLE_W = 90
const PADDLE_H = 14
const BALL_R = 9
const BRICK_ROWS = 5
const BRICK_COLS = 8
const BRICK_W = 50
const BRICK_H = 18
const BRICK_PAD = 4
const BRICK_TOP = 80

const ROW_COLORS = [0xef4444, 0xf97316, 0xeab308, 0x22c55e, 0x3b82f6]

export default function Breakout() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private paddleX = W / 2
        private ballX = W / 2
        private ballY = H - 100
        private ballVX = 0
        private ballVY = 0
        private bricks: { x: number; y: number; alive: boolean; color: number }[] = []
        private score = 0
        private lives = 3
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private livesText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private running = false
        private launched = false
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
        private ptrX = W / 2

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#0f172a')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '16px', color: '#e2e8f0', fontFamily: 'monospace',
          }).setDepth(2)
          this.livesText = this.add.text(W - 10, 10, '♥♥♥', {
            fontSize: '16px', color: '#f87171', fontFamily: 'monospace',
          }).setOrigin(1, 0).setDepth(2)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('BREAKOUT', 'Move mouse/touch to control paddle\nClick or tap to launch ball')

          this.cursors = this.input.keyboard!.createCursorKeys()
          this.input.on('pointermove', (p: Phaser.Input.Pointer) => { this.ptrX = p.x })
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            this.ptrX = p.x
            if (!this.running) { this.startGame(); return }
            if (!this.launched) this.launch()
          })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 320, 210, 0x000000, 0.9).setStrokeStyle(2, 0x3b82f6)
          const t = this.add.text(0, -70, title, {
            fontSize: '36px', color: '#60a5fa', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, -10, sub, {
            fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 300 },
          }).setOrigin(0.5)
          const btn = this.add.text(0, 65, '[ PLAY ]', {
            fontSize: '22px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#60a5fa', padding: { x: 16, y: 8 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          this.overlay.add([bg, t, s, btn])
          this.overlay.setVisible(true)
        }

        startGame() {
          this.score = 0
          this.lives = 3
          this.paddleX = W / 2
          this.launched = false
          this.running = true
          this.overlay.setVisible(false)
          this.resetBall()
          this.buildBricks()
          this.updateHUD()
        }

        resetBall() {
          this.ballX = this.paddleX
          this.ballY = H - 100
          this.ballVX = 0
          this.ballVY = 0
          this.launched = false
        }

        launch() {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8
          const speed = 340
          this.ballVX = Math.cos(angle) * speed
          this.ballVY = Math.sin(angle) * speed
          this.launched = true
        }

        buildBricks() {
          this.bricks = []
          const totalW = BRICK_COLS * (BRICK_W + BRICK_PAD) - BRICK_PAD
          const ox = (W - totalW) / 2
          for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
              this.bricks.push({
                x: ox + c * (BRICK_W + BRICK_PAD),
                y: BRICK_TOP + r * (BRICK_H + BRICK_PAD),
                alive: true,
                color: ROW_COLORS[r],
              })
            }
          }
        }

        updateHUD() {
          this.scoreText.setText(`Score: ${this.score}`)
          this.livesText.setText('♥'.repeat(this.lives))
        }

        update(_: number, delta: number) {
          const dt = delta / 1000
          if (!this.running) return

          if (this.cursors.left?.isDown) this.paddleX -= 360 * dt
          if (this.cursors.right?.isDown) this.paddleX += 360 * dt
          else if (!this.cursors.left?.isDown) {
            this.paddleX += (this.ptrX - this.paddleX) * Math.min(1, dt * 12)
          }
          this.paddleX = Phaser.Math.Clamp(this.paddleX, PADDLE_W / 2, W - PADDLE_W / 2)

          if (!this.launched) {
            this.ballX = this.paddleX
          } else {
            this.ballX += this.ballVX * dt
            this.ballY += this.ballVY * dt

            if (this.ballX - BALL_R < 0) { this.ballX = BALL_R; this.ballVX = Math.abs(this.ballVX) }
            if (this.ballX + BALL_R > W) { this.ballX = W - BALL_R; this.ballVX = -Math.abs(this.ballVX) }
            if (this.ballY - BALL_R < 55) { this.ballY = 55 + BALL_R; this.ballVY = Math.abs(this.ballVY) }

            const py = H - 60
            if (
              this.ballY + BALL_R >= py && this.ballY + BALL_R <= py + PADDLE_H &&
              this.ballX >= this.paddleX - PADDLE_W / 2 && this.ballX <= this.paddleX + PADDLE_W / 2 &&
              this.ballVY > 0
            ) {
              const hit = (this.ballX - this.paddleX) / (PADDLE_W / 2)
              const angle = hit * (Math.PI / 3)
              const speed = Math.sqrt(this.ballVX ** 2 + this.ballVY ** 2)
              this.ballVX = Math.sin(angle) * speed
              this.ballVY = -Math.cos(angle) * speed
              this.ballY = py - BALL_R
            }

            for (const b of this.bricks) {
              if (!b.alive) continue
              if (
                this.ballX + BALL_R > b.x && this.ballX - BALL_R < b.x + BRICK_W &&
                this.ballY + BALL_R > b.y && this.ballY - BALL_R < b.y + BRICK_H
              ) {
                b.alive = false
                this.score += 10
                this.updateHUD()
                const overlapX = Math.min(this.ballX + BALL_R - b.x, b.x + BRICK_W - (this.ballX - BALL_R))
                const overlapY = Math.min(this.ballY + BALL_R - b.y, b.y + BRICK_H - (this.ballY - BALL_R))
                if (overlapX < overlapY) this.ballVX = -this.ballVX
                else this.ballVY = -this.ballVY
                break
              }
            }

            if (this.ballY > H + 20) {
              this.lives--
              this.updateHUD()
              if (this.lives <= 0) {
                this.running = false
                this.showOverlay('GAME OVER', `Final Score: ${this.score}`)
              } else {
                this.resetBall()
              }
            }

            if (this.bricks.every(b => !b.alive)) {
              this.buildBricks()
              this.resetBall()
              this.score += 100
              this.updateHUD()
            }
          }

          this.drawScene()
        }

        drawScene() {
          const g = this.gfx
          g.clear()

          g.fillStyle(0x1e293b)
          g.fillRect(0, 0, W, 40)

          for (const b of this.bricks) {
            if (!b.alive) continue
            g.fillStyle(b.color)
            g.fillRoundedRect(b.x, b.y, BRICK_W, BRICK_H, 3)
            g.fillStyle(0xffffff, 0.15)
            g.fillRoundedRect(b.x + 2, b.y + 2, BRICK_W - 4, 4, 2)
          }

          const py = H - 60
          g.fillStyle(0x60a5fa)
          g.fillRoundedRect(this.paddleX - PADDLE_W / 2, py, PADDLE_W, PADDLE_H, PADDLE_H / 2)
          g.fillStyle(0xbfdbfe, 0.4)
          g.fillRoundedRect(this.paddleX - PADDLE_W / 2 + 4, py + 2, PADDLE_W - 8, 4, 3)

          g.fillStyle(0xfbbf24)
          g.fillCircle(this.ballX, this.ballY, BALL_R)
          g.fillStyle(0xfef08a, 0.6)
          g.fillCircle(this.ballX - 3, this.ballY - 3, 4)
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
