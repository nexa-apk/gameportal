'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const BALL_R = 26
const GROUND_Y = H - 28

export default function KeepyUppy() {
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
        private overlay!: Phaser.GameObjects.Container

        private bx = W / 2
        private by = 200
        private bvx = 60
        private bvy = 0
        private score = 0
        private bestScore = 0
        private running = false
        private popTimer = 0

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#d6f0ff')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(W / 2, 16, '0', {
            fontSize: '30px', color: '#2c3e50', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5, 0).setDepth(3)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('KEEPY UPPY', 'Tap the ball to bounce it\nup. Do not let it hit the\nground! It falls faster the\nlonger you keep it up.')

          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.tapAt(p.x, p.y))
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 250 : 220
          const bg = this.add.rectangle(0, 0, 320, bh, 0x1c3d5a, 0.94).setStrokeStyle(3, 0xffffff)
          const ty = hasScore ? -95 : -78
          const t = this.add.text(0, ty, title, {
            fontSize: '24px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#cfeaf7', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 28, `Score: ${this.score}`, {
                fontSize: '18px', color: '#f1c40f', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 54, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#aaccdd', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 98 : 72
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#3498db', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.score = 0
          this.bx = W / 2
          this.by = 190
          this.bvx = 50
          this.bvy = 0
          this.popTimer = 0
          this.running = true
          this.overlay.setVisible(false)
          this.updateHud()
        }

        updateHud() {
          this.scoreText.setText(String(this.score))
        }

        tapAt(px: number, py: number) {
          if (!this.running) return
          const dx = px - this.bx
          const dy = py - this.by
          if (dx * dx + dy * dy <= (BALL_R + 16) * (BALL_R + 16)) {
            this.bvy = -430
            // nudge horizontally away from where it was tapped, keep it lively
            this.bvx += (this.bx < px ? -1 : 1) * (40 + Math.random() * 50)
            this.bvx = Phaser.Math.Clamp(this.bvx, -190, 190)
            this.score++
            this.updateHud()
            this.popTimer = 160
          }
        }

        endGame() {
          this.running = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('DROPPED!', `You kept it up ${this.score} times!`)
        }

        update(_time: number, delta: number) {
          const dt = delta / 1000
          if (this.running) {
            const gravity = Math.min(1150, 760 + this.score * 7)
            this.bvy += gravity * dt
            this.by += this.bvy * dt
            this.bx += this.bvx * dt

            if (this.bx < BALL_R) { this.bx = BALL_R; this.bvx = Math.abs(this.bvx) }
            if (this.bx > W - BALL_R) { this.bx = W - BALL_R; this.bvx = -Math.abs(this.bvx) }
            if (this.by < BALL_R + 44) { this.by = BALL_R + 44; if (this.bvy < 0) this.bvy = -this.bvy * 0.4 }

            if (this.by + BALL_R >= GROUND_Y) {
              this.by = GROUND_Y - BALL_R
              this.endGame()
            }
            if (this.popTimer > 0) this.popTimer -= delta
          }
          this.draw()
        }

        draw() {
          const g = this.gfx
          g.clear()

          // ground
          g.fillStyle(0x7bc86c, 1)
          g.fillRect(0, GROUND_Y, W, H - GROUND_Y)
          g.fillStyle(0x63b054, 1)
          g.fillRect(0, GROUND_Y, W, 6)

          if (this.running) {
            // ball shadow on ground
            const shadowScale = Phaser.Math.Clamp(1 - (GROUND_Y - this.by) / 400, 0.3, 1)
            g.fillStyle(0x000000, 0.12)
            g.fillEllipse(this.bx, GROUND_Y + 4, BALL_R * 2 * shadowScale, 10 * shadowScale)

            // ball (bright target-style, all simple circles)
            g.fillStyle(0xe74c3c, 1)
            g.fillCircle(this.bx, this.by, BALL_R)
            g.fillStyle(0xffffff, 0.92)
            g.fillCircle(this.bx, this.by, BALL_R * 0.62)
            g.fillStyle(0xf1c40f, 1)
            g.fillCircle(this.bx, this.by, BALL_R * 0.34)
            g.fillStyle(0xffffff, 0.5)
            g.fillCircle(this.bx - BALL_R * 0.32, this.by - BALL_R * 0.4, BALL_R * 0.26)
            g.lineStyle(2, 0xc0392b, 1)
            g.strokeCircle(this.bx, this.by, BALL_R)

            // tap pop ring
            if (this.popTimer > 0) {
              const t = 1 - this.popTimer / 160
              g.lineStyle(3, 0xffffff, 1 - t)
              g.strokeCircle(this.bx, this.by, BALL_R + t * 16)
            }
          }

          // HUD backdrop
          g.fillStyle(0xd6f0ff, 0.85)
          g.fillRect(0, 0, W, 52)
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
