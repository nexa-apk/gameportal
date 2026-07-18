'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const GAME_TIME = 60000
const HOOP_Y = 104
const HOOP_HALF = 34
const BALL_R = 15
const BALL_START_Y = H - 66
const GRAVITY = 900
const LAUNCH_VY = -815

export default function BasketballShoot() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private timerText!: Phaser.GameObjects.Text
        private feedbackText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        private score = 0
        private bestScore = 0
        private timeLeft = GAME_TIME
        private running = false

        private ballY = BALL_START_Y
        private ballVy = 0
        private inFlight = false
        private evaluated = false
        private hoopPhase = 0
        private hoopX = W / 2
        private hoopSpeed = 1.6
        private feedbackTimer = 0

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#ffd9a0')
          this.gfx = this.add.graphics()

          this.scoreText = this.add.text(12, 12, 'Score: 0', {
            fontSize: '18px', color: '#c0392b', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(3)
          this.timerText = this.add.text(W - 12, 12, 'Time: 60', {
            fontSize: '18px', color: '#c0392b', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(3)
          this.feedbackText = this.add.text(W / 2, 200, '', {
            fontSize: '26px', color: '#27ae60', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('BASKETBALL', 'Tap to shoot the ball\nstraight up. Score when the\nmoving hoop is right above\nthe ball. 60 seconds!')

          this.input.on('pointerdown', () => {
            if (this.running) this.shoot()
          })
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.feedbackText.setText('')
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 255 : 225
          const bg = this.add.rectangle(0, 0, 320, bh, 0x8e3b00, 0.94).setStrokeStyle(3, 0xffffff)
          const ty = hasScore ? -98 : -80
          const t = this.add.text(0, ty, title, {
            fontSize: '24px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#ffe0c0', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 28, `Score: ${this.score}`, {
                fontSize: '18px', color: '#2ecc71', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 54, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#e0b48c', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 100 : 74
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#e67e22', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.score = 0
          this.timeLeft = GAME_TIME
          this.inFlight = false
          this.evaluated = false
          this.ballY = BALL_START_Y
          this.ballVy = 0
          this.hoopPhase = 0
          this.hoopSpeed = 1.6
          this.feedbackTimer = 0
          this.running = true
          this.overlay.setVisible(false)
          this.updateHud()
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          const secs = Math.ceil(this.timeLeft / 1000)
          this.timerText.setText(`Time: ${secs}`)
          this.timerText.setColor(secs <= 10 ? '#e74c3c' : '#c0392b')
        }

        shoot() {
          if (this.inFlight) return
          this.inFlight = true
          this.evaluated = false
          this.ballY = BALL_START_Y
          this.ballVy = LAUNCH_VY
        }

        endGame() {
          this.running = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('TIME UP!', `You scored ${this.score} baskets!`)
        }

        update(_time: number, delta: number) {
          const dt = delta / 1000
          if (this.running) {
            this.timeLeft -= delta
            if (this.timeLeft <= 0) {
              this.timeLeft = 0
              this.updateHud()
              this.endGame()
            } else {
              this.updateHud()
            }

            this.hoopPhase += this.hoopSpeed * dt
            this.hoopX = W / 2 + Math.sin(this.hoopPhase) * 120

            if (this.inFlight) {
              this.ballVy += GRAVITY * dt
              this.ballY += this.ballVy * dt
              if (!this.evaluated && this.ballY <= HOOP_Y && this.ballVy < 0) {
                this.evaluated = true
                if (Math.abs(W / 2 - this.hoopX) < HOOP_HALF) {
                  this.score++
                  this.hoopSpeed = Math.min(3.2, 1.6 + this.score * 0.06)
                  this.updateHud()
                  this.feedbackText.setColor('#27ae60').setText('SWISH! 🏀')
                  this.feedbackTimer = 700
                }
              }
              if (this.ballY > H + 40) {
                this.inFlight = false
                this.ballY = BALL_START_Y
                this.ballVy = 0
              }
            }

            if (this.feedbackTimer > 0) {
              this.feedbackTimer -= delta
              if (this.feedbackTimer <= 0) this.feedbackText.setText('')
            }
          }
          this.draw()
        }

        drawHoop(g: Phaser.GameObjects.Graphics) {
          const x = this.hoopX
          // backboard
          g.fillStyle(0xffffff, 1)
          g.fillRect(x - 30, HOOP_Y - 40, 60, 34)
          g.lineStyle(2, 0xe74c3c, 1)
          g.strokeRect(x - 16, HOOP_Y - 34, 32, 20)
          // rim
          g.lineStyle(5, 0xe74c3c, 1)
          g.lineBetween(x - HOOP_HALF, HOOP_Y, x + HOOP_HALF, HOOP_Y)
          // net
          g.lineStyle(1, 0xffffff, 0.9)
          for (let i = 0; i <= 6; i++) {
            const nx = x - HOOP_HALF + (i * (HOOP_HALF * 2)) / 6
            g.lineBetween(nx, HOOP_Y, x - HOOP_HALF / 2 + (i * HOOP_HALF) / 6, HOOP_Y + 22)
          }
        }

        drawBall(g: Phaser.GameObjects.Graphics) {
          const x = W / 2
          const y = this.ballY
          g.fillStyle(0x000000, 0.12)
          g.fillCircle(x + 2, y + 3, BALL_R)
          g.fillStyle(0xe67e22, 1)
          g.fillCircle(x, y, BALL_R)
          g.lineStyle(2, 0x8b4a10, 1)
          g.strokeCircle(x, y, BALL_R)
          g.lineBetween(x - BALL_R, y, x + BALL_R, y)
          g.lineBetween(x, y - BALL_R, x, y + BALL_R)
        }

        draw() {
          const g = this.gfx
          g.clear()

          // court floor
          g.fillStyle(0xc8843c, 1)
          g.fillRect(0, H - 34, W, 34)
          g.lineStyle(2, 0xa5692c, 1)
          g.lineBetween(0, H - 34, W, H - 34)

          if (this.running) {
            // aim hint when ready
            if (!this.inFlight) {
              g.lineStyle(2, 0xffffff, 0.5)
              for (let yy = BALL_START_Y - 30; yy > 160; yy -= 22) {
                g.lineBetween(W / 2, yy, W / 2, yy - 10)
              }
            }
            this.drawHoop(g)
            this.drawBall(g)
          }

          // HUD backdrop
          g.fillStyle(0xffd9a0, 0.85)
          g.fillRect(0, 0, W, 40)
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
