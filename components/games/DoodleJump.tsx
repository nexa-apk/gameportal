'use client'
import { useEffect, useRef } from 'react'

const W = 320, H = 480
const PLAT_W = 60, PLAT_H = 12, PLAYER_W = 30, PLAYER_H = 24
const GRAVITY = 1800, JUMP_VY = -700
const SPRING_VY = -1000

type Platform = { x: number; y: number; spring: boolean }

export default function DoodleJump() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private px = W / 2; private py = H - 100
        private pvx = 0; private pvy = 0
        private platforms: Platform[] = []
        private cameraY = 0
        private score = 0; private bestScore = 0
        private running = false
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
        private tiltX = 0

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#e8f4f8')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(W / 2, 10, 'Score: 0', { fontSize: '16px', color: '#333', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(2)
          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('DOODLE JUMP', '← → or tilt to move\nLand on platforms to jump!')
          this.cursors = this.input.keyboard!.createCursorKeys()

          this.input.on('pointerdown', (_p: Phaser.Input.Pointer) => { if (!this.running) this.startGame() })
          this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (this.running) this.tiltX = (p.x - W / 2) / (W / 2) * 250 })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 280, 200, 0xffffff, 0.95).setStrokeStyle(2, 0x4caf50)
          const t = this.add.text(0, -70, title, { fontSize: '22px', color: '#4caf50', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -25, sub, { fontSize: '12px', color: '#555', fontFamily: 'monospace', align: 'center', wordWrap: { width: 260 } }).setOrigin(0.5)
          const best = this.bestScore > 0 ? this.add.text(0, 15, `Best: ${this.bestScore}`, { fontSize: '14px', color: '#333', fontFamily: 'monospace' }).setOrigin(0.5) : null
          const sc = this.score > 0 ? this.add.text(0, best ? 38 : 15, `Score: ${this.score}`, { fontSize: '14px', color: '#e53e3e', fontFamily: 'monospace' }).setOrigin(0.5) : null
          const btn = this.add.text(0, 72, '[ JUMP! ]', { fontSize: '18px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#4caf50', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s, btn]
          if (best) items.push(best)
          if (sc) items.push(sc)
          this.overlay.add(items); this.overlay.setVisible(true)
        }

        startGame() {
          this.px = W / 2; this.py = H - 100; this.pvx = 0; this.pvy = JUMP_VY
          this.cameraY = 0; this.score = 0; this.tiltX = 0
          this.platforms = this.generatePlatforms()
          this.running = true; this.overlay.setVisible(false)
          this.scoreText.setText('Score: 0')
        }

        generatePlatforms(): Platform[] {
          const plats: Platform[] = [{ x: W / 2 - PLAT_W / 2, y: H - 60, spring: false }]
          let y = H - 60
          while (y > -2000) {
            y -= 60 + Math.random() * 50
            const x = Math.random() * (W - PLAT_W)
            plats.push({ x, y, spring: Math.random() < 0.1 })
          }
          return plats
        }

        extendPlatforms() {
          const topY = Math.min(...this.platforms.map(p => p.y))
          let y = topY
          while (y > this.cameraY - H) {
            y -= 60 + Math.random() * 50
            const x = Math.random() * (W - PLAT_W)
            this.platforms.push({ x, y, spring: Math.random() < 0.1 })
          }
          this.platforms = this.platforms.filter(p => p.y < this.cameraY + H + 100)
        }

        update(_: number, delta: number) {
          if (!this.running) return
          const dt = delta / 1000

          // Input
          const ax = this.cursors.left?.isDown ? -250 : this.cursors.right?.isDown ? 250 : this.tiltX
          this.pvx += (ax - this.pvx) * Math.min(1, dt * 10)

          // Physics
          this.pvy += GRAVITY * dt
          this.px += this.pvx * dt
          this.py += this.pvy * dt

          // Wrap X
          if (this.px > W + PLAYER_W / 2) this.px = -PLAYER_W / 2
          if (this.px < -PLAYER_W / 2) this.px = W + PLAYER_W / 2

          // Platform collision (only when falling)
          if (this.pvy > 0) {
            for (const p of this.platforms) {
              const screenY = p.y - this.cameraY
              const px = this.px - PLAYER_W / 2, py = this.py
              if (px + PLAYER_W > p.x && px < p.x + PLAT_W && py >= screenY + p.y - this.cameraY - 2 && py <= screenY + PLAT_H + 4) {
                if (this.py - this.cameraY >= p.y - this.cameraY && this.py - this.cameraY <= p.y - this.cameraY + PLAT_H + 8) {
                  this.pvy = p.spring ? SPRING_VY : JUMP_VY
                  break
                }
              }
            }
          }

          // Simple collision: check if player bottom touches platform top
          if (this.pvy > 0) {
            for (const p of this.platforms) {
              const playerBottom = this.py + PLAYER_H / 2
              const platTop = p.y - this.cameraY
              const playerLeft = this.px - PLAYER_W / 2, playerRight = this.px + PLAYER_W / 2
              const prevBottom = playerBottom - this.pvy * dt
              if (prevBottom <= platTop && playerBottom >= platTop &&
                  playerRight > p.x && playerLeft < p.x + PLAT_W) {
                this.py = platTop - PLAYER_H / 2
                this.pvy = p.spring ? SPRING_VY : JUMP_VY
                break
              }
            }
          }

          // Camera follows player up
          const playerScreenY = this.py - this.cameraY
          if (playerScreenY < H / 2) {
            const delta2 = H / 2 - playerScreenY
            this.cameraY -= delta2
            this.score = Math.max(this.score, Math.round(-this.cameraY / 5))
            this.scoreText.setText(`Score: ${this.score}`)
          }

          // Die if fallen off screen
          if (this.py - this.cameraY > H + 50) {
            this.bestScore = Math.max(this.bestScore, this.score)
            this.running = false; this.showOverlay('GAME OVER', `Height: ${this.score}`)
          }

          this.extendPlatforms()
          this.draw()
        }

        draw() {
          const g = this.gfx; g.clear()
          // BG gradient
          g.fillStyle(0xe8f4f8); g.fillRect(0, 0, W, H)
          // Platforms
          for (const p of this.platforms) {
            const sy = p.y - this.cameraY
            if (sy < -20 || sy > H + 20) continue
            if (p.spring) {
              g.fillStyle(0xff9900); g.fillRoundedRect(p.x, sy, PLAT_W, PLAT_H, 4)
              g.fillStyle(0xffdd00); g.fillRect(p.x + PLAT_W / 2 - 4, sy - 10, 8, 12)
            } else {
              g.fillStyle(0x4caf50); g.fillRoundedRect(p.x, sy, PLAT_W, PLAT_H, 4)
            }
          }
          // Player (doodle character)
          const psy = this.py - this.cameraY
          g.fillStyle(0x6be35d); g.fillRoundedRect(this.px - PLAYER_W / 2, psy - PLAYER_H / 2, PLAYER_W, PLAYER_H, 8)
          // Eyes
          g.fillStyle(0x000); g.fillCircle(this.px - 6, psy - 4, 3); g.fillCircle(this.px + 6, psy - 4, 3)
          // Nose
          g.fillStyle(0xff6666); g.fillCircle(this.px, psy, 4)
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
