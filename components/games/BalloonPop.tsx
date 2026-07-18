'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const GAME_TIME = 60000

const BALLOON_COLORS = [
  0xe74c3c, 0x3498db, 0x2ecc71, 0x9b59b6,
  0xe67e22, 0x1abc9c, 0xff6b81, 0xf39c12,
]

type Balloon = {
  x: number
  y: number
  r: number
  color: number
  speed: number
  golden: boolean
  alive: boolean
  pop: number
}

export default function BalloonPop() {
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
        private overlay!: Phaser.GameObjects.Container

        private balloons: Balloon[] = []
        private score = 0
        private bestScore = 0
        private timeLeft = GAME_TIME
        private running = false
        private spawnTimer = 0

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#8ed0f0')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(12, 12, 'Score: 0', {
            fontSize: '18px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(2)
          this.timerText = this.add.text(W - 12, 12, 'Time: 60', {
            fontSize: '18px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(2)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('BALLOON POP', 'Tap the balloons to pop them!\nYou have 60 seconds.\nGold balloons are worth 5!')

          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.handleClick(p.x, p.y))
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 250 : 210
          const bg = this.add.rectangle(0, 0, 310, bh, 0x1c3d5a, 0.94).setStrokeStyle(3, 0xffffff)
          const ty = hasScore ? -95 : -75
          const t = this.add.text(0, ty, title, {
            fontSize: '26px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 48, sub, {
            fontSize: '12px', color: '#cfeaf7', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 275 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 22, `Score: ${this.score}`, {
                fontSize: '18px', color: '#f1c40f', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 50, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#aaccdd', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 96 : 60
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#e74c3c', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.score = 0
          this.timeLeft = GAME_TIME
          this.balloons = []
          this.spawnTimer = 0
          this.running = true
          this.overlay.setVisible(false)
          this.updateHud()
        }

        spawnBalloon() {
          const r = 22 + Math.random() * 10
          const golden = Math.random() < 0.09
          this.balloons.push({
            x: r + Math.random() * (W - 2 * r),
            y: H + r + 10,
            r,
            color: golden ? 0xf1c40f : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
            speed: 55 + Math.random() * 45,
            golden,
            alive: true,
            pop: 0,
          })
        }

        handleClick(px: number, py: number) {
          if (!this.running) return
          for (let i = this.balloons.length - 1; i >= 0; i--) {
            const b = this.balloons[i]
            if (!b.alive) continue
            const dx = px - b.x
            const dy = py - b.y
            if (dx * dx + dy * dy <= (b.r + 4) * (b.r + 4)) {
              b.alive = false
              b.pop = 0.0001
              this.score += b.golden ? 5 : 1
              this.updateHud()
              break
            }
          }
        }

        endGame() {
          this.running = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('TIME UP!', 'Nice popping! Tap PLAY to go again.')
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          const secs = Math.ceil(this.timeLeft / 1000)
          this.timerText.setText(`Time: ${secs}`)
          this.timerText.setColor(secs <= 10 ? '#ff5555' : '#ffffff')
        }

        update(_time: number, delta: number) {
          if (this.running) {
            this.timeLeft -= delta
            if (this.timeLeft <= 0) {
              this.timeLeft = 0
              this.updateHud()
              this.endGame()
            } else {
              this.spawnTimer += delta
              const interval = Math.max(360, 720 - this.score * 4)
              if (this.spawnTimer >= interval) {
                this.spawnTimer = 0
                this.spawnBalloon()
              }
              this.updateHud()
            }
          }

          for (const b of this.balloons) {
            if (b.alive) {
              b.y -= b.speed * delta / 1000
            } else if (b.pop < 1) {
              b.pop += delta / 160
            }
          }
          this.balloons = this.balloons.filter(
            (b) => (b.alive && b.y > -b.r - 20) || (!b.alive && b.pop < 1)
          )

          this.draw()
        }

        drawBalloon(g: Phaser.GameObjects.Graphics, b: Balloon) {
          // string
          g.lineStyle(2, 0xffffff, 0.7)
          g.lineBetween(b.x, b.y + b.r, b.x, b.y + b.r + 14)
          // body shadow
          g.fillStyle(0x000000, 0.12)
          g.fillEllipse(b.x + 2, b.y + 3, b.r * 1.7, b.r * 2)
          // body
          g.fillStyle(b.color, 1)
          g.fillEllipse(b.x, b.y, b.r * 1.7, b.r * 2)
          // knot
          g.fillTriangle(b.x - 4, b.y + b.r, b.x + 4, b.y + b.r, b.x, b.y + b.r + 6)
          // highlight
          g.fillStyle(0xffffff, 0.4)
          g.fillEllipse(b.x - b.r * 0.35, b.y - b.r * 0.5, b.r * 0.5, b.r * 0.7)
          if (b.golden) {
            g.lineStyle(2, 0xffffff, 0.85)
            g.strokeEllipse(b.x, b.y, b.r * 1.7, b.r * 2)
          }
        }

        drawPop(g: Phaser.GameObjects.Graphics, b: Balloon) {
          const t = b.pop
          const alpha = 1 - t
          const rr = b.r * (1 + t * 1.2)
          g.lineStyle(3, b.color, alpha)
          for (let a = 0; a < 8; a++) {
            const ang = (a / 8) * Math.PI * 2
            const x1 = b.x + Math.cos(ang) * rr * 0.5
            const y1 = b.y + Math.sin(ang) * rr * 0.5
            const x2 = b.x + Math.cos(ang) * rr
            const y2 = b.y + Math.sin(ang) * rr
            g.lineBetween(x1, y1, x2, y2)
          }
        }

        draw() {
          const g = this.gfx
          g.clear()

          // soft clouds
          g.fillStyle(0xffffff, 0.5)
          g.fillEllipse(70, 90, 90, 34)
          g.fillEllipse(290, 150, 110, 40)
          g.fillEllipse(180, 60, 70, 26)

          for (const b of this.balloons) {
            if (b.alive) this.drawBalloon(g, b)
            else this.drawPop(g, b)
          }

          // top HUD bar
          g.fillStyle(0x1c3d5a, 0.85)
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
