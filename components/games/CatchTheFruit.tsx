'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const BASKET_Y = H - 46
const BASKET_W = 76
const BASKET_H = 30

const FRUIT_COLORS = [0xe74c3c, 0xe67e22, 0x2ecc71, 0x9b59b6, 0xf1c40f]

type FallItem = {
  x: number
  y: number
  vy: number
  kind: 'fruit' | 'bomb'
  color: number
  r: number
  active: boolean
}

export default function CatchTheFruit() {
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
        private livesText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

        private items: FallItem[] = []
        private basketX = W / 2
        private score = 0
        private bestScore = 0
        private lives = 3
        private running = false
        private spawnTimer = 0

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#fdf2e3')
          this.gfx = this.add.graphics()

          this.scoreText = this.add.text(12, 12, 'Score: 0', {
            fontSize: '18px', color: '#c0392b', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(2)
          this.livesText = this.add.text(W - 12, 12, '❤❤❤', {
            fontSize: '18px', color: '#e74c3c', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(2)

          this.cursors = this.input.keyboard?.createCursorKeys()

          this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (this.running) this.basketX = Phaser.Math.Clamp(p.x, BASKET_W / 2, W - BASKET_W / 2)
          })

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('CATCH THE FRUIT', 'Move the basket to catch\nfalling fruit. Avoid the\nbombs! Drag, or use the\narrow keys.')
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 255 : 225
          const bg = this.add.rectangle(0, 0, 320, bh, 0xffffff, 0.97).setStrokeStyle(3, 0xe67e22)
          const ty = hasScore ? -98 : -80
          const t = this.add.text(0, ty, title, {
            fontSize: '22px', color: '#e67e22', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 44, sub, {
            fontSize: '12px', color: '#555555', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 26, `Score: ${this.score}`, {
                fontSize: '18px', color: '#27ae60', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 54, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#999999', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 100 : 72
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
          this.lives = 3
          this.items = []
          this.basketX = W / 2
          this.spawnTimer = 0
          this.running = true
          this.overlay.setVisible(false)
          this.updateHud()
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          this.livesText.setText('❤'.repeat(Math.max(0, this.lives)))
        }

        spawnItem() {
          const bomb = Math.random() < 0.22
          const r = bomb ? 15 : 16
          this.items.push({
            x: r + Math.random() * (W - 2 * r),
            y: -r,
            vy: 130 + Math.random() * 40 + this.score * 3,
            kind: bomb ? 'bomb' : 'fruit',
            color: bomb ? 0x2c3e50 : FRUIT_COLORS[Math.floor(Math.random() * FRUIT_COLORS.length)],
            r,
            active: true,
          })
        }

        endGame() {
          this.running = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('GAME OVER', `You caught ${this.score} fruit!`)
        }

        update(_time: number, delta: number) {
          const dt = delta / 1000
          if (this.running) {
            // keyboard movement
            if (this.cursors) {
              const kbSpeed = 320
              if (this.cursors.left.isDown) this.basketX -= kbSpeed * dt
              if (this.cursors.right.isDown) this.basketX += kbSpeed * dt
              this.basketX = Phaser.Math.Clamp(this.basketX, BASKET_W / 2, W - BASKET_W / 2)
            }

            // spawn
            this.spawnTimer += delta
            const interval = Math.max(480, 1050 - this.score * 12)
            if (this.spawnTimer >= interval) {
              this.spawnTimer = 0
              this.spawnItem()
            }

            // move + collide
            for (const it of this.items) {
              if (!it.active) continue
              it.y += it.vy * dt
              const inBand = it.y + it.r >= BASKET_Y - BASKET_H / 2 && it.y - it.r <= BASKET_Y + BASKET_H / 2
              const inX = Math.abs(it.x - this.basketX) <= BASKET_W / 2 + it.r * 0.4
              if (inBand && inX) {
                it.active = false
                if (it.kind === 'fruit') {
                  this.score++
                  this.updateHud()
                } else {
                  this.lives--
                  this.updateHud()
                  this.cameras.main.shake(150, 0.01)
                  if (this.lives <= 0) { this.endGame(); break }
                }
              } else if (it.y - it.r > H) {
                it.active = false
              }
            }
            this.items = this.items.filter((it) => it.active)
          }

          this.draw()
        }

        drawFruit(g: Phaser.GameObjects.Graphics, it: FallItem) {
          g.fillStyle(0x000000, 0.12)
          g.fillCircle(it.x + 2, it.y + 2, it.r)
          g.fillStyle(it.color, 1)
          g.fillCircle(it.x, it.y, it.r)
          g.fillStyle(0xffffff, 0.35)
          g.fillCircle(it.x - it.r * 0.3, it.y - it.r * 0.35, it.r * 0.32)
          // little leaf
          g.fillStyle(0x2ecc71, 1)
          g.fillEllipse(it.x + 3, it.y - it.r - 2, 10, 6)
        }

        drawBomb(g: Phaser.GameObjects.Graphics, it: FallItem) {
          g.fillStyle(0x000000, 0.15)
          g.fillCircle(it.x + 2, it.y + 2, it.r)
          g.fillStyle(it.color, 1)
          g.fillCircle(it.x, it.y, it.r)
          g.fillStyle(0x7f8c8d, 1)
          g.fillCircle(it.x - it.r * 0.3, it.y - it.r * 0.3, it.r * 0.28)
          // fuse
          g.lineStyle(2, 0x8b5a2b, 1)
          g.lineBetween(it.x, it.y - it.r, it.x + 5, it.y - it.r - 8)
          g.fillStyle(0xf39c12, 1)
          g.fillCircle(it.x + 6, it.y - it.r - 9, 3)
        }

        draw() {
          const g = this.gfx
          g.clear()

          // ground strip
          g.fillStyle(0xd4edc4, 1)
          g.fillRect(0, BASKET_Y + 6, W, H - BASKET_Y)

          // items
          for (const it of this.items) {
            if (it.kind === 'fruit') this.drawFruit(g, it)
            else this.drawBomb(g, it)
          }

          // basket
          const bx = this.basketX
          g.fillStyle(0x8b5a2b, 1)
          g.fillRect(bx - BASKET_W / 2, BASKET_Y - BASKET_H / 2, BASKET_W, BASKET_H)
          g.fillStyle(0xa9744f, 1)
          g.fillRect(bx - BASKET_W / 2, BASKET_Y - BASKET_H / 2, BASKET_W, 7)
          g.lineStyle(2, 0x6b4423, 1)
          for (let i = 1; i < 5; i++) {
            const lx = bx - BASKET_W / 2 + (BASKET_W / 5) * i
            g.lineBetween(lx, BASKET_Y - BASKET_H / 2 + 7, lx, BASKET_Y + BASKET_H / 2)
          }

          // top HUD bar
          g.fillStyle(0xfdf2e3, 0.9)
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
