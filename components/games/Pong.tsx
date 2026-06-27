'use client'
import { useEffect, useRef } from 'react'

const W = 480, H = 360
const PAD_W = 12, PAD_H = 70, BALL_R = 8
const WIN_SCORE = 10

export default function Pong() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private ballX = W / 2; private ballY = H / 2
        private ballVX = 220; private ballVY = 160
        private p1Y = H / 2; private p2Y = H / 2
        private s1 = 0; private s2 = 0
        private gfx!: Phaser.GameObjects.Graphics
        private s1Text!: Phaser.GameObjects.Text
        private s2Text!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private running = false
        private ptrY = H / 2
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
        private speed = 220

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#000')
          this.gfx = this.add.graphics()
          this.s1Text = this.add.text(W / 4, 20, '0', { fontSize: '36px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(2)
          this.s2Text = this.add.text(3 * W / 4, 20, '0', { fontSize: '36px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(2)
          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('PONG', 'Move mouse/touch to control\nFirst to 10 wins!')
          this.cursors = this.input.keyboard!.createCursorKeys()
          this.input.on('pointermove', (p: Phaser.Input.Pointer) => { this.ptrY = p.y })
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { this.ptrY = p.y; if (!this.running) this.startGame() })
        }

        showOverlay(title: string, sub: string, extra = '') {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 300, extra ? 220 : 190, 0x000000, 0.92).setStrokeStyle(2, 0xffffff)
          const t = this.add.text(0, extra ? -75 : -60, title, { fontSize: '32px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, extra ? -25 : -15, sub, { fontSize: '13px', color: '#aaa', fontFamily: 'monospace', align: 'center', wordWrap: { width: 280 } }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (extra) items.push(this.add.text(0, 20, extra, { fontSize: '16px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5))
          const btn = this.add.text(0, extra ? 75 : 55, '[ PLAY ]', { fontSize: '20px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#ffffff', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.s1 = 0; this.s2 = 0; this.speed = 220
          this.s1Text.setText('0'); this.s2Text.setText('0')
          this.p1Y = H / 2; this.p2Y = H / 2
          this.running = true
          this.overlay.setVisible(false)
          this.resetBall(1)
        }

        resetBall(dir: number) {
          this.ballX = W / 2; this.ballY = H / 2
          const angle = (Math.random() * 0.6 - 0.3)
          this.ballVX = this.speed * dir * Math.cos(angle)
          this.ballVY = this.speed * Math.sin(angle)
        }

        update(_: number, delta: number) {
          if (!this.running) return
          const dt = delta / 1000

          // Player paddle (right side)
          const padSpeed = 300
          if (this.cursors.up?.isDown) this.p1Y -= padSpeed * dt
          else if (this.cursors.down?.isDown) this.p1Y += padSpeed * dt
          else this.p1Y += (this.ptrY - this.p1Y) * Math.min(1, dt * 10)
          this.p1Y = Phaser.Math.Clamp(this.p1Y, PAD_H / 2, H - PAD_H / 2)

          // CPU paddle (left side)
          const cpuTarget = this.ballY + (Math.random() - 0.5) * 20
          this.p2Y += (cpuTarget - this.p2Y) * Math.min(1, dt * 3)
          this.p2Y = Phaser.Math.Clamp(this.p2Y, PAD_H / 2, H - PAD_H / 2)

          // Ball
          this.ballX += this.ballVX * dt
          this.ballY += this.ballVY * dt

          // Top/bottom
          if (this.ballY - BALL_R <= 0) { this.ballY = BALL_R; this.ballVY = Math.abs(this.ballVY) }
          if (this.ballY + BALL_R >= H) { this.ballY = H - BALL_R; this.ballVY = -Math.abs(this.ballVY) }

          // CPU paddle collision (left)
          const p2x = PAD_W + PAD_W / 2
          if (this.ballX - BALL_R <= p2x + PAD_W / 2 && this.ballVX < 0 &&
              this.ballY >= this.p2Y - PAD_H / 2 && this.ballY <= this.p2Y + PAD_H / 2) {
            this.ballVX = Math.abs(this.ballVX) * 1.05
            this.ballVY += (this.ballY - this.p2Y) * 3
            this.ballX = p2x + PAD_W / 2 + BALL_R
          }

          // Player paddle collision (right)
          const p1x = W - PAD_W - PAD_W / 2
          if (this.ballX + BALL_R >= p1x - PAD_W / 2 && this.ballVX > 0 &&
              this.ballY >= this.p1Y - PAD_H / 2 && this.ballY <= this.p1Y + PAD_H / 2) {
            this.ballVX = -Math.abs(this.ballVX) * 1.05
            this.ballVY += (this.ballY - this.p1Y) * 3
            this.ballX = p1x - PAD_W / 2 - BALL_R
          }

          // Clamp ball speed
          const spd = Math.hypot(this.ballVX, this.ballVY)
          if (spd > 600) { this.ballVX *= 600 / spd; this.ballVY *= 600 / spd }

          // Scoring
          if (this.ballX < 0) { this.s1++; this.s1Text.setText(String(this.s1)); if (this.s1 >= WIN_SCORE) this.endGame('YOU WIN!'); else this.resetBall(-1) }
          if (this.ballX > W) { this.s2++; this.s2Text.setText(String(this.s2)); if (this.s2 >= WIN_SCORE) this.endGame('CPU WINS'); else this.resetBall(1) }

          this.draw()
        }

        endGame(msg: string) {
          this.running = false
          this.showOverlay(msg, `${this.s1} — ${this.s2}`)
        }

        draw() {
          const g = this.gfx
          g.clear()
          // Center line
          g.lineStyle(2, 0x444444)
          for (let y = 0; y < H; y += 20) { g.lineBetween(W / 2, y, W / 2, y + 10) }
          // Paddles
          g.fillStyle(0xffffff)
          g.fillRoundedRect(PAD_W, this.p2Y - PAD_H / 2, PAD_W, PAD_H, 4)
          g.fillRoundedRect(W - PAD_W * 2, this.p1Y - PAD_H / 2, PAD_W, PAD_H, 4)
          // Ball
          g.fillCircle(this.ballX, this.ballY, BALL_R)
          // Glow
          g.fillStyle(0xffffff, 0.3); g.fillCircle(this.ballX, this.ballY, BALL_R + 4)
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
