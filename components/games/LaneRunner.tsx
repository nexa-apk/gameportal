'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const LANES = [60, 180, 300]
const PLAYER_Y = H - 74
const PLAYER_R = 22
const OBST_R = 22

type Obstacle = { lane: number; y: number }

export default function LaneRunner() {
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
        private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

        private obstacles: Obstacle[] = []
        private playerLane = 1
        private playerX = LANES[1]
        private score = 0
        private bestScore = 0
        private distance = 0
        private speed = 210
        private spawnTimer = 0
        private dashOffset = 0
        private running = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#3a3f4b')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(W / 2, 14, '0', {
            fontSize: '26px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5, 0).setDepth(3)

          this.cursors = this.input.keyboard?.createCursorKeys()

          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (!this.running) return
            if (p.x < W / 2) this.move(-1)
            else this.move(1)
          })

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('LANE RUNNER', 'Tap left or right (or use\nthe arrow keys) to switch\nlanes and dodge the cones.\nHow far can you run?')
        }

        move(dir: number) {
          this.playerLane = Phaser.Math.Clamp(this.playerLane + dir, 0, LANES.length - 1)
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 255 : 225
          const bg = this.add.rectangle(0, 0, 320, bh, 0x20232b, 0.95).setStrokeStyle(3, 0xf1c40f)
          const ty = hasScore ? -98 : -80
          const t = this.add.text(0, ty, title, {
            fontSize: '24px', color: '#f1c40f', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#bdc3c7', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 28, `Score: ${this.score}`, {
                fontSize: '18px', color: '#2ecc71', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 54, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#95a5a6', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 100 : 74
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#20232b', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#f1c40f', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.score = 0
          this.distance = 0
          this.speed = 210
          this.obstacles = []
          this.playerLane = 1
          this.playerX = LANES[1]
          this.spawnTimer = 0
          this.running = true
          this.overlay.setVisible(false)
          this.updateHud()
        }

        updateHud() {
          this.scoreText.setText(String(this.score))
        }

        endGame() {
          this.running = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('CRASH!', `You ran ${this.score} metres!`)
        }

        update(_time: number, delta: number) {
          const dt = delta / 1000
          if (this.running) {
            if (this.cursors) {
              if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.move(-1)
              if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.move(1)
            }

            this.speed = Math.min(470, 210 + this.distance * 0.05)
            this.distance += this.speed * dt
            this.score = Math.floor(this.distance / 40)
            this.updateHud()
            this.dashOffset = (this.dashOffset + this.speed * dt) % 60

            // smooth lane glide
            const targetX = LANES[this.playerLane]
            this.playerX += (targetX - this.playerX) * Math.min(1, dt * 14)

            this.spawnTimer += delta
            const interval = Math.max(430, 900 - this.score * 4)
            if (this.spawnTimer >= interval) {
              this.spawnTimer = 0
              this.obstacles.push({ lane: Math.floor(Math.random() * LANES.length), y: -OBST_R })
            }

            for (const o of this.obstacles) {
              o.y += this.speed * dt
              if (o.lane === this.playerLane && Math.abs(o.y - PLAYER_Y) < PLAYER_R + OBST_R - 12) {
                this.endGame()
                break
              }
            }
            this.obstacles = this.obstacles.filter((o) => o.y < H + OBST_R)
          }
          this.draw()
        }

        drawPlayer(g: Phaser.GameObjects.Graphics) {
          const x = this.playerX, y = PLAYER_Y
          g.fillStyle(0x000000, 0.18)
          g.fillEllipse(x, y + PLAYER_R + 4, PLAYER_R * 1.8, 10)
          g.fillStyle(0x2ecc71, 1)
          g.fillCircle(x, y, PLAYER_R)
          g.fillStyle(0xffffff, 1)
          g.fillCircle(x - 7, y - 5, 6)
          g.fillCircle(x + 7, y - 5, 6)
          g.fillStyle(0x20232b, 1)
          g.fillCircle(x - 6, y - 4, 3)
          g.fillCircle(x + 8, y - 4, 3)
        }

        drawObstacle(g: Phaser.GameObjects.Graphics, o: Obstacle) {
          const x = LANES[o.lane], y = o.y
          g.fillStyle(0x000000, 0.15)
          g.fillEllipse(x, y + OBST_R, OBST_R * 1.6, 8)
          // cone
          g.fillStyle(0xe67e22, 1)
          g.fillTriangle(x, y - OBST_R, x - OBST_R, y + OBST_R, x + OBST_R, y + OBST_R)
          g.fillStyle(0xffffff, 0.9)
          g.fillRect(x - OBST_R * 0.55, y, OBST_R * 1.1, 6)
        }

        draw() {
          const g = this.gfx
          g.clear()

          // road
          g.fillStyle(0x4b5162, 1)
          g.fillRect(0, 0, W, H)

          // lane divider dashes
          g.fillStyle(0xf1c40f, 0.85)
          for (let i = 1; i < LANES.length; i++) {
            const lx = (LANES[i] + LANES[i - 1]) / 2
            for (let dy = -60 + this.dashOffset; dy < H; dy += 60) {
              g.fillRect(lx - 3, dy, 6, 34)
            }
          }
          // road edges
          g.fillStyle(0xced6e0, 0.6)
          g.fillRect(6, 0, 5, H)
          g.fillRect(W - 11, 0, 5, H)

          if (this.running) {
            for (const o of this.obstacles) this.drawObstacle(g, o)
            this.drawPlayer(g)
          }

          // HUD backdrop
          g.fillStyle(0x3a3f4b, 0.85)
          g.fillRect(0, 0, W, 46)
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
